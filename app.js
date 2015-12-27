/*jshint node:true*/

// **************************************
// * (C) Copyright 2014   IBM Corp.     *
// * All Rights Reserved.               *
// **************************************
//
// app.js
// This file contains the server side JavaScript code for the starter application.
// This starter application uses express as its web application framework and jade
// as its template engine.

var https = require('https');
var express = require('express');
var mqtt = require('mqtt');
var async = require('async');

// Setup middleware
var app = express();
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// Array used to reflect the status of the 5 majors steps of this app on its web UI.
var status_step = ["Pending", "Pending", "Pending", "Pending", "Pending"];

// Render index page of the app's single page web UI
app.get('/', function(req, res){
    res.render('index', {'events':events, 'status':status_step, 'eventTarget':eventTarget});
});

// Start the app using some of the values from process.env, i.e. the IP address and 
// port of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port + '\n');


//////////
// Step 1:  Extract the environment information required to use the Geospatial Analytics REST API.
//////////

// VCAP_SERVICES contains all the credentials of services bound to this application.
// For details of its content, please refer to the document or sample of each service.

// Declare variables for portions of the VCAP_SERVICES we will save and use in this app
var geo_props = {};
var service_name = {};

// Parse VCAP_SERVICES
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
	
    // For reference, echo names and values for each bound service to the log
    for (var svcName in env) 	{
        console.log(svcName);
    }
    console.log(env);

    // Find the Geospatial Analytics service
    if (env['Geospatial Analytics']) {
        geo_props = env['Geospatial Analytics'][0]['credentials'];
        console.log('Geospatial Analytics credentials: ');
        console.log(geo_props);
        service_name = env['Geospatial Analytics'][0]['name'];
        status_step[0] = "Completed";
    }
    else {
        console.log('You must bind the Geospatial Analytics service to this application');
        status_step[0] = "Failed - Application must be bound to Geospatial Analytics service.";
        process.exit(1);
    }
}
else {
    process.exit(1);
}

// Load variables that will be used in the remaining steps

// Authorization information for all REST calls
var authbuf = 'Basic ' + new Buffer(geo_props.userid + ':' + geo_props.password).toString('base64');

// Notification topic used in starting the service and subscribing to events
var notify_topic_string = 'bluemix-geo/' + service_name + '/events';
notify_topic_string = notify_topic_string.replace(/\s/g,''); // Remove any spaces

var all_events = [];
var events = [];
var eventCount = 0;
var eventTarget = 100;
var Event = function(number, evt) {  
    this.Number = number;  
    this.EventString = evt;  
};

// Steps 2 through 5 are run inside an async series.  Since Node.js is asynchronous by 
// default, the series is needed to keep the steps from running at the same time.  While
// steps 2, 3 and 4 can probably execute correctly in parallel, step 5 needs them all to
// complete before it is run.  The series also makes the execution of the starter app
// easier to follow on its web UI.

async.series(
  [

    //////////
    // Step 2:  Start the Geospatial Analytics service, connecting it to an MQTT demo server.
    //////////

    function(callback) {
      //
      // Begin - PUT start
      //
      status_step[1] = "Starting";
      console.log("\nUsing the Geospatial Analytics REST API to start the service.");
      console.log("Preparing to call start API");     

      // create the JSON object
      jsonObject = JSON.stringify({
        "mqtt_uri" :  "mqtt1.m2m4connectedlife.com:1883",
        "mqtt_input_topics" : "iot-2/cars/#",
        "mqtt_notify_topic" : notify_topic_string,
        "device_id_attr_name" : "ID",
        "latitude_attr_name" : "lat",
        "longitude_attr_name" : "lon"
      });
      console.info('start parameters: ' + jsonObject);

      // prepare the header
      var putheaders = {
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(jsonObject, 'utf8'),
        'Authorization' : authbuf
      };
 
      // set the put options
      var optionsput = {
        host : geo_props.geo_host,
        port : geo_props.geo_port,
        path : geo_props.start_path,
        method : 'PUT',
        headers : putheaders
      }; 
      console.info('Options prepared:');
      console.info(optionsput);

      console.log('Perform the PUT-start call');
      var reqPut = https.request(optionsput, function(res) {
 
        res.on('data', function(d) {
          var dateStr = new Date().toISOString();
          console.log('PUT-start result: ' + d);
          console.log('PUT-start completed at: ' + dateStr);
          console.log('statusCode: ', res.statusCode + '\n\n');
        });

        // Make callback for async series after the http response
        if (res.statusCode == 200 || res.statusCode == 409){
          // Status of 200 means ok, status of 409 means service was already started
          status_step[1] = "Completed";
          callback(null, null);  
        }
        else {
          status_step[1] = "Failed";
          callback(res.statusCode, null);
        }        
      });
 
      // write the json data
      reqPut.write(jsonObject);
      reqPut.end();
      reqPut.on('error', function(e) {
        console.error(e);
      });

      //
      // Put-start end
      //
    },

    //////////
    // Step 3:  Create three geographic regions for the service to monitor.
    //////////

    function(callback) {
      //
      // Begin - PUT addRegion
      //
      console.log("Using the Geospatial Analytics REST API to add three regions to monitor.");
      console.log("Preparing to call addRegion API");

      // create the JSON object
      jsonObject = JSON.stringify({
        "regions" : [
          {
           "region_type" : "regular", 
           "name" : "Promo Zone 1", 
           "notifyOnExit" : "false", 
           "center_latitude" : "36.121", 
           "center_longitude" : "-115.224", 
           "number_of_sides" : "10", 
           "distance_to_vertices" : "850"
          },
          {
           "region_type" : "regular", 
           "name" : "Promo Zone 2", 
           "notifyOnExit" : "false", 
           "center_latitude" : "36.121", 
           "center_longitude" : "-115.101", 
           "number_of_sides" : "10", 
           "distance_to_vertices" : "750"
          },
          { 
           "region_type" : "custom", 
           "name" : "Tracking Path", 
           "notifyOnExit" : "true", 
           "polygon" : [ 
   		{"latitude" : "36.135795", "longitude" : "-115.148584"},
		{"latitude" : "36.134096", "longitude" : "-115.148584"},
		{"latitude" : "36.133247", "longitude" : "-115.147254"},
		{"latitude" : "36.131427", "longitude" : "-115.147254"},
		{"latitude" : "36.131427", "longitude" : "-115.148327"},
		{"latitude" : "36.132849", "longitude" : "-115.148327"},
		{"latitude" : "36.133698", "longitude" : "-115.149657"},
		{"latitude" : "36.135795", "longitude" : "-115.149657"}
           ]
          },
        ]
      });
      console.info('addRegion parameters: ' + jsonObject);

      // prepare the header
      putheaders = {
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(jsonObject, 'utf8'),
        'Authorization' : authbuf
      };
 
      // set the put options
      optionsput = {
        host : geo_props.geo_host,
        port : geo_props.geo_port,
        path : geo_props.add_region_path,
        method : 'PUT',
        headers : putheaders
      };
      console.info('Options prepared:');
      console.info(optionsput);
 
      console.log('Perform the PUT-addRegion call');
      reqPut = https.request(optionsput, function(res) {

        res.on('data', function(d) {
          var dateStr = new Date().toISOString();
          console.log('PUT-addRegion result: ' + d);
          console.log('PUT-addRegion completed at: ' + dateStr);
          console.log('statusCode: ', res.statusCode + '\n\n');

          // Make callback for async series after the http response
          if (res.statusCode == 200) {
            status_step[2] = "Completed";
            callback(null, null);  
          }
          else {
            status_step[2] = "Failed";
            callback(res.statusCode, null);
          }
        });
      });
 
      // write the json data
      reqPut.write(jsonObject);
      reqPut.end();
      reqPut.on('error', function(e) {
        console.error(e);
      });

      //
      // Put-addRegion end
      //
    },

    //////////
    // Step 4:  Process events generated when devices enter and exit the region.
    //////////
    
    function (callback) {
      // Retrieve the events being published to MQTT from the service.
      console.log("Subscribing to events that Geospatial Analytics will publish to MQTT.");
      // Create a MQTT clientId (appending port value to make semi-unique)
      var clientId = 'geo-quickstart:' + port;
      //create the MQTT client and subscribe
      client = mqtt.createClient(1883,"mqtt1.m2m4connectedlife.com", { "clientId": clientId } );
      console.log("Subscribing to topic: " + notify_topic_string + "\n");
      client.subscribe(notify_topic_string);
      status_step[3] = "Processing Events";

      client.on('message', function (topic, message){
        console.log("Message received.");
        try {
          var payload = JSON.parse(message);
          eventCount++;
          console.log("Event total = " + eventCount);
          console.log("Message contents: " + message);
          // Add event to the array used by the web user interface
          all_events.push(new Event(eventCount, payload));

          // Create an array of the last 250 events, with the more recent events first
          events = all_events.slice(-250).reverse();

          if (eventCount >= eventTarget) {
            status_step[3] = "Completed";
            console.log("\nTarget event count has been reached.  Geospatial Analytics service will be stopped.\n");
            callback(null, null);
          }
        } 
        catch (e) { 
          console.err(e); 
        }
      });
    },

    //////////
    // Step 5:  Stop the Geospatial Analytics service after the event target is reached.
    //////////

    function (callback) {
      //
      // Begin - PUT stop
      //
      console.log("Using the Geospatial Analytics REST API to stop the service.");
      console.log("Preparing to call stop API");

      // create the JSON object
      jsonObject = JSON.stringify({});

      // prepare the header
      putheaders = {
        'Content-Type' : 'application/json',
        'Content-Length' : Buffer.byteLength(jsonObject, 'utf8'),
        'Authorization' : authbuf
      };
 
      // the put options
      optionsput = {
        host : geo_props.geo_host,
        port : geo_props.geo_port,
        path : geo_props.stop_path,
        method : 'PUT',
        headers : putheaders
      };
      console.info('Options prepared:');
      console.info(optionsput);

      console.info('Perform the PUT-stop call');
      reqPut = https.request(optionsput, function(res) {

        res.on('data', function(d) {

          var dateStr = new Date().toISOString();
          console.log('PUT-stop result: ' + d);
          console.log('PUT-stop completed at: ' + dateStr);
          console.log('statusCode: ', res.statusCode + '\n\n');

          // Make callback for async series after the http response
          if (res.statusCode == 200) {
            status_step[4] = "Completed";
            callback(null, null);  
          }
          else {
            status_step[4] = "Failed";
            callback(res.statusCode, null);
          }
        });
      });

      // write the json data
      reqPut.write(jsonObject);
      reqPut.end();
      reqPut.on('error', function(e) {
        console.error(e);
      });

      //
      // Put-stop end
      //

        callback(null, null);
    
      },

      ],
        function(err, response) {
            // response is ['Node.js', 'JavaScript']
        }
    ); // End of async series


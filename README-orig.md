#Geospatial Analytics Starter Application
The starter application demonstrates how to configure and control the Geospatial Analytics service through its REST API. The application is written in Node.js. You can modify the application code and push your changes back to the Bluemix environment.

Licensed under the Apache License (see [License.txt](https://hub.jazz.net/project/streamscloud/geo-starter/overview#https://hub.jazz.net/gerrit/plugins/gerritfs/contents/streamscloud%252Fgeo-starter/refs%252Fheads%252Fmaster/License.txt)).

## Getting Bluemix ready for the starter application

To get Bluemix ready for the Geospatial Analytics starter application, you need to:
1. Sign up for [Bluemix](https://ace.ng.bluemix.net/) and log in.

- [Install the cf command-line tool](https://www.ng.bluemix.net/docs/#starters/BuildingWeb.html#install_cf).

- Create an application in the Bluemix web interface using the **SDK for Node.js** runtime. Remember the name you give your application, you will need it later on. 

- Add the Geospatial Analytics service to your application from the Bluemix web interface.


## Pushing the starter application into Bluemix

After you meet these prerequisites, you are ready to download and push the starter application to Bluemix:

1. Click the **EDIT CODE** button in this browser tab.

- Select **File > Export > Zip** from the menu. Save the .zip file.

- After the download completes, extract the .zip file.

- Rename the directory that contains the extracted files to match the name you gave your application in Bluemix earlier.
		
- On the command line, `cd` to the renamed directory. For example:
		cd myapp
		
- Connect to Bluemix:

		cf api https://api.ng.bluemix.net

- Log into Bluemix and set your target org when prompted:

		cf login

- Deploy your app. For example:

		cf push myapp

- Access your app from the dashboard in Bluemix.



##Required components
The following components are required by the Geospatial Analytics starter application. These components are documented in the [package.json](https://hub.jazz.net/project/streamscloud/geo-starter/overview#https://hub.jazz.net/gerrit/plugins/gerritfs/contents/streamscloud%252Fgeo-starter/refs%252Fheads%252Fmaster/package.json) file. 
- express
- jade
- async
- mqtt
- Node.js

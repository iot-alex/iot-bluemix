Get started with your Geospatial Analytics Starter App
-----------------------------------
Welcome to the Geospatial Analytics service! Use the starter application written in Node.js to learn about monitoring when devices are within geographical regions of interest.

To add or update the Geospatial Analytics starter application:

1. [Install the cf command-line tool](http://www.ng.bluemix.net/docs/#starters/BuildingWeb.html#install_cf).

- Download the starter application from [IBM DevOps Services](https://hub.jazz.net/git/streamscloud/geo-starter). Click the **EDIT CODE** button and select **File > Export > Zip** from the menu. Save the .zip file.

- After the download completes, extract the .zip file.

- Rename the directory that contains the extracted files to match the name of your application in Bluemix (shown as **myapp** in these instructions).

- In a shell window, `cd` to the directory:

		cd myapp

- Connect to BlueMix using your API URL. Typically, this is *http://api* followed by your Bluemix URL. For example, *http://api.ng.bluemix.net*.

		cf api api-url

- Log into BlueMix:

		cf login

- Deploy your app:

		cf push myapp

- Access your app from the dashboard in Bluemix.

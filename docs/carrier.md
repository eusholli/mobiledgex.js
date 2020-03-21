# Understanding and Using the MobiledgeX Edge Carrier Concept

Edge infrastructure is highly distributed and will consist of 1000's of locations that are available for use at any time.  Different networks of these locations will exist and for this reason MobiledgeX has created the concept of an 
"edge carrier" to enable an application developer to be able to choose which cluster of locations they wish to be able to deploy into.  This concept is modeled on the existing mobile operator carrier concept, where a subscriber is a customer of one mobile carrier but can also use other carriers locations where and when best and most appropriate. In the case of the mobile subscriber, this is all automatically handlded by the underlying mobile network system and in the same way, the edge carrier operations are all handled automatically by the MobiledgeX Edge-Cloud platform.  For more information on MobiledgeX Edge-Cloud please see [here](https://mobiledgex.com/product).

Where the concept differs from that of the mobile operator carrier concept is that the edge carrier is not defined by either an access network or ownership of the underlying infrastructure.  An edge carrier may consist of locations that are on-premise, in telecom networks and in public clouds.  This follows the [Seamster](https://seamster.io/framing-the-edge-discussion) 4-edge model of edge computing that recognizes the existence of many different types of edge that will co-exist and need to seamlessly work together.  The MobiledgeX platform seamlessly works across all types of edge using the [cloudlet](https://mobiledgex.com/product/cloudlets) abstraction concept.  

The [mobiledgedgx.js](https://github.com/eusholli/mobiledgex.js) SDK is designed to help developers seamlessly move from local development to network development to full production operations on commercial edge networks.  To enable this three types of edge carrier are defined within the SDK.

 * localhost
 * wifi
 * production edge carrier

 ## localhost

 For initial local machine development, the SDK can be configured to route all application requests to a locally running process. This is enabled by special SDK config (that can be removed when moving into the network) and using special edge carrier name "localhost".  All code development can be local.  
 
 ### Local Development

```javascript
const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0"; // the version of your application
const carrierName = "localhost" // force the SDK to use the local Distributed Matching Engine (DME)
...

 // Initialize the localhost DME
initLocalhostDME({
    "MobiledgeX SDK Demo": {
        url: 'localhost:8080'
    }
})

...

let gpsLocation = new GPSLocation();
gpsLocation.setLocation(
        latitude,
        longitude,
        horizontal_accuracy,
        timestamp = null,
        course = 0,
        speed = 0,
        vertical_accuracy = 0,
        altitude = 0
    );

// OR in browser use the HTML5 getCurrentPositionCall
gpsLocation.getCurrentPosition();

...

let client = new MobiledgeXClient(devName, appName, appVersionStr);
client.registerClient(carrierName).then(userData => {

    client.findClosestCloudlet(gps_location).then(url => {
        console.log('localhost: ' + url);
    }).catch(error => {
        console.log("Error" + error);
    });
})

// OR simple one call SDK function

findClosestCloudlet(devName, appName, appVersionStr, carrierName, gps_location).then(url => {
    console.log('localhost: ' + url);
}).catch(error => {
    console.log("Error" + error);
});

// Use the returned url to access your backend directly
...
```

## wifi, production edge carrier
 
 If the application backend is developed in a container, it can easily be uploaded and placed under MobiledgeX Edge-Cloud management via the [MobiledgeX Operational Console](https://console.mobiledgex.net/). Deployment policies can be defined for each application within the console, that will then define where, when and how the application backend will deployed across the chosen edge carrier locations.  Access to the [MobiledgeX Operational Console](https://console.mobiledgex.net/) and thus the live MobiledgeX Edge-Cloud platform is managed through the MobiledgeX Early Access Program.  For more information please see [here](https://mobiledgex.com/early-access). If you aspire to be an edge carrier operator and are interested in hosting an early access program in your region then we would love to hear from you [here](https://mobiledgex.com/about/contact).

Creating [real cloudlets](https://mobiledgex.com/product/cloudlets) sometimes has a organizational lead time (getting access to infrastructure, satisfying necessary security requirements etc).  To enable market engagement quickly and simply we support local event based "edge-in-a-box" cloudlet deployments, for hackathons, demonstrations and market showcases.  These are local on-premise cloudlets that can be configured in minutes and accessed via local wifi.  Therefore we use the edge carrier name "wifi" for these types of configurations.  

For this edge carrier configuration, the only differences in source code are the change to the carrier name and the deletion of the local config with the initLocalhostDME SDK call.

### Network Based Cloudlet Development

```javascript
const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0"; // the version of your application
const carrierName = "wifi" // use the network based Distributed Matching Engine (DME)

...

let gpsLocation = new GPSLocation();
gpsLocation.setLocation(
        latitude,
        longitude,
        horizontal_accuracy,
        timestamp = null,
        course = 0,
        speed = 0,
        vertical_accuracy = 0,
        altitude = 0
    );

// OR in browser use the HTML5 getCurrentPositionCall
gpsLocation.getCurrentPosition();

...

let client = new MobiledgeXClient(devName, appName, appVersionStr);
client.registerClient(carrierName).then(userData => {

    client.findClosestCloudlet(gps_location).then(url => {
        console.log('localhost: ' + url);
    }).catch(error => {
        console.log("Error" + error);
    });
})

// OR simple one call SDK function

findClosestCloudlet(devName, appName, appVersionStr, carrierName, gps_location).then(url => {
    console.log(carrierName + ': ' + url);
}).catch(error => {
    console.log("Error" + error);
});

// Use the returned url to access your backend directly
...
```

When wanting to move to full production operation, the only change required is the change of the edge carrier name (localhost or wifi) to your commercially chosen edge carrier name. The application will then be deployed to the appropriate locations when needed, based on the deployment policy specified per application.


 

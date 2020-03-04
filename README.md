# mobiledgex.js
Javascript Client SDK for MobiledgeX

[![travis build](https://img.shields.io/travis/eusholli/mobiledgex.js?style=flat-square)](https://travis-ci.com/eusholli/mobiledgex.js)
[![codecov coverage](https://img.shields.io/codecov/c/github/eusholli/mobiledgex.js?style=flat-square)](https://codecov.io/gh/eusholli/mobiledgex.js)
[![version](https://img.shields.io/npm/v/mobiledgex.js?style=flat-square)](npm.im/mobiledgex.js)
[![downloads](https://img.shields.io/npm/dw/mobiledgex.js?style=flat-square)](http://npm-stat.com/charts.html?package=mobiledgex.js&from=2020-03-01)
[![APACHE 2 License](https://img.shields.io/github/license/eusholli/mobiledgex.js?style=flat-square)](https://github.com/eusholli/mobiledgex.js/blob/master/LICENSE)

## Introduction

The base service of MobiledgeX Edge-Cloud R2.0 is to find the closest location possible to run a supporting application backend based on the current location of the client front end.  The application backend is deployed to this location by the Edge-Cloud platform, and the SDK call findClosestCloudlet returns a url that the client can use to connect.  The url returned does not include a protocol header such as https:// etc. This allows the application client and application backend to use the protocol of their choice to communicate.

The SDK has implemented findClosestCloudlet in two ways.
 - A simple standalone call where all arguments required are passed in at each invocation
 - Using a JavaScript object where findClosestCloudlet is one method out of many on the object.  Use of the Javascript object prepares for more services being exposed by the MobiledgeX Edge-Cloud platform in the future, which will be exposed as new method calls in the object. It also allows for a more efficient use of the Edge-Cloud system if multiple calls are made per application to update the location of the closest cloudlet during the same session.

For more information about MobiledgeX Edge-Cloud please visit the MobiledgeX website [here](https://mobiledgex.com).
If you are interested to learn more about potential use cases where this capability is needed, please the open community edge use case initiative [here](https://seamster.com). We hope you join and also start to contribute.

The supporting library is published [here](https://www.npmjs.com/package/mobiledgex.js).

For information on other more advanced SDKs, for Android, IOS and Unity for example, please see [here](https://developers.mobiledgex.com).

## Tested Environment

This code has only been tested on MacOS Catalina.  

### Operating system

- macOS Catalina 10.15.3

**RELEASE-NOTE-2** - The author has only validated this works in a macbook environment. There are no known reasons why it should not also work on Windows and/or Linux.  Any help in validating/ensuring this is appreciated.

## How to Use the SDK

There is a multi-level approach to edge development
 - First developing completely independantly on your local machine
 - Then maybe developing on a "cloudlet-in-a-box" environment, probably on a wifi network and most likely the environment found at supporting Seamster hackathon events)
 - And finally to deploying on real cloudlets that exist in live networks and datacenters.  This final step most likely happens through acceptance in the Early Access Programs that are happening with different operators in different parts of the world.  For more information on this please see here](https://mobiledgex.com/early-access).

# Installing

For node.js development
```
npm i mobiledgex.js
```

For browser development
```javascript
<script type="text/javascript" src="https://unpkg.com/mobiledgex.js/dist/index.umd.min.js"></script>
```

For browser deployment in production (minified javascript file)
```javascript
<script type="text/javascript" src="https://unpkg.com/mobiledgex.js/dist/index.umd.min.js"></script>
```

### Standalone findClosestCloudlet API call - Local Development

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

findClosestCloudlet(devName, appName, appVersionStr, carrierName, gps_location).then(url => {
    console.log('localhost: ' + url);
}).catch(error => {
    console.log("Error" + error);
});

// Use the returned url to access your backend directly
...
```

### Standalone findClosestCloudlet API call - Cloudlet-in-a-box, Live Cloudlets 

To develop against "real" infrastructure requies access to the [MobiledgeX Management Console](https://console.mobiledgex.net/) and to have followed the developer instructions on how to upload your application backend and place it under the deployment management of the MobiledgeX Edge-Cloud sytem. See [here](https://developers.mobiledgex.com/guides-and-tutorials/hello-world#step-3).

This now uses the actual distributed matching engine (DME) by using the carrier name "wifi" rather than "localhost".  It will now be necessary to have network connectivity from your development machine.

```javascript
const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0"; // the version of your application
// const carrierName = "localhost" 
const carrierName = "wifi" // force the SDK to use the real Distributed Matching Engine (DME)
...

 // localhost DME configuration no longer neede
/*
initLocalhostDME({
    "MobiledgeX SDK Demo": {
        url: 'localhost:8080'
    }
})
*/
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

findClosestCloudlet(devName, appName, appVersionStr, carrierName, gps_location).then(url => {
    console.log('wifi: ' + url);
}).catch(error => {
    console.log("Error" + error);
});

// Use the returned url to access your backend directly
...
```

### SDK Javascript object findClosestCloudlet API call

Replace the standalone findCloudletCall with the below

```javascript
let client = new MobiledgeXClient(devName, appName, appVersionStr);
client.registerClient().then(userData => {

    client.findClosestCloudlet(carrierName, gps_location).then(url => {
        console.log('localhost: ' + url);
    }).catch(error => {
        console.log("Error" + error);
    });
})
```

For working examples of this code fully implemented (not done yet) please see
 * [cloudletping](https://github.com/eusholli/cloudletping)
 * [imagebus](https://github.com/eusholli/imagebus) - WebRTC Producer process

## Further Notes

**To be done**
For deployments on supporting carrier mobiles, the location and best cloudlet are automatically found using the MNC-MCC coding.  See the [Android SDK](https://developers.mobiledgex.com/guides-and-tutorials/how-to-add-edge-support-to-an-android-app) for how this is done for Android app development today.
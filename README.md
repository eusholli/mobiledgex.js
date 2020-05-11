# mobiledgex.js
Javascript Client SDK for MobiledgeX

[![travis build](https://img.shields.io/travis/eusholli/mobiledgex.js?style=flat-square)](https://travis-ci.com/eusholli/mobiledgex.js)
[![codecov coverage](https://img.shields.io/codecov/c/github/eusholli/mobiledgex.js?style=flat-square)](https://codecov.io/gh/eusholli/mobiledgex.js)
[![version](https://img.shields.io/npm/v/mobiledgex.js?style=flat-square)](npm.im/mobiledgex.js)
[![downloads](https://img.shields.io/npm/dw/mobiledgex.js?style=flat-square)](http://npm-stat.com/charts.html?package=mobiledgex.js&from=2020-03-01)
[![APACHE 2 License](https://img.shields.io/github/license/eusholli/mobiledgex.js?style=flat-square)](https://github.com/eusholli/mobiledgex.js/blob/master/LICENSE)

## Introduction

The base service of MobiledgeX Edge-Cloud R2.0 is to find the "best" location possible to run a supporting application backend based on the current location of the client front end.  The definition of "best" is defined per application via a policy that is associated to the application using the [MobiledgeX management console](https://console.mobiledgex.net/). The application backend is deployed to this location by [MobiledgeX Edge-Cloud](https://mobiledgex.com/product), and the SDK call findCloudlet returns a url that the client can use to connect.  The url returned does not include a protocol header such as https:// etc. This allows the application client and application backend to use the protocol of their choice to communicate.

The SDK has implemented findCloudlet in two ways.
 - A simple standalone call where all arguments required are passed in at each invocation
 - Using a JavaScript object where findCloudlet is one method out of many on the object.  Use of the Javascript object prepares for more services being exposed by MobiledgeX Edge-Cloud in the future, which will be exposed as new method calls in the object. It also allows for a more efficient use of the Edge-Cloud system if multiple calls are made per application to update the location of the closest cloudlet during the same session.

For more information about MobiledgeX Edge-Cloud please visit the MobiledgeX website [here](https://mobiledgex.com).
If you are interested to learn more about potential use cases where this capability is needed, please join [Seamster](https://seamster.com) an initiative for sharing of edge market insights, education and best examples of use cases.  We hope you join and also start to contribute.

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
 - Then maybe developing on a "cloudlet-in-a-box" environment, probably on a wifi network (and most likely the environment found at supporting Seamster hackathon events)
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

 ## How to use the SDK

### The Controller Concept

MobiledgeX Edge-Cloud manages the real time deployment of the application backend to the wanted [cloudlet](https://mobiledgex.com/product/cloudlets) locations around the world and then dynamically establishes client sessions with the "best" supporting deployment instance.  Cloudlets are clustered under different "controllers" depending on who is offering the collection of locations and/or geographic location and/or whether public or private and so on.  There are two ways for a developer to choose which controller to use.

1. Explicitly by name
2. SDK "finds" the best controller it can based on client GPS location

Currently there are 4 controllers real-world controllers available

* eu-mexdemo - for Europe
* us-mexdemo - for North America
* kr-mexdemo - for South Korea and Eastern Asian 
* jp-mexdemo - for Japan 

For initial development and testing, the SDK supports a special controller named 'localhost' that allows standalone development on a local machine without the need for any MobiledgeX console registration or configuration.  

To first understand how to use the SDK, let us start with the localhost controller as an example.

### Standalone findCloudlet API call - Local Development

When developing towards the special localhost controller it is necessary to setup local configuration.  Note no remote HTTP calls are made at all in this scenario but rather the SDK returns the wanted configuration while obeying the behaviour and responses of the real controllers.  

To define the initial configuration make the following call.

```javascript

 // Initialize the localhost Controller
initLocalhostController({
    "MobiledgeX SDK Demo": {
        org_name: orgName,
        app_version: appVersionStr,
        fqdn: 'localhost:8080',
        response: {}
    }
});
```

The simplest call to make is the standalone findCloudlet call.  To make the SDK use the client GPS location to choose the "best" controller it can, simply do not pass the controller name as an argument to the call.

```javascript
const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0"; // the version of your application
const controller = "localhost" // force the SDK to use the local controller
...

 // Initialize the localhost Controller
initLocalhostController({
    "MobiledgeX SDK Demo": {
        org_name: orgName,
        app_version: appVersionStr,
        fqdn: 'localhost:8080',
        response: {}
    }
});
...

let gpsLocation = new GPSLocation();

// find current GPS location (in browser use the HTML5 navigator.geolocation.getCurrentPosition() ) 

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

...

/* SDK selects most appropriate controller based on client GPS location
   and returns best application backend url based on client GPS location */
findCloudlet(devName, appName, appVersionStr, gpsLocation).then(response => {
    console.log('localhost: ' + response.url); //'localhost:8080'
}).catch(error => {
    console.log(error);
});

/* SDK uses named controller ('localhost')
   and returns best application backend url based on client GPS location */
findCloudlet(devName, appName, appVersionStr, gpsLocation, 'localhost').then(response => {
    console.log('localhost: ' + response.url); //'localhost:8080'
}).catch(error => {
    console.log(error);
});

// Use the returned url to access your backend directly
...
```
 **NOTE!**  If initLocalhostController is not called and **NOT** passing in the explicit controller name, the SDK does not know you are wanting to use localhost and will try to resolve the best real-world controller in its response.  

 ### SDK Javascript object findCloudlet API call

 The SDK supports a client model allowing multiple calls to findCloudlet today, and in the future will allow other calls as they are released on Edge-Cloud.  In this case the optional controller can be defined with client creation.  If the explicit controller name is not defined, the client GPS location must be passed as an argument in the client.registerClient call and the SDK will choose the "best" controller it can.  The "best" cloudlet url is returned from the client.findCloudlet call using the mandatory GPS location passed in there.

When not explicitly naming the controller, replace the standalone findCloudletCall with the below

```javascript

// Create client without named controller
let client = new MobiledgeXClient(devName, appName, appVersionStr);

// no controller named so client GPS location must be passed in registerClient call

let gpsLocation = new GPSLocation();

// find current GPS location (in browser use the HTML5 navigator.geolocation.getCurrentPosition() ) 

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

client.registerClient(gpsLocation).then(response => {

    client.findClosestCloudlet(gpsLocation).then(response => {
        console.log(response.url);
    }).catch(error => {
        console.log(error);
    });
})
```

When **explicitly** naming the controller, replace the standalone findCloudletCall with the below

```javascript

// Create client without named controller
let controller = 'localhost';
let client = new MobiledgeXClient(devName, appName, appVersionStr, controller);

let gpsLocation = new GPSLocation();

// find current GPS location (in browser use the HTML5 navigator.geolocation.getCurrentPosition() ) 

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

// controller is named so so GPS location not needed in registerClient call
client.registerClient().then(response => {

    client.findClosestCloudlet(gpsLocation).then(response => {
        console.log(response.url);
    }).catch(error => {
        console.log(error);
    });
})
```

### Using Real Controller and Real Cloudlets 

To develop against "real" infrastructure requires access to the [MobiledgeX Management Console](https://console.mobiledgex.net/) and to have followed the developer instructions on how to upload your application backend and place it under the deployment management of the MobiledgeX Edge-Cloud sytem. See [here](https://developers.mobiledgex.com/guides-and-tutorials/hello-world#step-3).  For all developer documentation please see [here](https://developers.mobiledgex.com/).

This now uses the actual controllers by replacing "localhost" with one of the real controllers and/or letting the SDK select the most appropriate controller based on the client GPS location.  It will now be necessary to have network connectivity from your development machine.

**REMEMBER!**  Remove any 'initLocalhostController' calls if not naming the controller explicitly.

For working examples of this code fully implemented (not done yet) please see
 * [cloudletping](https://github.com/eusholli/cloudletping)
 * [imagebus](https://github.com/eusholli/imagebus) - WebRTC Producer process

## Further Notes

**To be done**
For deployments on supporting carrier mobiles, the location and best cloudlet are automatically found using the MNC-MCC coding.  See the [Android SDK](https://developers.mobiledgex.com/guides-and-tutorials/how-to-add-edge-support-to-an-android-app) for how this is done for Android app development today.

## For Library Developers, People Who Want to Contribute

The library has a fully integrated developer pipeline using the following tools.

* Travis-ci.org - https://travis-ci.org/github/eusholli/mobiledgex.js
* CodeCov.io - https://codecov.io/gh/eusholli/mobiledgex.js
* NPMJS.com - https://www.npmjs.com/package/mobiledgex.js
* UNPKG.com - https://unpkg.com/mobiledgex.js

When pushing to the [github repo](https://github.com/eusholli/mobiledgex.js), the library is automatically deployed to [npmsjs.com](https://www.npmjs.com/package/mobiledgex.js) and code coverage reporting pushed to [CodeCov](https://codecov.io/gh/eusholli/mobiledgex.js).  

To check code in with the correct commenting structure for automation, it is important to run the command 'npm run commit'.  

The code is written in ES6 and transpiled into legacy code using babel.
Automated testing is performed using mocha/chai scripting in [index.test.js](src/index.test.js) and is executed by nyt using commamnd 'npm run test'.

Browser compatible versions of the library are generated using webpack and automatically published to [unpkg.com](https://unpkg.com/mobiledgex.js)

### Visual Studio Configuration

To test the ES6 source code it is necessary to compile on the fly.  This is achieved by running 'npm run compile'. and using the following Visual Studio debug config.
```javascript
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch index.js",
            "program": "${workspaceRoot}/src/index.js",
            "outFiles": [
                "${workspaceRoot}/dist/**/*.js"
            ]
        }
    ]
}
```




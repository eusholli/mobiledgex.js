require('es6-promise').polyfill();
require('isomorphic-fetch');
const fetch = require('./fetch');

/*
"carrier_name": "string",
"unique_id": "string",
"tags": [
    {
    "type": "string",
    "data": "string"
    }
],
"cell_id": 0,
"dev_name": "string",
"unique_id_type": "string",
"auth_token": "string",
"ver": 0,
"app_vers": "string",
"app_name": "string"
*/

// API Paths:
const registerAPI = "/v1/registerclient";
const verifylocationAPI = "/v1/verifylocation";
const findcloudletAPI = "/v1/findcloudlet";
const getlocatiyonAPI = "/v1/getlocation";
const appinstlistAPI = "/v1/getappinstlist";
const dynamiclocgroupAPI = "/v1/dynamiclocgroup";

const timeoutSec = 5000;
const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0";

function getCurrentPosition() {
    if (navigator && navigator.geolocation) {
        return new Promise(
            (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)
        )
    } else {
        return new Promise(
            resolve => resolve({})
        )
    }
}

class GPSLocation {
    constructor() {
        this.latitude = null;
        this.longitude = null;
        this.horizontal_accuracy = null;
        this.timestamp = null;
        this.course = 0;
        this.speed = 0;
        this.vertical_accuracy = 0;
        this.altitude = 0;
    }

    setBrowserLocation() {
        getCurrentPosition()
            .then(
                position => {
                    console.log(positon);
                    if (position.coords) {
                        /*
                        timestamp:1389094994694,
                        coords: {
                            speed: null,
                            heading: null,
                            altitudeAccuracy: null,
                            accuracy:122000,
                            altitude:null,
                            longitude:-3.60512,
                            latitude:55.070859
                        }
                        */
                        position => console.log(positon);
                        const coords = position.coords;
                        this.latitude = coords.latitude;
                        this.timestamp = {
                            "seconds": coords.timestamp,
                            "nanos": 0
                        };
                        this.course = coords.heading;
                        this.speed = coords.speed;
                        this.vertical_accuracy = coords.altitudeAccuracy;
                        this.longitude = coords.longitude;
                        this.altitude = coords.altitude;
                        this.horizontal_accuracy = coords.accurary;

                    } else {
                        alert('Geolocation is not supported by this browser.');
                    }
                }
            ).catch(
                // error => console.log(error);
                // Or
                error => {
                    console.log(error);
                    var msg = null;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            msg = "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            msg = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            msg = "The request to get user location timed out.";
                            break;
                        case error.UNKNOWN_ERROR:
                            msg = "An unknown error occurred.";
                            break;
                    }
                    alert(msg);
                }
            )
    }

    setLocation(
        latitude,
        longitude,
        horizontal_accuracy,
        timestamp = null,
        course = 0,
        speed = 0,
        vertical_accuracy = 0,
        altitude = 0
    ) {
        this.latitude = latitude;
        if (timestamp == null) {
            timestamp = Math.floor(Date.now() / 1000);
        }

        this.timestamp = timestamp.toString();
        /*
                this.timestamp = {
                    "seconds": timestamp.toString(),
                    "nanos": 0
                };
        */
        this.course = course;
        this.speed = speed;
        this.vertical_accuracy = vertical_accuracy;
        this.longitude = longitude;
        this.altitude = altitude;
        this.horizontal_accuracy = horizontal_accuracy;
    }
}

class MobiledgeXClient {
    // class methods
    constructor(dev_name,
        app_name,
        app_vers, ) {
        this.dev_name = dev_name;
        this.app_name = app_name;
        this.app_vers = app_vers;
        this.session_cookie = null;
    }

    registerClient(
        auth_token = "", // optional
        carrier_name, // not currently used
        cell_id, // optional
        tags,  // optional
        unique_id, // optional
        unique_id_type, // optional
    ) {
        fetch.fetchResource(registerAPI, {
            method: 'POST',
            body: {
                app_name: this.app_name,
                app_vers: this.app_vers,
                auth_token, // optional
                carrier_name, // not currently used
                cell_id, // optional
                dev_name: this.dev_name,
                tags,  // optional
                unique_id, // optional
                unique_id_type, // optional
                ver: 1
            }
        }).then(userData => {
            // Do something with the "data"
            console.log(userData);
            this.session_cookie = userData.session_cookie;
            const gps_location = new GPSLocation();
            gps_location.setLocation(10, 10, 0);
            client.findCloudlet('wifi', gps_location);
        })
            .catch(error => {
                // Handle error
                // error.message (error text)
                // error.status (HTTTP status or 'REQUEST_FAILED')
                // error.response (text, object or null)
                console.log(error);
            })
    }
    findCloudlet(
        carrier_name,
        gps_location,
        cell_id = 0, // optional
        tags = [] // optional
    ) {
        const jsonLocation = JSON.stringify(gps_location);
        fetch.fetchResource(findcloudletAPI, {
            method: 'POST',
            body: {
                session_cookie: this.session_cookie,
                /*
                "carrierName": "wifi",
                "gps_location": { "latitude": 49.282, "longitude": 123.11 }
                */
                app_name: this.app_name,
                app_vers: this.app_vers,
                session_cookie: this.session_cookie,
                carrier_name, // not currently used
                cell_id, // optional
                dev_name: this.dev_name,
                gps_location: jsonLocation,
                tags,  // optional
                ver: 1,
            }
        }).then(userData => {
            // Do something with the "data"
            console.log(userData);
            // this.session_cookie = userData.session_cookie;
        })
            .catch(error => {
                // Handle error
                // error.message (error text)
                // error.status (HTTTP status or 'REQUEST_FAILED')
                // error.response (text, object or null)
                console.log(error);
            })
    }

    verifyLocation() {

    }

}

module.exports = {
    MobiledgeXClient: MobiledgeXClient,
}

client = new MobiledgeXClient(devName, appName, appVersionStr);
client.registerClient();



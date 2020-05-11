import polyfill from 'es6-promise';
import 'isomorphic-fetch';
import fetch from './fetch';
import controllerConfig from './controllerConfig';

import { country_reverse_geocoding as CRG } from 'country-reverse-geocoding';
const crg = CRG();

// API Paths:
const registerAPI = "/v1/registerclient";
const verifylocationAPI = "/v1/verifylocation";
const findcloudletAPI = "/v1/findcloudlet";
const getlocatiyonAPI = "/v1/getlocation";
const appinstlistAPI = "/v1/getappinstlist";
const dynamiclocgroupAPI = "/v1/dynamiclocgroup";

const timeoutSec = 5000;
const orgName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0";

let localhostController = undefined;

// Custom API error to throw
class MobiledgexJSError extends Error {

    constructor(message, response, status) {
        super(message);
        this.name = "MobiledgexJSError"

        this.response = response;
        this.message = message;
        this.status = status;
        this.toString = function () {
            return this.message + '\nStatus:\n'
                + this.status ? this.status : 'No additional status \nResponse:\n'
                    + this.response ? JSON.stringify(this.response, null, 2) : 'No additional response details';
        };
    }
}

export class GPSLocation {
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

        this.timestamp = {
            "seconds": timestamp.toString(),
            "nanos": 0
        };

        this.course = course;
        this.speed = speed;
        this.vertical_accuracy = vertical_accuracy;
        this.longitude = longitude;
        this.altitude = altitude;
        this.horizontal_accuracy = horizontal_accuracy;
    }
}

function buildAppUrls(configData) {

    let fqdn = configData.fqdn;
    let appUrls = [];
    configData.ports.forEach(port => {
        appUrls.push(port.fqdn_prefix + fqdn + ':' + port.public_port);
    });
    return appUrls;
}

export class MobiledgeXClient {

    // class methods
    constructor(org_name,
        app_name,
        app_vers,
        controller) {

        this.org_name = org_name;
        this.app_name = app_name;
        this.app_vers = app_vers;
        this.session_cookie = undefined;

        if (localhostController) {
            this.controllerFQDN = 'localhost';
        }
        else if (controller === 'localhost') {
            if (localhostController === undefined) {
                throw new MobiledgexJSError('MobiledgeX initLocalhostController not defined', undefined, undefined);
            } else {
                this.controllerFQDN = 'localhost';
            }
        } else if (controller) {
            this.controllerFQDN = MobiledgeXClient.updateControllerFQDN(controller);
        } else {
            this.controllerFQDN = undefined;
        }
    }

    static updateControllerFQDN(controller) {
        return 'https://' + controller + ".dme.mobiledgex.net:38001";
    }

    apiUrl(call) {
        return this.controllerFQDN + call;
    }

    findController(gpsLocation) {

        if (isNaN(gpsLocation.latitude) || isNaN(gpsLocation.longitude)) {
            throw new MobiledgexJSError('MobiledgeX Register - GPS Lat Long Error');
        }

        let country = crg.get_country(gpsLocation.latitude, gpsLocation.longitude);
        if (country == null) {
            return false;
        }
        let controller = controllerConfig[country.code];

        if (controller.name) {
            this.controllerFQDN = MobiledgeXClient.updateControllerFQDN(controller.name);
            return true;
        } else {
            return false;
        }
    }

    registerClient(gpsLocation) {
        let self = this;
        return new Promise(function (resolve, reject) {

            if (self.controllerFQDN == "localhost") {
                let localDMEConfig = localhostController[self.app_name];
                if (localDMEConfig && (localDMEConfig.org_name == self.org_name) &&
                    (localDMEConfig.app_version == self.app_vers)) {
                    self.session_cookie = "localhost_session_cookie";
                    resolve({ session_cookie: self.session_cookie });
                } else {
                    reject(new MobiledgexJSError('MobiledgeX Register - App Credential Error', 'localhost', undefined))
                }
            } else {

                let controllerFound = false;

                if (self.controllerFQDN) {
                    controllerFound = true;
                } else if (gpsLocation) {
                    controllerFound = self.findController(gpsLocation);
                } else {
                    reject(new MobiledgexJSError('MobiledgeX Register - GPS Lat Long Error'));
                }

                if (controllerFound) {
                    fetch.fetchResource(self.apiUrl(registerAPI), {
                        method: 'POST',
                        body: {
                            app_name: self.app_name,
                            app_vers: self.app_vers,
                            org_name: self.org_name,
                        }
                    }).then(response => {
                        // Do something with the "data"
                        if (response.status === 'RS_SUCCESS') {
                            self.session_cookie = response.session_cookie;
                            resolve(response);
                        } else {
                            reject(new MobiledgexJSError('MobiledgeX Register - App Credential Error', response, response.status));
                        }
                    }).catch(error => {
                        // Handle pure fetch error
                        reject(error)
                    })
                } else {
                    reject(new MobiledgexJSError('MobiledgeX Register Error - No available controller', undefined, undefined))
                }
            }
        })
    }

    findCloudlet(
        gpsLocation,
        cell_id = 0, // optional
        tags = [] // optional
    ) {
        let self = this;
        return new Promise(function (resolve, reject) {

            if (!gpsLocation) {
                reject(new MobiledgexJSError('MobiledgeX FindCloudlet - GPS Not Defined Error', self.controllerFQDN));
            }

            if (isNaN(gpsLocation.latitude) || isNaN(gpsLocation.longitude)) {
                reject(new MobiledgexJSError('MobiledgeX FindCloudlet - GPS Lat Long Error', self.controllerFQDN));
            }

            if (self.controllerFQDN === 'localhost') {
                return handleLocalhost(resolve, reject, self.app_name, gpsLocation);
            } else {

                fetch.fetchResource(self.apiUrl(findcloudletAPI), {
                    method: 'POST',
                    body: {
                        session_cookie: self.session_cookie,
                        gps_location: gpsLocation,
                        carrier_name: ''
                    }
                }).then(response => {
                    // Do something with the "data"
                    // console.log(userData);
                    if (response.status === "FIND_FOUND") {
                        let country = crg.get_country(response.cloudlet_location.latitude, response.cloudlet_location.longitude);
                        if (country) {
                            response.country = country.name;
                        }
                        response.urls = buildAppUrls(response);
                        response.url = response.urls ? response.urls[0] : undefined;

                        resolve(response);
                    } else {
                        reject(new MobiledgexJSError('MobiledgeX FindCloudlet Error', response, response.status));
                    }
                }).catch(error => {
                    reject(new MobiledgexJSError('MobiledgeX FindCloudlet Error', error, error.status));
                })
            }
        })
    }
}

export function initLocalhostController(localhostAppConfig) {
    localhostController = localhostAppConfig;
}

function handleLocalhost(resolve, reject, appName, gpsLocation) {

    if (appName in localhostController) {
        let longitude = gpsLocation.longitude ? gpsLocation.longitude : 10;
        let latitude = gpsLocation.latitude ? gpsLocation.latitude : 10;
        let appConfig = localhostController[appName];
        let response = appConfig.response;

        response.cloudlet_location = {
            'altitude': 0,
            'course': 0,
            'horizontal_accuracy': 0,
            'latitude': latitude + 1,
            'longitude': longitude + 1,
            'speed': 0,
            'timestamp': null,
            'vertical_accuracy': 0
        };
        response.fqdn = appConfig.fqdn;
        response.url = appConfig.fqdn;
        response.status = 'FIND_FOUND'
        resolve(response);
    } else {
        reject(new MobiledgexJSError('MobiledgeX FindCloudlet Error', 'localhost', 'App Config Error'));
    }
}

export function findCloudlet(orgName, appName, appVersionStr, gpsLocation, controller) {

    return new Promise(function (resolve, reject) {

        // GPS is mandatory
        if (!gpsLocation) {
            reject(new MobiledgexJSError('MobiledgeX Register - GPS Not Defined Error'));
        } else if (isNaN(gpsLocation.latitude) || isNaN(gpsLocation.longitude)) {
            reject(new MobiledgexJSError('MobiledgeX Register - GPS Lat Long Error'));
        }

        let client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
        client.registerClient(gpsLocation).then(userData => {
            client.findCloudlet(gpsLocation).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            })
        }).catch(error => {
            reject(error);
        });
    })
}

/*
const gpsLocation = new GPSLocation();
gpsLocation.setLocation(37.5665, 126.9780, 0);

findCloudlet(orgName, appName, appVersionStr, gpsLocation, 'bad-controller').then(response => {
    console.log(response);
}).catch(error => {
    console.log(error);
});


initLocalhostController({
    "MobiledgeX SDK Demo": {
        org_name: orgName,
        app_version: appVersionStr,
        response: {},
        fqdn: 'localhost:8080'
    }
});

const gps_location = new GPSLocation();
gps_location.setLocation(10.555, 10, 0);

let client = new MobiledgeXClient(orgName, appName, appVersionStr, 'localhost');

client.registerClient().then(userData => {

    client.findCloudlet(gps_location).then(response => {
        console.log(response);
    }).catch(error => {
        console.log(error);
    });
}).catch(error => {
    console.log(error);
});

*/

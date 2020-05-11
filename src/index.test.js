import { assert } from 'assert';
import { should } from 'chai';

import chai from 'chai';
let expect = chai.expect;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised).should();

import { MobiledgeXClient, GPSLocation, initLocalhostController, findCloudlet } from './index.js';

const orgName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0";

let controller = undefined;

describe('Test controller localhost localHostController configuration', function () {

    before('Define controller name', function () {
        controller = 'localhost';
        initLocalhostController(undefined);
    });

    it('should return an error due to missing configuration', function () {
        expect(function () { new MobiledgeXClient(orgName, appName, appVersionStr, controller) }).
            to.throw(Error, 'MobiledgeX initLocalhostController not defined');
    });

    it('should return a MobiledgeXClient object for no controller passed with no localhost configuration', function () {
        let client = new MobiledgeXClient(orgName, appName, appVersionStr);
        expect(client).to.be.an.instanceof(MobiledgeXClient);
    });

    it('should return a MobiledgeXClient object for a different controller passed with no localhost configuration', function () {
        let client = new MobiledgeXClient(orgName, appName, appVersionStr, 'eu');
        expect(client).to.be.an.instanceof(MobiledgeXClient);
    });

    it('should return a MobiledgeXClient object with localhost controller since configuration defined', function () {
        initLocalhostController({
            "MobiledgeX SDK Demo": {
                org_name: orgName,
                app_version: appVersionStr,
                fqdn: 'localhost:8080',
                response: {}
            }
        });
        let client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
        expect(client).to.be.an.instanceof(MobiledgeXClient);
    });

});


describe('Test controller localhost when localHostController IS defined', function () {

    before('Define controller name and localhostController configuration', function () {
        controller = 'localhost';
        initLocalhostController({
            "MobiledgeX SDK Demo": {
                org_name: orgName,
                app_version: appVersionStr,
                fqdn: 'localhost:8080',
                response: {}
            }
        });
    });

    after('Remove localhostController configuration', function () {
        initLocalhostController(undefined);
    });

    describe('Test MobiledgeXClient.registerClient call - controller localhost', function () {

        let client = undefined;

        it('should return a session id set in mobiledgeX client for controller localhost set in new Client', function () {
            client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
            return client.registerClient().should.eventually.have.own.property('session_cookie').that.is.a('string');
        });

        it('controller localhost set in new Client should override any GPS', function () {
            client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
            let gpsLocation = new GPSLocation();
            gpsLocation.setLocation(10, 10, 0);
            return client.registerClient(gpsLocation).should.eventually.have.own.property('session_cookie').that.is.a('string');
        });

        it('should raise Exception due to bad app name', function () {
            client = new MobiledgeXClient(orgName, 'bad name', appVersionStr, controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });

        it('should raise Exception due to undefined app name', function () {
            client = new MobiledgeXClient(orgName, undefined, appVersionStr, controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });

        it('should raise Exception due to bad org name', function () {
            client = new MobiledgeXClient('bad name', appName, appVersionStr, controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });

        it('should raise Exception due to undefined org name', function () {
            client = new MobiledgeXClient(undefined, appName, appVersionStr, controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });

        it('should raise Exception due to bad app version', function () {
            client = new MobiledgeXClient(orgName, appName, 'bad version', controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });

        it('should raise Exception due to undefined app version', function () {
            client = new MobiledgeXClient(orgName, appName, undefined, controller);
            return client.registerClient().
                should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
        });
    });

    describe('Test MobiledgeXClient.findCloudlet call - controller localhost', function () {

        let client = undefined;

        before('register client', function () {
            client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
            return client.registerClient().should.eventually.have.own.property('session_cookie').that.is.a('string');
        });

        it('should raise Exception due to undefined GPS', function () {
            return client.findCloudlet(undefined).
                should.eventually.be.rejectedWith('MobiledgeX FindCloudlet - GPS Not Defined Error');
        });

        it('should raise Exception due to bad GPS latitude', function () {
            let gpsLocation = new GPSLocation();
            gpsLocation.setLocation(undefined, 10, 0);

            return client.findCloudlet(gpsLocation).
                should.eventually.be.rejectedWith('MobiledgeX FindCloudlet - GPS Lat Long Error');
        });

        it('should raise Exception due to bad GPS longitude', function () {
            let gpsLocation = new GPSLocation();
            gpsLocation.setLocation(10, undefined, 0);

            return client.findCloudlet(gpsLocation).
                should.eventually.be.rejectedWith('MobiledgeX FindCloudlet - GPS Lat Long Error');
        });

        it('should return a url property', function () {
            let gpsLocation = new GPSLocation();
            gpsLocation.setLocation(10, 10, 0);

            return client.findCloudlet(gpsLocation).should.eventually.have.own.property('url').that.is.a('string');
        });
    });
});

describe('Test bad controller name', function () {

    let client = undefined;

    before('Define controller name to be "bad-controller"', function () {
        controller = 'bad-controller';
        initLocalhostController(undefined);
    });

    it('should return an error due to bad controller name "bad-controller"', function () {
        client = new MobiledgeXClient(orgName, appName, appVersionStr, controller);
        return client.registerClient().
            should.eventually.be.rejectedWith(Error, 'getaddrinfo ENOTFOUND');
    });
});

let controllers = [
    {
        name: 'eu-mexdemo', // Berlin
        latitude: 52.5200,
        longitude: 13.4050
    },
    {
        name: 'us-mexdemo', // Montreal
        latitude: 45.5017,
        longitude: 73.5673
    },
    {
        name: 'kr-mexdemo', // Seoul
        latitude: 37.5665,
        longitude: 126.9780
    },
    /*
    {
        name: 'jp-mexdemo', // Tokyo
        latitude: 35.6762,
        longitude: 139.6503
    },
    */
    {
        name: 'localhost', // Dallas
        latitude: 52.5200,
        longitude: 13.4050
    }
]

controllers.forEach(controller => {
    describe('Test controller ' + controller.name + ' findCloudlet single call', function () {

        let gpsLocation = undefined;
        before('Create GPS object', function () {
            gpsLocation = new GPSLocation();
            gpsLocation.setLocation(controller.latitude, controller.longitude, 0);

            if (controller.name === 'localhost') {
                initLocalhostController({
                    "MobiledgeX SDK Demo": {
                        org_name: orgName,
                        app_version: appVersionStr,
                        fqdn: 'localhost:8080',
                        response: {}
                    }
                });
            }
        });

        after('Remove localhostController configuration', function () {
            initLocalhostController(undefined);
        });

        describe('Test when controller defined by name', function () {

            it('should return a url property when successful', function () {
                return findCloudlet(orgName, appName, appVersionStr, gpsLocation, controller.name).
                    should.eventually.have.own.property('url');
            });

            it('should raise Exception due to bad app name', function () {

                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined app name', function () {

                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to bad org name', function () {

                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined org name', function () {

                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to bad app version', function () {
                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined app version', function () {
                return findCloudlet(orgName, appName, undefined, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined GPS', function () {
                return findCloudlet(orgName, appName, appVersionStr, undefined, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Not Defined Error');
            });

            it('should raise Exception due to bad GPS latitude', function () {
                let gpsLocation = new GPSLocation();
                gpsLocation.setLocation(undefined, 10, 0);

                return findCloudlet(orgName, appName, appVersionStr, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Lat Long Error');
            });

            it('should raise Exception due to bad GPS longitude', function () {
                let gpsLocation = new GPSLocation();
                gpsLocation.setLocation(10, undefined, 0);

                return findCloudlet(orgName, appName, appVersionStr, gpsLocation, controller.name).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Lat Long Error');
            });

        });

        describe('Test when controller found via GPS', function () {

            it('should return a url property when successful', function () {
                return findCloudlet(orgName, appName, appVersionStr, gpsLocation).
                    should.eventually.have.own.property('url');
            });

            it('should raise Exception due to bad app name', function () {

                return findCloudlet(orgName, 'bad app name', appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined app name', function () {

                return findCloudlet(orgName, undefined, appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to bad org name', function () {

                return findCloudlet('bad org name', appName, appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined org name', function () {

                return findCloudlet(undefined, appName, appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to bad app version', function () {
                return findCloudlet(orgName, appName, 'bad version', gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined app version', function () {
                return findCloudlet(orgName, appName, undefined, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - App Credential Error');
            });

            it('should raise Exception due to undefined GPS', function () {
                return findCloudlet(orgName, appName, appVersionStr, undefined).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Not Defined Error');
            });

            it('should raise Exception due to bad GPS latitude', function () {
                let gpsLocation = new GPSLocation();
                gpsLocation.setLocation(undefined, 10, 0);

                return findCloudlet(orgName, appName, appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Lat Long Error');
            });

            it('should raise Exception due to bad GPS longitude', function () {
                let gpsLocation = new GPSLocation();
                gpsLocation.setLocation(10, undefined, 0);

                return findCloudlet(orgName, appName, appVersionStr, gpsLocation).
                    should.eventually.be.rejectedWith('MobiledgeX Register - GPS Lat Long Error');
            });
        });
    });
});

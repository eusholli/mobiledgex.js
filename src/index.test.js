var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

var mobiledgeXClient = require('./index.js').MobiledgeXClient;
var GPSLocation = require('./index.js').GPSLocation;
var initLocalhostDME = require('./index.js').initLocalhostDME;
var findClosestCloudlet = require('./index.js').findClosestCloudlet;

const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0";

before('Create MobiledgeXClient', function () {
    console.log('before');
    initLocalhostDME({
        "MobiledgeX SDK Demo": {
            fqdn_prefix: '',
            fqdn: 'localhost',
            port: '8080'
        }
    })
    client = new mobiledgeXClient(devName, appName, appVersionStr);
    failClient = new mobiledgeXClient(devName, "fail", appVersionStr);

    gps_location = new GPSLocation();
    gps_location.setLocation(10, 10, 0);
});

describe('mobiledgeXClient registerclient', function () {
    it('should return a session id set in mobiledgeX client', function () {
        return client.registerClient().should.eventually.have.own.property('session_cookie').that.is.a('string');
    });
    it('should return an error due to bad developer name "fail"', function () {
        return failClient.registerClient().should.eventually.be.rejected;
    })
});
describe('mobiledgeXClient findcloudlet', function () {
    it('carrier name wifi should return a status of FIND_FOUND and an array of app Urls returned', function () {
        return client.findCloudlet('wifi', gps_location).
            should.eventually.have.own.property('status').
            to.equal('FIND_FOUND');
    });
    it('carrier name localhost should return a status of FIND_FOUND and an array of app Urls returned', function () {
        return client.findCloudlet('wifi', gps_location).
            should.eventually.have.own.property('status').
            to.equal('FIND_FOUND');
    });
    it('should return an error due to bad app name on localhost', function () {
        return failClient.findCloudlet('localhost', gps_location).should.eventually.be.rejected;
    });
    it('should return an error due to bad carrier name', function () {
        return client.findCloudlet('badCarrierName', gps_location).should.eventually.be.rejected;
    });
    it('should return an error due to bad gps_location', function () {
        return client.findCloudlet('wifi', null).should.eventually.be.rejected;
    })
})

describe('mobiledgeXClient findClosestCloudlet', function () {
    it('should return a valid app Url from the localhostDME configuration', function () {
        return findClosestCloudlet(devName, appName, appVersionStr, 'localhost', gps_location)
            .should.eventually.be.a('string');
    });
    it('should return a valid app Url from the wifi network DME', function () {
        return findClosestCloudlet(devName, appName, appVersionStr, 'wifi', gps_location)
            .should.eventually.be.a('string');
    });
    it('should return an error due to bad developer name "fail" on localhost', function () {
        return findClosestCloudlet(devName, 'fail', appVersionStr, 'localhost', gps_location).should.eventually.be.rejected;
    })
    it('should return an error due to bad developer name "fail" on wifi DME', function () {
        return findClosestCloudlet(devName, 'fail', appVersionStr, 'wifi', gps_location).should.eventually.be.rejected;
    })
});
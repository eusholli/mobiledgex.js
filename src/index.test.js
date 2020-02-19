var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

var mobiledgeXClient = require('./index.js').MobiledgeXClient;

const devName = "MobiledgeX"; // Your developer name
const appName = "MobiledgeX SDK Demo"; // Your application name
const appVersionStr = "2.0";
client = new mobiledgeXClient(devName, appName, appVersionStr);

describe('mobiledgeXClient registerclient', function () {
    it('should return true if valid user id', function () {
        return loginController.isAuthorizedPromise('abc123').should.eventually.be.true;
    });
    it('should work!', function () {
        expect(true).to.be.true;
    })
})
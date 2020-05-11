const fs = require('fs');

let rawdata = fs.readFileSync('countryData.json');
let countryData = JSON.parse(rawdata);
let controllerConfig = {};
// console.log(countryData);

for (var i = 0, len = countryData.length; i < len; i++) {
    let country = countryData[i];
    let name = undefined;
    console.log(country.subregion);
    if (country.name === 'Japan') {
        name = 'jp-mexdemo';
    } else if (country.region === 'Europe') {
        name = 'eu-mexdemo'
    } else if (country.subregion === 'Northern America') {
        name = 'us-mexdemo'
    } else if (country.subregion === 'Eastern Asia') {
        name = 'kr-mexdemo'
    } else {
        name = 'eu-mexdemo';
    }
    controllerConfig[country.alpha3] = {
        country: country.name,
        name
    }
}

let output = JSON.stringify(controllerConfig);
fs.writeFileSync('../src/controllerConfig.js', 'module.exports = ' + output);

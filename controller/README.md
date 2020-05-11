# MobiledgeX Controller Config Generator
This is a help function to generate and install the controller lookup code based on client GPS location and [country definition data](./countryData.json).

It currently selects the controllers based on the below logic

```javascript
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
```

To generate the configuration 

```bash
node configGenerator.js
```
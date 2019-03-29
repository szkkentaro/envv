"use strict";
exports.__esModule = true;
var mqtt = require("mqtt");
var jwt = require("jsonwebtoken");
var fs = require("fs");
var yargs = require("yargs");
var argv = yargs
    .env('ENVV')
    .options({
    projectId: {
        alias: 'p',
        demandOption: true,
        type: 'string',
        describe: 'GCP Project ID'
    },
    registryId: {
        alias: 'r',
        demandOption: true,
        type: 'string',
        describe: 'Cloud IoT Core Registry ID',
        "default": 'my-registry'
    },
    deviceId: {
        alias: 'd',
        demandOption: true,
        type: 'string',
        describe: 'Cloud IoT Core Device ID',
        "default": 'my-device'
    },
    region: {
        demandOption: true,
        type: 'string',
        describe: 'GCP Region',
        "default": 'asia-east1'
    }
})
    .help()
    .argv;
var projectId = argv.projectId;
var registryId = argv.registryId;
var deviceId = argv.deviceId;
var region = argv.region;
var publishInterval = 10000; // msec
var intervalId;
// Make JWT token
var payload = {
    iat: parseInt((Date.now() / 1000).toString()),
    exp: parseInt((Date.now() / 1000).toString()) + 20 * 60,
    aud: projectId
};
var privateKey = fs.readFileSync('rsa_private.pem');
var password = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
// Sensor Data Reader
var reader = function () {
    // ToDo Impl
    return Date.now().toString();
};
// MQTT Client connect
var params = {
    host: 'mqtt.googleapis.com',
    port: 8883,
    clientId: "projects/" + projectId + "/locations/" + region + "/registries/" + registryId + "/devices/" + deviceId,
    username: 'unused',
    password: password,
    protocol: 'mqtts'
};
var client = mqtt.connect(params);
// MQTT Client config
client.subscribe("/devices/" + deviceId + "/config", { qos: 1 });
client.subscribe("/devices/" + deviceId + "/commands/#", { qos: 1 });
// MQTT Events setting
client.on('connect', function (packet) {
    if (packet.returnCode === 0) {
        console.log("connected");
    }
});
client.on('close', function () { return console.log('close'); });
client.on('error', function (err) { return console.log('error', err); });
client.on('message', function (topic, message) {
    var payload = message.toString();
    // commands
    if (topic === '/devices/my-device/commands') {
        client.emit(payload);
    }
});
client.on('start', function () {
    console.log('start');
    var topic = "/devices/" + deviceId + "/events";
    var opts = { qos: 1 };
    intervalId = setInterval(function () {
        var message = reader();
        client.publish(topic, message, opts, function (err, data) {
            console.log('published data: ', data);
            if (err) {
                console.log(err);
                clearInterval(intervalId);
                client.end();
            }
        });
    }, publishInterval);
});
client.on('stop', function () {
    console.log('stop');
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
    }
});
client.on('end', function () {
    console.log('end');
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
    }
    client.end();
});

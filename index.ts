import * as mqtt from 'mqtt'
import * as jwt from 'jsonwebtoken'
import * as fs from "fs"
import yargs from "yargs";

const argv = yargs
    .env('ENVV')
    .options({
        projectId: {
            alias: 'p',
            demandOption: true,
            type: 'string',
            describe: 'GCP Project ID',
        },
        registryId: {
            alias: 'r',
            demandOption: true,
            type: 'string',
            describe: 'Cloud IoT Core Registry ID',
            default: 'my-registry'
        },
        deviceId: {
            alias: 'd',
            demandOption: true,
            type: 'string',
            describe: 'Cloud IoT Core Device ID',
            default: 'my-device'
        },
        region: {
            demandOption: true,
            type: 'string',
            describe: 'GCP Region',
            default: 'asia-east1'
        },
    })
    .help()
    .argv;

const projectId:string = argv.projectId;
const registryId:string = argv.registryId;
const deviceId:string = argv.deviceId;
const region:string = argv.region;

const publishInterval:number = 10000; // msec
let intervalId:NodeJS.Timeout;

// Make JWT token
const payload = {
    iat: parseInt((Date.now() / 1000).toString()),
    exp: parseInt((Date.now() / 1000).toString()) + 20 * 60, // 20 minutes
    aud: projectId,
};
const privateKey = fs.readFileSync('rsa_private.pem');
const password = jwt.sign(payload, privateKey, { algorithm: 'RS256' })

// Sensor Data Reader
const reader = () => {
    // ToDo Impl
    return Date.now().toString();
}

// MQTT Client connect
const params: mqtt.IClientOptions = {
    host: 'mqtt.googleapis.com',
    port: 8883,
    clientId: `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`,
    username: 'unused',
    password: password,
    protocol: 'mqtts',
}
const client: mqtt.Client =  mqtt.connect(params); 

// MQTT Client config
 client.subscribe(`/devices/${deviceId}/config`, {qos: 1});

 client.subscribe(`/devices/${deviceId}/commands/#`, {qos: 1});

// MQTT Events setting
client.on('connect', (packet: { returnCode: number; }) => {
    if (packet.returnCode === 0) {
        console.log("connected")
    }
});
client.on('close', () => console.log('close'));
client.on('error', err => console.log('error', err));
client.on('message', (topic, message) => {
    const payload = message.toString();
    // config
    // if (topic === '/devices/my-device/config') {
    //     // If you want to implemente
    // }
    // commands
    if (topic === '/devices/my-device/commands') {
        client.emit(payload);
    }
});
client.on('start', () => {
    console.log('start')
    const topic: string = `/devices/${deviceId}/events`;
    const opts: mqtt.IClientPublishOptions = { qos: 1 };

    intervalId = setInterval(() => {
        const message: string = reader();
        client.publish(topic, message, opts, (err, data) => {
            console.log('published data: ', data);
            if (err) {
                console.log(err);
                clearInterval(intervalId);
                client.end();
            }
        });
    }, publishInterval);
});
client.on('stop', () => {
    console.log('stop')
    if (intervalId) {
        clearInterval(intervalId);
    }
});
client.on('end', () => {
    console.log('end')
    if (intervalId) {
        clearInterval(intervalId);
    }
    client.end();
});

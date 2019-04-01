# ENVV

This app sends DHT22 or AM2302 sensor data to Cloud IoT Core via MQTT.
It is written by TypeScript.

This app is Poc. You should not use this at production.

# How to install 

Execute commands below at raspberry pi

    # Install Node.js
    sudo apt update -y
    sudo apt upgrade -y
    sudo apt install git
    git clone https://github.com/creationix/nvm.git ~/.nvm
    sudo echo "source ~/.nvm/nvm.sh" >> ~/.bashrc && sudo echo "source ~/.nvm/nvm.sh" >> ~/.profile
    source ~/.profile
    nvm install v10.15.3
    node --version
    npm install typescript -g

    # Git clone this app
    git clone https://github.com/szkkentaro/envv && cd envv

    # Create private/public keys
    generate_keys.sh 

    # Install bcm
    curl -sSL http://www.airspayce.com/mikem/bcm2835/bcm2835-1.58.tar.gz -o bcm2835-1.58.tar.gz
    tar zxvf bcm2835-1.58.tar.gz
    cd bcm2835-1.58/
    ./configure
    make
    sudo make check
    sudo make install

    # Install 
    npm install

    # Put node-dht-sensor index.js for typescript
    cat << EOS > node_modules/node-dht-sensor/index.js 
    module.exports = {
      sensor: require('./build/Release/node_dht_sensor.node'),
    };
    EOS

# How to run

At rasp

    tsc index.ts
    node index.js -p $GCP_PROJECT_ID

At GCP Web console

1. Show Cloud Core IoT
2. Create the registry that named `my-registry`
    1. Create pubsub topic for telemetry that named `projects/${GCP_PROJECT_ID}/topics/device-telemetry`
    2. Create pubsub topic for state that named `projects/${GCP_PROJECT_ID}/topics/device-state`
3. Create the device that named `my-device` 
    1. Copy & paste the public key that is generated at rasp
4. Create the subscription that named `my-subscription` for `device-telemetry` topic
5. Open your device page
    1. Send commmand `start` then this app is going to run
    2. Wait some seconds, then you can see send data via stdout
    3. Send command `end` then this app is going to down
6. Show device data like this

```
$ gcloud pubsub subscriptions pull my-subscription --auto-ack --limit=100
┌──────────────────────────────────────────┬─────────────────┬───────────────────────────────────┐
│                   DATA                   │    MESSAGE_ID   │             ATTRIBUTES            │
├──────────────────────────────────────────┼─────────────────┼───────────────────────────────────┤
│ {"temperature":"23.4","humidity":"34.8"} │ 488748657577440 │ deviceId=my-device                │
│                                          │                 │ deviceNumId=3165502644321490      │
│                                          │                 │ deviceRegistryId=my-registry      │
│                                          │                 │ deviceRegistryLocation=asia-east1 │
│                                          │                 │ projectId=envv-000000             │
│                                          │                 │ subFolder=                        │
│ {"temperature":"23.3","humidity":"34.7"} │ 488749758252633 │ deviceId=my-device                │
│                                          │                 │ deviceNumId=3165502644321490      │
│                                          │                 │ deviceRegistryId=my-registry      │
│                                          │                 │ deviceRegistryLocation=asia-east1 │
│                                          │                 │ projectId=envv-000000             │
│                                          │                 │ subFolder=                        │
│ {"temperature":"23.3","humidity":"34.7"} │ 488750126901791 │ deviceId=my-device                │
│                                          │                 │ deviceNumId=3165502644321490      │
│                                          │                 │ deviceRegistryId=my-registry      │
│                                          │                 │ deviceRegistryLocation=asia-east1 │
│                                          │                 │ projectId=envv-000000             │
│                                          │                 │ subFolder=                        │
└──────────────────────────────────────────┴─────────────────┴───────────────────────────────────┘
```

# ToDo

- [ ] Write test code.

# ENVV

This app sends sensor data to Cloud IoT Core via MQTT.
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

    # Install this app
    git clone https://github.com/szkkentaro/envv && cd envv
    npm install

    # Create private/public keys
    generate_keys.sh 

# How to run

At rasp

    ENVV_PROJECT_ID=$GCP_PROJECT_ID npm start

At GCP Web console

1. Show Cloud Core IoT
2. Create the registry that named `my-registry`
    1. Create pubsub topic for telemetry that named `projects/${GCP_PROJECT_ID}/topics/device-telemetry`
    2. Create pubsub topic for state that named `projects/${GCP_PROJECT_ID}/topics/device-state`
3. Create the device that named `my-device` 
    1. Copy & paste the public key that is generated at rasp
4. Open your device page
    1. Send commmand `start` then this app is going to run
    2. Wait some seconds, then you can see send data via stdout
    3. Send command `end` then this app is going to down
    
# ToDo

- [ ] Write test code.

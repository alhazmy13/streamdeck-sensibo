/**
@file      main.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/

// Global web socket
var websocket = null;

// Global plugin settings
var globalSettings = {};

// Global settings
var settings = {};

// Global cache
var cache = {};

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    // Parse parameter from string to object
    let actionInfo = JSON.parse(inActionInfo);
    let info = JSON.parse(inInfo);

    let streamDeckVersion = info['application']['version'];
    let pluginVersion = info['plugin']['version'];

    // Save global settings
    settings = actionInfo['payload']['settings'];

    // Retrieve language
    let language = info['application']['language'];

    // Retrieve action identifier
    let action = actionInfo['action'];

    // Open the web socket to Stream Deck
    // Use 127.0.0.1 because Windows needs 300ms to resolve localhost
    websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);

    // WebSocket is connected, send message
    websocket.onopen = () => {
        // Register property inspector to Stream Deck
        registerPluginOrPI(inRegisterEvent, inUUID);

        // Request the global settings of the plugin
        requestGlobalSettings(inUUID);
    };

    // Create actions
    let actions;

    if (action === 'me.alhazmy13.sensibo.power') {
        actions = new Power(inUUID, language, streamDeckVersion, pluginVersion);
    }
    else if (action === 'me.alhazmy13.sensibo.temperature') {
        actions = new Temperature(inUUID, language, streamDeckVersion, pluginVersion);
    }
    else if (action === 'me.alhazmy13.sensibo.fan') {
        actions = new Fan(inUUID, language, streamDeckVersion, pluginVersion);
    }
    else if (action === 'me.alhazmy13.sensibo.mode') {
        actions = new Mode(inUUID, language, streamDeckVersion, pluginVersion);
    }
    websocket.onmessage = msg => {
        // Received message from Stream Deck
        let jsonObj = JSON.parse(msg.data);
        let event = jsonObj['event'];
        let jsonPayload = jsonObj['payload'];
        if (event === 'didReceiveGlobalSettings') {
            // Set global plugin settings
            globalSettings = jsonPayload['settings'];
        }
        else if (event === 'didReceiveSettings') {
            // Save global settings after default was set
            settings = jsonPayload['settings'];
        }
        else if (event === 'sendToPropertyInspector') {
            // Save global cache
            cache = jsonPayload;

            // Load keys and ACs

            actions.loadApiKeys();
        }
    };
}

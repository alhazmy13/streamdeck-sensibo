/**
@file      utils.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/
// Register the plugin or PI
function registerPluginOrPI(inEvent, inUUID) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: inEvent,
            uuid: inUUID,
        }));
	}
}

// Save settings
function saveSettings(inAction, inUUID, inSettings) {
    if (websocket) {
        websocket.send(JSON.stringify({
             action: inAction,
             event: 'setSettings',
             context: inUUID,
             payload: inSettings,
         }));
    }
}

// Save global settings
function saveGlobalSettings(inUUID) {
    if (websocket) {
        websocket.send(JSON.stringify({
             event: 'setGlobalSettings',
             context: inUUID,
             payload: globalSettings,
         }));
    }
}

// Request global settings for the plugin
function requestGlobalSettings(inUUID) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'getGlobalSettings',
            context: inUUID,
        }));
    }
}


// Request  settings for the action
function getSettings(inUUID) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'getSettings',
            context: inUUID,
        }));
    }
}


// Log to the global log file
function log(inMessage) {
    // Log to the developer console
    let time = new Date();
    let timeString = time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
    console.log(timeString, inMessage);

    // Log to the Stream Deck log file
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'logMessage',
            payload: {
                message: inMessage,
            },
        }));
    }
}

// Show alert icon on the key
function showAlert(inUUID) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'showAlert',
            context: inUUID,
        }));
    }
}

// Set the state of a key
function setState(inContext, inState) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'setState',
            context: inContext,
            payload: {
                state: inState,
            },
        }));
    }
}

function setTitle(inContext, inState) {
    if (websocket) {
        websocket.send(JSON.stringify({
            event: 'setTitle',
            context: inContext,
            payload: {
                title: inState,
                target: "both",
            },
        }));
    }
}

// Set data to PI
function sendToPropertyInspector(inAction, inContext, inData) {
    if (websocket) {
        websocket.send(JSON.stringify({
            action: inAction,
            event: 'sendToPropertyInspector',
            context: inContext,
            payload: inData,
        }));
    }
}

// Set data to plugin
function sendToPlugin(inAction, inContext, inData) {
    if (websocket) {
        websocket.send(JSON.stringify({
            action: inAction,
            event: 'sendToPlugin',
            context: inContext,
            payload: inData,
        }));
    }
}

// Load the localizations
function getLocalization(inLanguage, inCallback) {
    let url = `../${inLanguage}.json`;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            try {
                let data = JSON.parse(xhr.responseText);
                let localization = data['Localization'];
                inCallback(true, localization);
            }
            catch(e) {
                inCallback(false, 'Localizations is not a valid json.');
            }
        }
        else {
            inCallback(false, 'Could not load the localizations.');
        }
    };

    xhr.onerror = () => {
        inCallback(false, 'An error occurred while loading the localizations.');
    };

    xhr.ontimeout = () => {
        inCallback(false, 'Localization timed out.');
    };

    xhr.send();
}

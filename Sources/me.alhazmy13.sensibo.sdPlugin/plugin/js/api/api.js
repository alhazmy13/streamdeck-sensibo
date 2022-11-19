/**
 @file      api.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

// Prototype which represents a Philips Hue bridge
function Api(key = null) {
    // Init Bridge
    let instance = this;

    // Public function to retrieve the key
    this.getKey = () => {
        return key;
    };


    // Public function to retrieve the name
    this.getName = callback => {
        let url = `https://home.sensibo.com/api/v2/users/me/pods?fields=*&apiKey=${key}`;
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', url, true);
        xhr.timeout = 5000;

        xhr.onload = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let result = xhr.response;

                if (result !== undefined && result != null) {
                    if ('name' in result) {
                        let name = result['name'];
                        callback(true, name);
                    } else {
                        let message = result[0]['error']['description'];
                        callback(false, message);
                    }
                } else {
                    callback(false, 'Bridge response is undefined or null.');
                }
            } else {
                callback(false, 'Could not connect to the bridge.');
            }
        };

        xhr.onerror = () => {
            callback(false, 'Unable to connect to the bridge.');
        };

        xhr.ontimeout = () => {
            callback(false, 'Connection to the bridge timed out.');
        };

        xhr.send();
    };

    // Private function to retrieve objects
    function getMeetHues(type, callback) {
        let url;

        if (type === 'ac') {
            url = `https://home.sensibo.com/api/v2/users/me/pods?fields=*&apiKey=${key}`;
        } else {
            callback(false, 'Type does not exist.');
            return;
        }

        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', url, true);
        xhr.timeout = 5000;

        xhr.onload = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                let response = xhr.response;

                if (response !== undefined && response != null) {
                    let result = xhr.response['result'];
                    if (Array.isArray(result)) {
                        let objects = [];

                        result.forEach(obj => {

                            if (type === 'ac') {
                                objects.push(new AC(instance, obj['id'], obj['room']['name'], obj['room']['uid'], obj['acState']['on'], obj['acState']['targetTemperature'], obj['acState']['fanLevel'], obj['acState']['mode']));
                            }
                        });

                        callback(true, objects);
                    } else {
                        let message = result[0]['error'];
                        callback(false, message);
                    }
                } else {
                    callback(false, 'Bridge response is undefined or null.');
                }
            } else {
                callback(false, 'Unable to get objects of type ' + type + '.');
            }
        };

        xhr.onerror = () => {
            callback(false, 'Unable to connect to the bridge.');
        };

        xhr.ontimeout = () => {
            callback(false, 'Connection to the bridge timed out.');
        };

        xhr.send();
    }

    // Public function to retrieve the lights
    this.getACs = callback => {
        getMeetHues('ac', callback);
    };

}

// Static function to discover bridges
Api.discover = callback => {
    if (globalSettings.keys) {
        callback(true, globalSettings.keys);
    }
};

// Check if a Bridge is available under a certain IP address
// If a username is set it will check that too
Api.check = (key, callback) => {
    let url = `https://home.sensibo.com/api/v2/users/me/pods?apiKey=${key}`;
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', url, true);
    xhr.timeout = 10000;

    xhr.onload = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 &&
            xhr.response !== undefined && xhr.response != null
        ) {
            // at this point the bridge has been found and added to list
            callback(true, {
                key: key,
                id: key,
            });
        }

        callback(false);
    };

    xhr.onerror = xhr.ontimeout = () => {
        callback(false);
    };

    xhr.send();
};


// Prototype which represents a Philips Hue object
function SensiboAPI(bridge = null, id = null, name = null, uid = null) {
    // Init SensiboAPI
    let instance = this;

    // Override in child prototype
    let url = null;

    // Public function to retrieve the name
    this.getName = () => {
        return name;
    };

    // Public function to retrieve the ID
    this.getID = () => {
        return id;
    };

    this.getApiKey = () => {
        return bridge;
    };

    // Public function to retrieve the URL
    this.getURL = () => {
        return url;
    };

    // Public function to set the URL
    this.setURL = inURL => {
        url = inURL;
    }

    // Public function to set light state
    this.setState = (state, callback) => {
        // Check if the URL was set
        if (instance.getURL() == null) {
            callback(false, 'URL is not set.');
            return;
        }

        let url = `${instance.getURL()}/${state.property}?apiKey=${instance.getApiKey().getKey()}`
        let xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.responseType = "json";
        xhr.open('PATCH', url);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                if (xhr.response !== undefined && xhr.response != null) {
                    let result = xhr.response['result'];
                    if (xhr.response['status'] === 'success') {
                        callback(true, result['acState'][state.property]);
                    } else {
                        let message = result['error']['description'];
                        callback(false, message);
                    }
                } else {
                    callback(false, 'Sensibo response is undefined or null.');
                }
            } else {
                callback(false, 'Could not set state.');
            }
        };

        xhr.onerror = () => {
            callback(false, 'Unable to connect to Sensibo.');
        };

        xhr.ontimeout = () => {
            callback(false, 'Connection to the bridge timed out.');
        };

        let data = JSON.stringify({newValue: state.value});
        xhr.send(data);
    };
}


// Prototype which represents an illumination
function IlApi(bridge = null, id = null, name = null, uid = null, power = null, temperature = null, fanLevel = null, mode = null) {
    // Init IlApi
    let instance = this;

    // Inherit from SensiboAPI
    SensiboAPI.call(this, bridge, id, name, uid);

    // Public function to retrieve the power state
    this.getPower = () => {
        return power;
    };

    this.getID = () => {
        return id;
    };
    this.getName = () => {
        return name;
    };

    this.getFanLevel = () => {
        return fanLevel;
    };

    this.getMode = () => {
        return mode;
    };

    this.getUID = () => {
        return uid;
    };

    // Public function to retrieve the temperature
    this.getTemperature = () => {
        return temperature;
    };

    // Public function to set the power status of the ac
    this.setPower = (state, callback) => {
        instance.setState({property: 'on', value: state}, callback);
    };

    this.setFanLevel = (state, callback) => {
        instance.setState({property: 'fanLevel', value: state}, callback);
    };

    this.setMode = (state, callback) => {
        instance.setState({property: 'mode', value: state}, callback);
    };


    // Public function set the temperature value
    this.setTemperature = (temperature, callback) => {
        // Define state object
        instance.setState({property: 'targetTemperature', value: temperature}, callback);

    };
}

// Prototype which represents a light
function AC(bridge = null, id = null, name = null, uid = null, power = null, temperature = null, fanLevel = null, mode = null) {
    // Inherit from IlApi
    IlApi.call(this, bridge, id, name, uid, power, temperature, fanLevel, mode);
    // Set the URL
    this.setURL(`https://home.sensibo.com/api/v2/pods/${id}/acStates`);
}

/**
 @file      temperatureAction.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

// Prototype which represents a color action
function TemperatureAction(inContext, inSettings) {
    // Init PowerAction
    let instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    // Update the state
    updateState();

    // Public function called on key up event
    this.onKeyUp = (inContext, inSettings, inCoordinates, inUserDesiredState, inState) => {
        // Check if any key is configured
        if (!('key' in inSettings)) {
            log('No key configured');
            showAlert(inContext);
            return;
        }

        // Check if the configured key is in the cache
        if (!(inSettings.key in cache.data)) {
            log('Key ' + inSettings.key + ' not found in cache');
            showAlert(inContext);
            return;
        }

        // Find the configured key
        let keyCache = cache.data[inSettings.key];

        // Check if any ac is configured
        if (!('ac' in inSettings)) {
            log('No ac or group configured');
            showAlert(inContext);
            return;
        }

        // Check if the configured ac or group is in the cache
        if (!(inSettings.ac in keyCache.acs)) {
            log(`AC ${inSettings.ac} not found in cache`);
            showAlert(inContext);
            return;
        }

        // Check if any ac is configured
        if (!('temp_value' in inSettings)) {
            log('No ac or group configured');
            showAlert(inContext);
            return;
        }

        // Check if any ac is configured
        if (!('temp_type' in inSettings)) {
            log('No ac or group configured');
            showAlert(inContext);
            return;
        }
        // Create a key instance
        let key = new Api(keyCache.key);

        // Create  ac instance
        let objCache, obj;
        objCache = keyCache.acs[inSettings.ac];
        obj = new AC(key, objCache.id);


        // Check for multi action
        let targetState;
        log(objCache);
        log(inSettings.temp_value);
        if (inSettings.temp_type === 'set') {
            targetState = parseInt(inSettings.temp_value);
        } else {
            targetState = parseInt(objCache.temperature) + parseInt(inSettings.temp_value);
            // keyCache.acs[inSettings.ac].temperature = targetState;
            // setActionState(inContext, targetState);
        }

        obj.setTemperature(targetState, (success, error) => {
            if (success) {
                setTitle(inContext, targetState + '°C');
                log(objCache);
            } else {
                log(error);
                setActionState(inContext, inState);
                showAlert(inContext);
            }
        });

    };

    // Before overwriting parent method, save a copy of it
    let actionNewCacheAvailable = this.newCacheAvailable;

    // Public function called when new cache is available
    this.newCacheAvailable = inCallback => {
        // Call actions newCacheAvailable method
        actionNewCacheAvailable.call(instance, () => {
            // Update the state
            updateState();

            // Call the callback function
            inCallback();
        });
    };

    function updateState() {
        // Get the settings and the context
        let settings = instance.getSettings();
        let context = instance.getContext();

        // Check if any key is configured
        if (!('key' in settings)) {
            return;
        }

        // Check if the configured key is in the cache
        if (!(settings.key in cache.data)) {
            return;
        }

        // Find the configured key
        let keyCache = cache.data[settings.key];

        // Check if the ac was set for this action
        if (!('ac' in settings)) {
            return;
        }

        // Check if the configured ac or group is in the cache
        if (!(settings.ac in keyCache.acs)) {
            return;
        }

        let objCache;
        objCache = keyCache.acs[settings.ac];
        // Set the target state
        let targetState = objCache.temperature;

        // Set the new action state
        setTitle(inContext, targetState + '°C');
    }

    // Private function to set the state
    function setActionState(inContext, inState) {
        setState(inContext, inState);
    }
}

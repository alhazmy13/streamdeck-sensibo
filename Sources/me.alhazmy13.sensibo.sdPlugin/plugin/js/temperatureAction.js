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

    this.onStateChanged = (inContext, inState) => {
        if (!inState) {
            return;
        }
        if ('temp_live_preview' in inState) {
            log('temp_live_preview');
            updateState();
        }

        if (!('temp_mode' in inState)) {
            return;
        }

        if (instance.temp_mode === 'set') {
            setActionState(inContext, 'set');
            return;
        }

        if (!('temp_value' in inState)) {
            return;
        }

        let targetState = 'set';
        if (inState.temp_mode === 'set') {
            targetState = 'set';
        } else if (inState.temp_value < 0) {
            targetState = 'decrease';
        } else if (inState.temp_value > 0) {
            targetState = 'increase';
        }
        setActionState(inContext, targetState);
    }

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
        if (!('temp_mode' in inSettings)) {
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

        if (inSettings.temp_mode === 'set') {
            targetState = parseInt(inSettings.temp_value);
        } else {
            targetState = parseInt(objCache.temperature) + parseInt(inSettings.temp_value);
            keyCache.acs[inSettings.ac].temperature = targetState;
            // setActionState(inContext, targetState);
        }

        obj.setTemperature(targetState, (success, error) => {
            if (success) {
                updateState();
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
        // log('updateState');
        // Check if any key is configured
        if (!('key' in settings)) {
            return;
        }
        // log('updateState 2');

        // Check if the configured key is in the cache
        if (!(settings.key in cache.data)) {
            return;
        }

        // Find the configured key
        let keyCache =  cache.data[settings.key];
        // log('updateState 3');

        // Check if the ac was set for this action
        if (!('ac' in settings)) {
            return;
        }
        // log('updateState 4');
        // log(keyCache.acs);
        // log(cache.data);

        // Check if the configured ac or group is in the cache
        if (!(settings.ac in keyCache.acs)) {
            return;
        }
        // log('updateState 5');


        let objCache;
        objCache = keyCache.acs[settings.ac];
        // Set the target state
        let targetState = objCache.temperature;

        if (settings.temp_live_preview) {
            log(settings.temp_live_preview);
            setTitle(context, targetState + '°' + objCache.temperatureUnit);
        }else{
            log(settings.temp_live_preview);
            setTitle(context, '');
        }

        // Set the new action state
    }

    // Private function to set the state
    function setActionState(inContext, inState) {
        setImage(inContext, TemperatureIconState[inState]);
    }
}

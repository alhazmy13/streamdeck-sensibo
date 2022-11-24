/**
 @file      horizontalSwing.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

let HorizontalSwingNextMode = {
    'stopped': 'rangeful',
    'rangeful': 'stopped'
}

// Prototype which represents a power action
function HorizontalSwingAction(inContext, inSettings) {
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

        if (!('horizontal_swing_mode' in inState)) {
            return;
        }

        if (instance.horizontal_swing_mode === 'toggle') {
            updateState();
        } else {
            if ('horizontal_swing_state' in inState) {
                setActionState(inContext, inState.horizontal_swing_state);
            }

        }
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

        // Create a key instance
        let key = new Api(keyCache.key);

        // Create  ac instance
        let objCache, obj;
        objCache = keyCache.acs[inSettings.ac];
        obj = new AC(key, objCache.id);


        // Check for multi action
        let targetState;
        if ('horizontal_swing_mode' in inSettings && inSettings.horizontal_swing_mode === 'toggle') {
            targetState = HorizontalSwingNextMode[objCache.horizontalSwing]
        } else {
            targetState = inSettings.horizontal_swing_state;
        }

        // Set ac or group state
        obj.setSwing(targetState, (success, error) => {
            if (success) {
                if ('key' in inSettings && 'ac' in inSettings && 'acs' in cache.data[inSettings.key]) {
                    if ('horizontalSwing' in cache.data[inSettings.key].acs[inSettings.ac]) {
                        cache.data[inSettings.key].acs[inSettings.ac].horizontalSwing = targetState;
                    }
                }
                setActionState(inContext, targetState);
                log(keyCache.acs[inSettings.ac]);
                showOk(inContext);
            } else {
                log(error);
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
        let targetState = objCache.horizontalSwing;

        // Set the new action state
        if ('horizontal_swing_mode' in settings && settings.horizontal_swing_mode === 'toggle') {
            setActionState(context, targetState);
        }
        // setImage(context, );
    }


    // Private function to set the state
    function setActionState(inContext, inState) {
        setImage(inContext, HorizontalSwingIconState[inState]);
    }
}

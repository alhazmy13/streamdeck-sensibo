/**
 @file      modeAction.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

// Prototype which represents a power action
function ModeAction(inContext, inSettings) {
    // Init PowerAction
    let instance = this;

    // Inherit from Action
    Action.call(this, inContext, inSettings);

    // Update the state
    updateState();

    // Public function called on key up event
    this.onKeyUp = (inContext, inSettings, inCoordinates, inUserDesiredState, inState) => {
        // Check if any bridge is configured
        log(inSettings);
        if (!('key' in inSettings)) {
            log('No key configured');
            showAlert(inContext);
            return;
        }

        // Check if the configured bridge is in the cache
        if (!(inSettings.key in cache.data)) {
            log('Key ' + inSettings.key + ' not found in cache');
            showAlert(inContext);
            return;
        }

        // Find the configured bridge
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

        // Create a bridge instance
        let bridge = new Api(keyCache.key);

        // Create  ac instance
        let objCache, obj;
        objCache = keyCache.acs[inSettings.ac];
        obj = new AC(bridge, objCache.id);


        // Check for multi action
        let targetState;
        targetState = inSettings.mode;

        log(targetState);
        // Set ac or group state
        obj.setMode(targetState, (success, error) => {
            if (success) {
                setActionState(inContext, targetState ? 0 : 1);
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
        log('updateState')
        // Get the settings and the context
        let settings = instance.getSettings();
        let context = instance.getContext();

        // Check if any bridge is configured
        if (!('key' in settings)) {
            return;
        }

        // Check if the configured bridge is in the cache
        if (!(settings.key in cache.data)) {
            return;
        }

        log('updateState3')

        // Find the configured bridge
        let bridgeCache = cache.data[settings.key];

        // Check if the ac was set for this action
        if (!('ac' in settings)) {
            return;
        }

        log('updateState4')
        log(bridgeCache.acs)
        log(settings.ac)

        // Check if the configured ac or group is in the cache
        if (!(settings.ac in bridgeCache.acs)) {
            return;
        }

        log('updateState5')

        let objCache;
        objCache = bridgeCache.acs[settings.ac];

        // Set the target state
        let targetState = objCache.power;

        // Set the new action state
        setActionState(context, targetState ? 0 : 1);
    }

    // Private function to set the state
    function setActionState(inContext, inState) {
        setState(inContext, inState);
    }
}

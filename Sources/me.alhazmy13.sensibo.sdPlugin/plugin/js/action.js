/**
@file      action.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/

// Prototype which represents an action
function Action(inContext, inSettings) {
    // Init Action
    let instance = this;

    // Private variable containing the context of the action
    let context = inContext;

    // Private variable containing the settings of the action
    let settings = inSettings;

    // Set the default values
    setDefaults();

    // Public function returning the context
    this.getContext = () => {
        return context;
    };

    // Public function returning the settings
    this.getSettings = () => {
        return settings;
    };

    // Public function for settings the settings
    this.setSettings = inSettings => {
        settings = inSettings;
    };

    // Public function called when new cache is available
    this.newCacheAvailable = inCallback => {
        // Set default settings
        setDefaults(inCallback);
    };

    // Private function to set the defaults
    function setDefaults(inCallback) {
        // If at least one bridge is paired
        if (!(Object.keys(cache.data).length > 0)) {
            // If a callback function was given
            if (inCallback !== undefined) {
                // Execute the callback function
                inCallback();
            }
            return;
        }

        // Find out type of action
        let action;
        if (instance instanceof PowerAction) {
            action = 'me.alhazmy13.sensibo.power.power';
        }
        else if (instance instanceof TemperatureAction) {
            action = 'me.alhazmy13.sensibo.temperature';
        }
        else if (instance instanceof FanAction) {
            action = 'me.alhazmy13.sensibo.fan';
        }
        else if (instance instanceof ModeAction) {
            action = 'me.alhazmy13.sensibo.mode';
        }
        // If no bridge is set for this action
        if (!('key' in settings)) {
            // Sort the bridges alphabetically
            let bridgeIDsSorted = Object.keys(cache.data).sort((a, b) => {
                return cache.data[a].name.localeCompare(cache.data[b].name);
            });

            // Set the bridge automatically to the first one
            settings.bridge = bridgeIDsSorted[0];

            // Save the settings
            saveSettings(action, inContext, settings);
        }

        // Find the configured bridge
        let keyCache = cache.data[settings.bridge];

        // If no ac is set for this action
        if (!('ac' in settings)) {
            // First try to set a group, because scenes only support groups
            // If the bridge has at least one group
            if (Object.keys(keyCache.groups).length > 0) {
                // Sort the groups automatically
                let groupIDsSorted = Object.keys(keyCache.groups).sort((a, b) => {
                    return keyCache.groups[a].name.localeCompare(keyCache.groups[b].name);
                });

                // Set the ac automatically to the first group
                settings.ac = groupIDsSorted[0];

                // Save the settings
                saveSettings(action, inContext, settings);
            }
            else if (Object.keys(keyCache.acs).length > 0) {
                // Sort the acs automatically
                let acIDsSorted = Object.keys(keyCache.acs).sort((a, b) => {
                    return keyCache.acs[a].name.localeCompare(keyCache.acs[b].name);
                });

                // Set the ac automatically to the first ac
                settings.ac = acIDsSorted[0];

                // Save the settings
                saveSettings(action, inContext, settings);
            }
        }

        // If a callback function was given
        if (inCallback !== undefined) {
            // Execute the callback function
            inCallback();
        }
    }
}

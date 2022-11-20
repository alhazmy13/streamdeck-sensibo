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
        // If at least one key is paired
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
        // If no key is set for this action
        if (!('key' in settings)) {
            // Sort the keys alphabetically
            let keyIDsSorted = Object.keys(cache.data).sort((a, b) => {
                return cache.data[a].key.localeCompare(cache.data[b].key);
            });

            // Set the key automatically to the first one
            settings.key = keyIDsSorted[0];

            // Save the settings
            saveSettings(action, inContext, settings);
        }

        // Find the configured key
        let keyCache = cache.data[settings.key];

        // If no ac is set for this action
        if (!('ac' in settings)) {
            // First try to set a group, because scenes only support groups
            // If the key has at least one group
            if (Object.keys(keyCache.acs).length > 0) {
                // Sort the acs automatically
                let acIDsSorted = Object.keys(keyCache.acs).sort((a, b) => {
                    return keyCache.acs[a].id.localeCompare(keyCache.acs[b].id);
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

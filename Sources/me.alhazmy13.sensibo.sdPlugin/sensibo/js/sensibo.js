/**
@file      sensibo.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/

function Sensibo(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
    // Init sensibo
    let instance = this;

    // Public localizations for the UI
    this.localization = {};

    // Add event listener
    document.getElementById('apikey-select').addEventListener('change', keyChanged);
    document.getElementById('ac-select').addEventListener('change', acsChanged);
    document.addEventListener('saveKey', setupCallback);
    document.addEventListener('clearSettings', clearSettings);
    // Load the localizations
    getLocalization(inLanguage, (inStatus, inLocalization) => {
        if (inStatus) {
            // Save public localization
            instance.localization = inLocalization['Sensibo'];

            // Localize the PI
            instance.localize();
        }
        else {
            log(inLocalization);
        }
    });

    // Localize the UI
    this.localize = () => {
        // Check if localizations were loaded
        if (instance.localization == null) {
            return;
        }

        // Localize the key select
        document.getElementById('apikey-label').innerHTML = instance.localization['ApiKey'];
        document.getElementById('no-apikey').innerHTML = instance.localization['NoApiKey'];
        document.getElementById('add-apikey').innerHTML = instance.localization['AddApiKey'];

        // Localize the ac select
        document.getElementById('ac-label').innerHTML = instance.localization['AC'];
        document.getElementById('no-ac').innerHTML = instance.localization['NoAc'];


    };

    // Show all paired apikey
    this.loadApiKeys = () => {
        // Remove previously shown keys
        let keys = document.getElementsByClassName('apikey');
        while (keys.length > 0) {
            keys[0].parentNode.removeChild(keys[0]);
        }
        // Check if any key is paired
        if (Object.keys(cache).length > 0) {
            // Hide the 'No keys' option
            document.getElementById('no-apikey').style.display = 'none';

            // Sort the keys alphabetically
            let keyIDsSorted = Object.keys(cache).sort((a, b) => {
                return cache[a].key.localeCompare(cache[b].key);
            });

            // Add the keys
            keyIDsSorted.forEach(inKeyID => {
                // Add the group
                let option = `
                  <option value='${inKeyID}' class='apikey'>${cache[inKeyID].key}</option>
                `;
                document.getElementById('no-apikey').insertAdjacentHTML('beforebegin', option);
            });

            // Check if the key is already configured
            if (settings.key !== undefined) {
                // Select the currently configured key
                document.getElementById('apikey-select').value = settings.key;
            }

            // Load the acs
            loadACs();
        }
        else {
            // Show the 'No keys' option
            document.getElementById('no-apikey').style.display = 'block';
        }

        // Show PI
        document.getElementById('sensibo').style.display = 'block';
    }

    // Show all acs
    function loadACs() {
        // Check if any key is configured
        if (!('key' in settings)) {
            return;
        }

        // Check if the configured key is in the cache
        if (!(settings.key in cache)) {
            return;
        }

        // Find the configured key
        let keyCache = cache[settings.key];

        // Remove previously shown acs
        let acs = document.getElementsByClassName('ac');
        while (acs.length > 0) {
            acs[0].parentNode.removeChild(acs[0]);
        }

        log(keyCache);
        // Check if the key has at least one AC
        if (Object.keys(keyCache.acs).length > 0) {
            // Hide the 'No AC' option
            document.getElementById('no-ac').style.display = 'none';
            log(keyCache.acs);
            // Sort the acs alphabetically
            let acIDsSorted = Object.keys(keyCache.acs).sort((a, b) => {
                return keyCache.acs[a].id.localeCompare(keyCache.acs[b].id);
            });

            // Add the acs
            acIDsSorted.forEach(acID => {
                let ac = keyCache.acs[acID];
                let option = `
                <option value='${ac.id}' class='ac'>${ac.name}</option>
              `;
              document.getElementById('no-ac').insertAdjacentHTML('beforebegin', option);

            });
        }
        else {
            // Show the 'No ac' option
            document.getElementById('no-ac').style.display = 'block';
        }



        // Check if the ac is already setup
        if (settings.ac !== undefined) {
            // Check if the configured ac is part of the key cache
            if (!(settings.ac in keyCache.acs)) {
                return;
            }

            // Select the currently configured ac
            document.getElementById('ac-select').value = settings.ac;
        }


        if (instance instanceof Temperature) {
            //Load the scenes
            instance.loadSteps(settings.temp_mode);
        }else if(instance instanceof Fan){
            instance.loadExtraPlaceHolder(settings.fan_mode);
        }
    }

    // Function called on successful key pairing
    function setupCallback(inEvent) {
        // Set key to the newly added key
        settings.key = inEvent.detail.key;
        instance.saveSettings();

        // Check if global settings need to be initialized
        if (globalSettings.keys === undefined) {
            globalSettings.keys = {};
        }

        // Add new key to the global settings
        globalSettings.keys[inEvent.detail.key] = {
            key: inEvent.detail.key
        };
        saveGlobalSettings(inContext);
        // clearSettings();
    }

     function clearSettings() {
        // Set key to the newly added key
        settings = {};
        instance.saveSettings();

        // Check if global settings need to be initialized
        globalSettings = {};

        saveGlobalSettings(inContext);
    }


    // key select changed
    function keyChanged(inEvent) {
        if (inEvent.target.value === 'add') {
            // Open setup window
            window.open(`../setup/index.html?language=${inLanguage}&streamDeckVersion=${inStreamDeckVersion}&pluginVersion=${inPluginVersion}`);

            // Select the first in case user cancels the setup
            document.getElementById('apikey-select').selectedIndex = 0;
        }
        else if (inEvent.target.value === 'no-apikey') {
            // If no key was selected, do nothing
        }
        else {
            settings.key = inEvent.target.value;
            instance.saveSettings();
            instance.loadApiKeys();
        }
    }

    // AC select changed
    function acsChanged(inEvent) {
        if (inEvent.target.value === 'no-ac') {
            // If no ac was selected, do nothing
        }else {
            settings.ac = inEvent.target.value;
            instance.saveSettings();

        }
    }

    // Private function to return the action identifier
    function getAction() {
        let action

        // Find out type of action
        if (instance instanceof Power) {
            action = 'me.alhazmy13.sensibo.power';
        }
        else if (instance instanceof Temperature) {
            action = 'me.alhazmy13.sensibo.temperature';
        }
        else if (instance instanceof Fan) {
            action = 'me.alhazmy13.sensibo.fan';
        }
        else if (instance instanceof Mode) {
            action = 'me.alhazmy13.sensibo.mode';
        }

        return action;
    }

    // Public function to save the settings
    this.saveSettings = () => {
        saveSettings(getAction(), inContext, settings);
    }

    // Public function to send data to the plugin
    this.sendToPlugin = inData => {
        sendToPlugin(getAction(), inContext, inData);
    }
}

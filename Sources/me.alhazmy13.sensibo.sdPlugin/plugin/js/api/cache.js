/**
 @file      cache.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

// Prototype for a data cache
function Cache() {
    // Init Cache
    let instance = this;

    // Refresh time of the cache  in seconds
    let autoRefreshTime = 60;

    // Private timer instance
    let timer = null;

    // Private api key discovery
    let discovery = null;

    // Public variable containing the cached data
    this.data = {};

    // Private function to discover all bridges on the network
    function buildDiscovery(inCallback) {
        // Check if discovery ran already
        if (discovery != null) {
            inCallback(true);
            return;
        }

        // Init discovery variable to indicate that it ran already
        discovery = {};

        // Run discovery
        Api.discover((inSuccess, inBridges) => {
            // If the discovery was not successful
            if (!inSuccess) {
                inCallback(false);
                return;
            }

            // For all discovered bridges
            Object.keys(inBridges).forEach(inBridge => {
                // Add new bridge to discovery object
                discovery[inBridge.getKey()] = {
                    key: inBridge.getKey()
                };
            });

            inCallback(true);
        });
    }

    // Gather all required information by a Bridge via ID
    function refreshApiKey(pairedApiKey, apiKey) {
        // Older Bridges in Settings may have the ID stored inside the object
        if (!apiKey.key) {
            apiKey.key = pairedApiKey;
        }

        // Older Bridges in Settings may have no IP stored
        if (!apiKey.key) {
            // Trying to receive the IP trough auto-discovery
            if (discovery[apiKey.key]) {
                apiKey.key = discovery[apiKey.key].key;
            }

            // If no IP can be found for this Bridge we need to stop here
            else {
                log(`No IP found for paired Bridge ID: ${apiKey.key}`);
                return;
            }
        }

        // Create a api instance
        let api = new Api(apiKey.key);

        // Create api cache
        let keyCache = {'acs': {}};
        keyCache.key = api.getKey();
        instance.data[api.getKey()] = keyCache;
        api.getACs((inSuccess, inLights) => {
            // If getLights was not successful
            if (!inSuccess) {
                log(inLights);
                return;
            }

            // Create cache for each light
            inLights.forEach(inLight => {
                // Add light to cache
                instance.data[api.getKey()].acs[inLight.getID()] = {
                    id: inLight.getID(),
                    name: inLight.getName(),
                    uid: inLight.getUID(),
                    mode: inLight.getMode(),
                    fanlevel: inLight.getFanLevel(),
                    power: inLight.getPower(),
                    temperature: inLight.getTemperature(),
                };
            });

        });
    }

    // Public function to start polling
    this.startPolling = () => {
        // Log to the global log file
        log('Start polling to create cache');

        // Start a timer
        instance.refresh();
        timer = setInterval(instance.refresh, autoRefreshTime * 1000);
    }

    // Public function to stop polling
    this.stopPolling = () => {
        // Log to the global log file
        log('Stop polling to create cache');

        // Invalidate the timer
        clearInterval(timer);
        timer = null;
    }

    // Private function to build a cache
    this.refresh = () => {
        // Build discovery if necessary
        buildDiscovery(() => {
            if (globalSettings.keys) {
                Object.keys(globalSettings.keys).forEach(bridgeID => refreshApiKey(bridgeID, globalSettings.keys[bridgeID]));
            }
        })
    };
}

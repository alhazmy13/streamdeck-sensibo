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

  // Private function to discover all keys on the network
  function buildDiscovery(inCallback) {
    // Check if discovery ran already
    if (discovery != null) {
      inCallback(true);
      return;
    }

    // Init discovery variable to indicate that it ran already
    discovery = {};

    if (!('keys' in globalSettings)) {
      inCallback(false);
      return;
    }

    // Run discovery
    // For all discovered keys
    Api.discover((inSuccess, inKeys) => {
      // If the discovery was not successful
      if (!inSuccess) {
        inCallback(false);
        return;
      }
      Object.keys(inKeys).forEach((inkey) => {
        // Add new key to discovery object
        log(inkey);
        discovery[inkey.getKey()] = {
          key: inkey.getKey()
        };
      });

      inCallback(true);
    });
  }

  // Gather all required information by a key via ID
  function refreshApiKey(pairedApiKey, apiKey) {
    // Older keys in Settings may have the ID stored inside the object
    if (!apiKey.key) {
      apiKey.key = pairedApiKey;
    }

    // Older keys in Settings may have no IP stored
    if (!apiKey.key) {
      // Trying to receive the IP trough auto-discovery
      if (discovery[apiKey.key]) {
        apiKey.key = discovery[apiKey.key].key;
      }

      // If no IP can be found for this key we need to stop here
      else {
        log(`No key found for paired key ID: ${apiKey.key}`);
        return;
      }
    }

    // Create a api instance
    let api = new Api(apiKey.key);

    // Create api cache
    let keyCache = { acs: {} };
    keyCache.key = api.getKey();
    let oldCache = Object.assign({}, instance.data);
    instance.data[api.getKey()] = keyCache;
    api.getACs((inSuccess, inACs) => {
      // If geetACs was not successful
      if (!inSuccess) {
        log(inACs);
        return;
      }

      // Create cache for each ac
      inACs.forEach((inAc) => {
        // Add ac to cache
        instance.data[api.getKey()].acs[inAc.getID()] = {
          id: inAc.getID(),
          name: inAc.getName(),
          uid: inAc.getUID(),
          mode: inAc.getMode(),
          fanlevel: inAc.getFanLevel(),
          power: inAc.getPower(),
          temperature: inAc.getTemperature()
        };
      });

      if (JSON.stringify(oldCache) != JSON.stringify(instance.data)) {
        let event = new CustomEvent('newCacheAvailable');
        document.dispatchEvent(event);
      }
    });
  }

  // Public function to start polling
  this.startPolling = () => {
    // Log to the global log file
    log('Start polling to create cache');

    // Start a timer
    instance.refresh();
    timer = setInterval(instance.refresh, autoRefreshTime * 1000);
  };

  // Public function to stop polling
  this.stopPolling = () => {
    // Log to the global log file
    log('Stop polling to create cache');

    // Invalidate the timer
    clearInterval(timer);
    timer = null;
  };

  // Private function to build a cache
  this.refresh = () => {
    // Build discovery if necessary
    buildDiscovery(() => {
      if (globalSettings.keys) {
        Object.keys(globalSettings.keys).forEach((keyID) =>
          refreshApiKey(keyID, globalSettings.keys[keyID])
        );
      }
    });
  };
}

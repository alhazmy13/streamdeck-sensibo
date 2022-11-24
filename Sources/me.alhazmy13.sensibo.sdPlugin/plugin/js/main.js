/**
 @file      main.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

// Global web socket
var websocket = null;

// Global cache
var cache = {};

// Global settings
var globalSettings = {};

// Setup the websocket and handle communication
function connectElgatoStreamDeckSocket(
    inPort,
    inPluginUUID,
    inRegisterEvent,
    inInfo
) {
    // Create array of currently used actions
    let actions = {};

    // Create a cache
    cache = new Cache();

    // Open the web socket to Stream Deck
    // Use 127.0.0.1 because Windows needs 300ms to resolve localhost
    websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);

    // Web socket is connected
    websocket.onopen = () => {
        // Register plugin to Stream Deck
        registerPluginOrSensibo(inRegisterEvent, inPluginUUID);

        // Request the global settings of the plugin
        requestGlobalSettings(inPluginUUID);
    };

    // Add event listener
    document.addEventListener(
        'newCacheAvailable',
        () => {
            // When a new cache is available
            Object.keys(actions).forEach((inContext) => {
                // Inform all used actions that a new cache is available
                actions[inContext].newCacheAvailable(() => {
                    let action;

                    // Find out type of action
                    if (actions[inContext] instanceof PowerAction) {
                        action = 'me.alhazmy13.sensibo.power';
                    } else if (actions[inContext] instanceof TemperatureAction) {
                        action = 'me.alhazmy13.sensibo.temperature';
                    } else if (actions[inContext] instanceof FanAction) {
                        action = 'me.alhazmy13.sensibo.fan';
                    } else if (actions[inContext] instanceof ModeAction) {
                        action = 'me.alhazmy13.sensibo.mode';
                    } else if (actions[inContext] instanceof SwingAction) {
                        action = 'me.alhazmy13.sensibo.swing';
                    } else if (actions[inContext] instanceof HorizontalSwingAction) {
                        action = 'me.alhazmy13.sensibo.horizontal_swing';
                    }

                    // Inform Action of new cache
                    sendToPropertyInspector(action, inContext, cache.data);
                });
            });
        },
        false
    );

    // Web socked received a message
    websocket.onmessage = (inEvent) => {
        // Parse parameter from string to object
        let jsonObj = JSON.parse(inEvent.data);

        // Extract payload information
        let event = jsonObj['event'];
        let action = jsonObj['action'];
        let context = jsonObj['context'];
        let jsonPayload = jsonObj['payload'];
        let settings;

        // Key up event
        if (event === 'keyUp') {
            settings = jsonPayload['settings'];
            let coordinates = jsonPayload['coordinates'];
            let userDesiredState = jsonPayload['userDesiredState'];
            let state = jsonPayload['state'];

            // Send onKeyUp event to actions
            if (context in actions) {
                actions[context].onKeyUp(
                    context,
                    settings,
                    coordinates,
                    userDesiredState,
                    state
                );
            }

            // Refresh the cache
            cache.refresh(context);
        } else if (event === 'willAppear') {
            settings = jsonPayload['settings'];

            // If this is the first visible action
            if (Object.keys(actions).length === 0) {
                // Start polling
                cache.startPolling(context);
            }

            // Add current instance is not in actions array
            if (!(context in actions)) {
                // Add current instance to array
                if (action === 'me.alhazmy13.sensibo.power') {
                    actions[context] = new PowerAction(context, settings);
                } else if (action === 'me.alhazmy13.sensibo.temperature') {
                    actions[context] = new TemperatureAction(context, settings);
                } else if (action === 'me.alhazmy13.sensibo.fan') {
                    actions[context] = new FanAction(context, settings);
                } else if (action === 'me.alhazmy13.sensibo.mode') {
                    actions[context] = new ModeAction(context, settings);
                } else if (action === 'me.alhazmy13.sensibo.swing') {
                    actions[context] = new SwingAction(context, settings);
                } else if (action === 'me.alhazmy13.sensibo.horizontal_swing') {
                    actions[context] = new HorizontalSwingAction(context, settings);
                }
            }
        } else if (event === 'willDisappear') {
            // Remove current instance from array
            if (context in actions) {
                delete actions[context];
            }

            // If this is the last visible action
            if (Object.keys(actions).length === 0) {
                // Stop polling
                cache.stopPolling();
            }
        } else if (event === 'didReceiveGlobalSettings') {

            // Set global settings
            globalSettings = jsonPayload['settings'];

            // If at least one action is active
            if (Object.keys(actions).length > 0) {
                // Refresh the cache
                cache.refresh(context);
            }
        } else if (event === 'didReceiveSettings') {
            settings = jsonPayload['settings'];

            // Set settings
            if (context in actions) {
                actions[context].setSettings(settings);
            }
            cache.refresh(context);
            // }
        } else if (event === 'propertyInspectorDidAppear') {
            // Send cache to PI
            sendToPropertyInspector(action, context, cache.data);
        } else if (event === 'sendToPlugin') {
            let sensiboEvent = jsonPayload['sensiboEvent'];
            if (sensiboEvent === 'valueChanged') {
                if (action !== 'me.alhazmy13.sensibo.power') {
                    let state = jsonPayload['state'];
                    // Send manual state event to action
                    if (context in actions) {
                        actions[context].onStateChanged(context, state);
                    }
                }
            }
        }
    };
}

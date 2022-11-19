/**
 @file      fan.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

function Fan(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
    // Init Temperature
    let instance = this;

    // Inherit from Sensibo
    Sensibo.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

    let sensiboLocalize = this.localize;

    // Localize the UI
    this.localize = () => {
        // Call  localize method
        sensiboLocalize.call(instance);

        // Localize the temperature label
        document.getElementById('fan-level-label').innerHTML = instance.localization['FanLevel'];
    };


    document.getElementById('placeholder').innerHTML = `
             <div class="sdpi-item">
                <div class="sdpi-item-label" id="fan-level-label"></div>
                <select class="sdpi-item-value select" id="fan-level-select">
                  <option value="auto">Auto</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
        `;
    document.getElementById('fan-level-select').value = settings.fan_level;


    document.getElementById('fan-level-select').addEventListener('change', tempValueChanged);


    function tempValueChanged(inEvent) {
        log(inEvent.target.value)
        settings.fan_level = inEvent.target.value;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
        });
    }

}

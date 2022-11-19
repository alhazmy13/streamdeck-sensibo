/**
 @file      mode.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

function Mode(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
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
        document.getElementById('mode-label').innerHTML = instance.localization['Mode'];
    };


    document.getElementById('placeholder').innerHTML = `
             <div class="sdpi-item">
                <div class="sdpi-item-label" id="mode-label"></div>
                <select class="sdpi-item-value select" id="mode-select">
                  <option value="auto">Auto</option>
                  <option value="cool">Cool</option>
                  <option value="heat">Heat</option>
                  <option value="fan">Fan</option>
                  <option value="dry">Dry</option>
                </select>
              </div>
        `;
    document.getElementById('mode-select').value = settings.mode;


    document.getElementById('mode-select').addEventListener('change', modeValueChanged);


    function modeValueChanged(inEvent) {
        log(inEvent.target.value)
        settings.mode = inEvent.target.value;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
        });
    }

}

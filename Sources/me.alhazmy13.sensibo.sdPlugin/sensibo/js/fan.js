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

        document.getElementById('fan-level-label').innerHTML = instance.localization['Type'];
        if ('fan_mode' in settings) {
            if (settings.fan_mode === 'set') {
                document.getElementById('set').checked = true;
                this.loadExtraPlaceHolder(settings.fan_mode)
            } else {
                document.getElementById('toggle').checked = true;

            }
        }
    };

    document.getElementById('placeholder').innerHTML = `
          <div type="radio" class="sdpi-item">
            <div class="sdpi-item-label" id="fan-level-label"></div>
                <div class="sdpi-item-value ">
                    <div class="sdpi-item-child">
                        <input id="set" type="radio" name="fan-mode-type" value="set">
                        <label for="set" class="sdpi-item-label"><span></span>Set</label>
                    </div>
                    <div class="sdpi-item-child">
                        <input id="toggle" type="radio" value="toggle" name="fan-mode-type">
                        <label for="toggle" class="sdpi-item-label"><span></span>Toggle</label>
                    </div>
                </div>
          </div>
        `;

    document.querySelectorAll('input[name="fan-mode-type"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {
            fanModeTypeChanged(event.target.value);
        });
    });


    this.loadExtraPlaceHolder = (value) => {
        let tempType;
        if (value === 'set') {
            tempType = `
                <div class="sdpi-item">
                <div class="sdpi-item-label" id="fan-level-label">${instance.localization['FanLevel']}</div>
                <select class="sdpi-item-value select" id="fan-level-select">
                  <option value="auto">Auto</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            `;

        }
        // Add color picker

        if (tempType) {
            document.getElementById('placeholder-extra').innerHTML = tempType;
            initToolTips();
            document.getElementById('fan-level-select').addEventListener('change', fanLevelValueChanged);
            document.getElementById('fan-level-select').value = settings.fan_level;
        } else {
            document.getElementById('placeholder-extra').innerHTML = '';
        }


    }

    function fanModeTypeChanged(value) {
        instance.loadExtraPlaceHolder(value);
        // Initialize the tooltips

        settings.fan_mode = value;
        if (value === 'toggle' && 'fan_level' in settings) {
            delete settings['fan_level'];
        }
        instance.saveSettings();




        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                fan_mode: value
            }
        });

    }

    function fanLevelValueChanged(inEvent) {
        settings.fan_level = inEvent.target.value;
        instance.saveSettings();

        // Inform the plugin that a new fan level is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                fan_level: inEvent.target.value,
                fan_mode: settings.fan_mode
            }
        });
    }

}

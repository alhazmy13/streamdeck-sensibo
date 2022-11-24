/**
 @file      horizontalSwing.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

function HorizontalSwing(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
    // Init
    let instance = this;

    // Inherit from Sensibo
    Sensibo.call(this, inContext, inLanguage, inStreamDeckVersion, inPluginVersion);

    let sensiboLocalize = this.localize;

    // Localize the UI
    this.localize = () => {
        // Call  localize method
        sensiboLocalize.call(instance);

        // Localize the temperature label

        document.getElementById('swing-state-label').innerHTML = instance.localization['Type'];
        if ('horizontal_swing_mode' in settings) {
            if (settings.horizontal_swing_mode === 'set') {
                document.getElementById('set').checked = true;
                this.loadExtraPlaceHolder(settings.horizontal_swing_mode)
            } else {
                document.getElementById('toggle').checked = true;

            }
        }
    };

    document.getElementById('placeholder').innerHTML = `
          <div type="radio" class="sdpi-item">
            <div class="sdpi-item-label" id="swing-state-label"></div>
                <div class="sdpi-item-value ">
                    <div class="sdpi-item-child">
                        <input id="set" type="radio" name="swing-mode-type" value="set">
                        <label for="set" class="sdpi-item-label"><span></span>Set</label>
                    </div>
                    <div class="sdpi-item-child">
                        <input id="toggle" type="radio" value="toggle" name="fan-mode-type">
                        <label for="toggle" class="sdpi-item-label"><span></span>Toggle</label>
                    </div>
                </div>
          </div>
        `;

    document.querySelectorAll('input[name="swing-mode-type"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {
            fanModeTypeChanged(event.target.value);
        });
    });


    this.loadExtraPlaceHolder = (value) => {
        let tempType;
        if (value === 'set') {
            tempType = `
                <div class="sdpi-item">
                <div class="sdpi-item-label" id="swing-mode-label">${instance.localization['Mode']}</div>
                <select class="sdpi-item-value select" id="swing-state-select">
                  <option value="stopped">Stopped</option>
                  <option value="rangeful">Rangeful</option>
                </select>
              </div>
            `;

        }
        // Add color picker
        if (tempType) {
            document.getElementById('placeholder-extra').innerHTML = tempType;
            initToolTips();
            document.getElementById('swing-state-select').addEventListener('change', fanLevelValueChanged);
            document.getElementById('swing-state-select').value = settings.horizontal_swing_state;
        } else {
            document.getElementById('placeholder-extra').innerHTML = '';
        }


    }

    function fanModeTypeChanged(value) {
        instance.loadExtraPlaceHolder(value);

        settings.horizontal_swing_mode = value;
        if (value === 'toggle' && 'swing_state' in settings) {
            delete settings['swing_state'];
        }
        instance.saveSettings();

        // Inform the plugin that a new setting is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                horizontal_swing_mode: value
            }
        });

    }

    function fanLevelValueChanged(inEvent) {
        settings.horizontal_swing_state = inEvent.target.value;
        instance.saveSettings();

        // Inform the plugin that a new setting is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                horizontal_swing_state: inEvent.target.value,
                horizontal_swing_mode: settings.horizontal_swing_mode
            }
        });
    }

}

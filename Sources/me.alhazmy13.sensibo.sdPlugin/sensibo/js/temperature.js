/**
 @file      temperature.js
 @brief     Sensibo Plugin
 @copyright (c) 2022, Abdullah Alhazmy.
 @license   This source code is licensed under the MIT-style license found in the LICENSE file.
 */

function Temperature(inContext, inLanguage, inStreamDeckVersion, inPluginVersion) {
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
        document.getElementById('type-label').innerHTML = instance.localization['Type'];
        document.getElementById('live-preview-label').innerHTML = instance.localization['LivePreview'];
        document.getElementById('on-label').innerHTML = instance.localization['On'];
        document.getElementById('set-label').innerHTML = instance.localization['Set'];
        document.getElementById('adjust-label').innerHTML = instance.localization['Adjust'];
        if ('temp_mode' in settings) {
            if (settings.temp_mode === 'set') {
                document.getElementById('set').checked = true;
            } else {
                document.getElementById('adjust').checked = true;

            }
        }
    };


    document.getElementById('placeholder').innerHTML = `
        <div type="checkbox" class="sdpi-item" id="single-check">
            <div class="sdpi-item-label" id="live-preview-label"></div>
            <div class="sdpi-item-value">
                <div class="sdpi-item-child">
                    <input id="live-preview" type="checkbox" value="true">
                    <label for="live-preview" class="sdpi-item-label"><span></span><p style="display:inline" id="on-label"></p></label>
                </div>
            </div>
        </div>
          <div type="radio" class="sdpi-item">
            <div class="sdpi-item-label" id="type-label"></div>
                <div class="sdpi-item-value ">
                    <div class="sdpi-item-child">
                        <input id="set" type="radio" name="temperature-type" value="set">
                        <label for="set" class="sdpi-item-label"><span></span><p style="display:inline"  id="set-label"></p></label>
                    </div>
                    <div class="sdpi-item-child">
                        <input id="adjust" type="radio" value="adjust" name="temperature-type">
                        <label for="adjust" class="sdpi-item-label"><span></span><p style="display:inline"  id="adjust-label"></p></label>
                    </div>
                </div>
          </div>
        `;

    document.getElementById('live-preview').addEventListener('change', livePreviewChanged);
    document.getElementById('live-preview').checked = settings.temp_live_preview;
    document.querySelectorAll('input[name="temperature-type"]').forEach((elem) => {
        elem.addEventListener("change", function (event) {
            tempTypeChanged(event.target.value);
        });
    });

    this.loadSteps = (value) => {
        let tempType;
        if (value === 'set') {
            tempType = `
              <div type="color" class="sdpi-item">
                <div class="sdpi-item-label" id="color-label">${instance.localization['Value']}</div>
                <input type="number" class="sdpi-item-value" id="temp-value" value="${settings.temp_value}">
              </div>
            `;

        } else if (value === 'adjust') {
            tempType = `
              <div type="range" class="sdpi-item">
                <div class="sdpi-item-label" id="temperature-label">${instance.localization['Steps']}</div>
                <div class="sdpi-item-value">
                  <input class="temperature floating-tooltip" data-suffix="C" type="range" id="temp-value" min="-5" max="5" value="${settings.temp_value}">
                </div>
              </div>
            `;
        }

        // Add color picker

        if (tempType) {
            document.getElementById('placeholder-extra').innerHTML = tempType;
            initToolTips();
            document.getElementById('temp-value').addEventListener('change', tempValueChanged);

        }


    }

    function tempTypeChanged(value) {
        // Initialize the tooltips

        settings.temp_mode = value;
        if ('temp_value' in settings) {
            delete settings['temp_value'];
        }
        instance.saveSettings();
        instance.loadSteps(value);

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                temp_mode: value
            }
        });

    }

    function tempValueChanged() {
        let tempValue = document.getElementById('temp-value').value;
        settings.temp_value = tempValue;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                temp_mode: settings.temp_mode,
                temp_value: tempValue
            }
        });
    }

    function livePreviewChanged(event) {
        let checked = event.target.checked;
        settings.temp_live_preview = checked;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
            state: {
                temp_live_preview: checked
            }
        });
    }

}

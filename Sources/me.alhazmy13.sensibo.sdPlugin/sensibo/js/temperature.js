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
        document.getElementById('temperature-label').innerHTML = instance.localization['Temperature'];
        if ('temp_type' in settings) {
            if (settings.temp_type === 'set') {
                document.getElementById('set').checked = true;
            } else {
                document.getElementById('adjust').checked = true;

            }
        }
    };


    document.getElementById('placeholder').innerHTML = `
          <div type="radio" class="sdpi-item">
            <div class="sdpi-item-label" id="temperature-label"></div>
                <div class="sdpi-item-value ">
                    <div class="sdpi-item-child">
                        <input id="set" type="radio" name="temperature-type" value="set" checked>
                        <label for="set" class="sdpi-item-label"><span></span>Set</label>
                    </div>
                    <div class="sdpi-item-child">
                        <input id="adjust" type="radio" value="adjust" name="temperature-type">
                        <label for="adjust" class="sdpi-item-label"><span></span>Adjust</label>
                    </div>
                </div>
          </div>
        `;

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
        } else {
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
        document.getElementById('placeholder-extra').innerHTML = tempType;
        initToolTips();

        document.getElementById('temp-value').addEventListener('change', tempValueChanged);


    }

    function tempTypeChanged(value) {
        instance.loadSteps(value);
        // Initialize the tooltips

        settings.temp_type = value;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
        });

    }

    function tempValueChanged() {
        let tempValue = document.getElementById('temp-value').value;
        log(tempValue);
        settings.temp_value = tempValue;
        instance.saveSettings();

        // Inform the plugin that a new ac is set
        instance.sendToPlugin({
            sensiboEvent: 'valueChanged',
        });
    }

}

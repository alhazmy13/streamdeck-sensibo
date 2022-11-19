/**
@file      introView.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/

// Load the intro view
function loadIntroView() {
    // Set the status bar
    setStatusBar('intro');

    // Fill the title
    document.getElementById('title').innerHTML = localization['Intro']['Title'];
    // Fill the content area
    document.getElementById('content').innerHTML = `
        <p>${localization['Intro']['Description']}
        <a href="https://home.sensibo.com/me/api" target="_blank">https://home.sensibo.com/me/api</a>
        </p>
        <br />
        <div id="key-validation" class="error-container"></div>
        <label>${localization['Intro']['ApiKey']}</label>
        <input type="text" id="apikey" />
        <div class="button block" id="check">${localization['Intro']['Check']}</div>
        <div class="button-transparent" id="close">${localization['Intro']['Close']}</div>
    `;

    // Add event listener
   // Set cursor to input field
    document.getElementById('apikey').focus();

    // Add event listener
    document.getElementById('check').addEventListener('click', check);
    document.addEventListener('enterPressed', check);

    document.getElementById('close').addEventListener('click', close);
    document.addEventListener('escPressed', close);

    // Load the pairing view
    function startPairing() {
        unloadIntroView();
    }


   // Print error message
    function printError(error) {
        document.getElementById('key-validation').innerHTML = `<div class="error">${error}</div>`;
    }
    // Check ip address
    function check() {
        let apikey = document.getElementById('apikey').value.trim();

        // check if input is empty
        if (!apikey) {
            printError(localization['Intro']['Error']['Empty']);
            return;
        }


        Api.check(apikey, (success, data) => {
            if (success) {
                key = new Api(apikey);
                keys = [
                    key,
                ];

                startSave();
            }
            else {
                printError(localization['Intro']['Error']['Invalid']);
            }
        });
    }
    // Load the manual view
    function startSave() {
        unloadIntroView();
        loadSaveView();
    }

    // Close the window
    function close() {
        window.close();
    }

    // Unload view
    function unloadIntroView() {
        // Remove event listener
        document.removeEventListener('enterPressed', startPairing);
        document.removeEventListener('escPressed', close);
    }
}

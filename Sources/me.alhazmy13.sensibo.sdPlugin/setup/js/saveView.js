/**
@file      saveView.js
@brief     Sensibo Plugin
@copyright (c) 2022, Abdullah Alhazmy.
@license   This source code is licensed under the MIT-style license found in the LICENSE file.
*/

// Load the save view
function loadSaveView() {
    // Set the status bar
    setStatusBar('save');

    // Fill the title
    document.getElementById('title').innerHTML = localization['Save']['Title'];

    // Fill the content area
    document.getElementById('content').innerHTML = `
        <p>${localization['Save']['Description']}</p>
        <img class="image" src="images/check.png" alt="${localization['Save']['Title']}">
        <div class="button" id="close">${localization['Save']['Save']}</div>
    `;

    // Add event listener
    document.getElementById('close').addEventListener('click', close);
    document.addEventListener('enterPressed', close);

    // Save the key
    window.opener.document.dispatchEvent(new CustomEvent('saveKey', {
        detail: {
            key: key.getKey(),
        }
    }));

    // Close this window
    function close() {
        window.close();
    }
}

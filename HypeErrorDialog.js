/*!
 * Hype Error Dialog Extension
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release under MIT-license
 */


// Ensure the extension isn't redefined
if ("HypeErrorDialog" in window === false) {
    window['HypeErrorDialog'] = (function () {

        // Define default settings for the extension
        var _default = {
            // No default properties needed for this extension
        };

        /**
         * Set or update a default value for the extension.
         * 
         * @param {String|Object} key - The default's key or an object with multiple defaults.
         * @param {*} [value] - The new value for the default, if key is a string.
         */
        function setDefault(key, value) {
            if (typeof key === 'object') {
                _default = Object.assign(_default, key);
            } else {
                _default[key] = value;
            }
        }

        /**
         * Get the current value of a default.
         * 
         * @param {String} [key] - The key of the default to get. If omitted, all defaults are returned.
         * @returns {*} The default value(s).
         */
        function getDefault(key) {
            return key ? _default[key] : _default;
        }
        
        // Function to format Hype function code
        function formatHypeFunction(code) {
            const hypeFunctionPattern = /\(function\(\)\{return function\(hypeDocument, element, event\) \{([\s\S]*?)\}\}\)\(\)/;
            const match = code.match(hypeFunctionPattern);
            if (match) {
                return `function(hypeDocument, element, event) {\n${match[1]}\n}`;
            }
            return code;
        }

        /**
         * This function determines if we are in a Hype Preview.
         *
         * @return {Boolean} Return true if in Hype Preview
         */
        function isHypePreview() {
            return window.location.href.indexOf("127.0.0.1:") != -1 &&
                window.location.href.indexOf("/preview/") != -1 &&
                navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        }

        /**
         * This function determines if we are in the Hype IDE.
         *
         * @return {Boolean} Return true if in Hype IDE
         */
        function isHypeIDE() {
            return window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1;
        }

        // Determine if the code should run based on the environment
        const inHypePreview = isHypePreview();
        const inHypeIDE = isHypeIDE();

        if (inHypePreview && !inHypeIDE) {
            // Function to dynamically inject CSS for the error dialog
            function injectErrorDialogStyles() {
                const style = document.createElement('style');
                style.textContent = `
                    .custom-error-dialog {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: linear-gradient(45deg, #f0f0f0, #ffffff);
                        border: 1px solid black;
                        border-radius: 10px;
                        padding: 20px;
                        z-index: 10000;
                        font-family: 'Arial', sans-serif;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        max-width: 600px;
                        text-align: left;
                        overflow: hidden;
                    }
                    .custom-error-dialog h2 {
                        margin: 0 0 10px 0;
                        font-size: 18px;
                        color: red;
                    }
                    .custom-error-dialog pre {
                        background: #f9f9f9;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                        white-space: pre-wrap;
                        max-height: 200px;
                    }
                    .custom-error-dialog .close-btn {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: none;
                        border: none;
                        font-size: 20px;
                        cursor: pointer;
                        color: #ff0000;
                    }
                    .error-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.2);
                        z-index: 9999;
                    }
                `;
                document.head.appendChild(style);
            }

	        // Function to show the custom error dialog
	        function showErrorDialog(message, source, lineno, colno, error) {
	            // Remove any existing error dialog
	            const existingDialog = document.querySelector('.custom-error-dialog');
	            if (existingDialog) {
	                existingDialog.remove();
	            }
	
	            // Create an overlay to dim the background
	            const overlay = document.createElement('div');
	            overlay.className = 'error-overlay';
	            document.body.appendChild(overlay);
	
	            // Format the source code if it matches the Hype function pattern
	            const formattedSource = formatHypeFunction(source);
	
	            // Create the error dialog
	            const errorDialog = document.createElement('div');
	            errorDialog.className = 'custom-error-dialog';
	            errorDialog.innerHTML = `
	                <button class="close-btn" onclick="document.querySelector('.custom-error-dialog').remove(); document.querySelector('.error-overlay').remove();">&times;</button>
	                <h2>JavaScript Error</h2>
	                <p><strong>Message:</strong> ${message}</p>
	                <p><strong>Source:</strong> ${formattedSource || 'N/A'}</p>
	                <p><strong>Line:</strong> ${lineno || 'N/A'}</p>
	                <p><strong>Column:</strong> ${colno || 'N/A'}</p>
	                <pre><strong>Error Object:</strong>\n${error ? error.stack : 'N/A'}</pre>
	            `;
	            document.body.appendChild(errorDialog);
	        }

            // Inject the styles
            injectErrorDialogStyles();

            // Store the original eval function
            const originalEval = window.eval;

            // Override the eval function
            window.eval = function (code) {
                try {
                    // Attempt to evaluate the code using the original eval
                    return originalEval(code);
                } catch (error) {
                    // Show the custom error dialog
                    showErrorDialog(error.message, code, '', '', error);
                    throw error; // Re-throw the error to ensure normal error propagation
                }
            };

            // Global error handler
            window.onerror = function (message, source, lineno, colno, error) {
                showErrorDialog(message, source, lineno, colno, error);
            };
        }

        // Public API for the extension
        return {
            version: '1.0.0',
            setDefault: setDefault,
            getDefault: getDefault,
            isHypePreview: isHypePreview,
            isHypeIDE: isHypeIDE
        };

    })();
}

/*!
 * Hype Error Dialog Extension
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release under MIT-license
 * 1.0.1 Better formating for Hype Errors
 * 1.0.2 Better formating for regular JavaScript Errors
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
        function formatHypeFunction(functionName, code) {
            const match = code.match(/\(function\(\)\{return function\(hypeDocument, element, event\) \{([\s\S]*?)\}\}\)\(\);/);
            if (match && match[1]) {
                const functionBody = match[1]
                return `${functionName} (hypeDocument, element, event) {\n${functionBody}\n}`;
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
	        function showErrorDialog(message, source, lineno, colno, error, docName = '', funcName = '') {
	            // Remove any existing error dialog
	            const existingDialog = document.querySelector('.custom-error-dialog');
	            if (existingDialog) {
	                existingDialog.remove();
	            }
	
	            // Create an overlay to dim the background
	            const overlay = document.createElement('div');
	            overlay.className = 'error-overlay';
	            document.body.appendChild(overlay);
	
	            // Create the error dialog
	            const errorDialog = document.createElement('div');
	            errorDialog.className = 'custom-error-dialog';
	            errorDialog.innerHTML = `
	                <button class="close-btn" onclick="document.querySelector('.custom-error-dialog').remove(); document.querySelector('.error-overlay').remove();">&times;</button>
	                <h2>JavaScript Error</h2>
	                <p><strong>Message:</strong> ${message}</p>
	                ${docName ? `<p><strong>Hype Document:</strong> ${docName}</p>` : ''}
	                ${funcName ? `<p><strong>Hype Function:</strong> ${funcName}</p>` : ''}
	                <p><strong>Source:</strong></p>
	                <pre>${source || 'N/A'}</pre>
	                ${lineno ? `<p><strong>Line:</strong> ${lineno}</p>` : ''}
	                ${colno ? `<p><strong>Column:</strong> ${colno}</p>` : ''}
	                <p><strong>Error Object:</strong></p>
	                <pre style="overflow-x: auto; white-space: pre;">${error ? error.stack : 'N/A'}</pre>
	            `;
	            document.body.appendChild(errorDialog);
	        }

            // Inject the styles
            injectErrorDialogStyles();

            // Store the original eval function
            const originalEval = window.eval;

            // Generate a unique ID for the error
            function generateUniqueId() {
                return 'error-' + Math.random().toString(36).substr(2, 9);
            }

            // Scan Hype documents for functions with specific ID
            function scanHypeDocumentsForId(id) {
                var hypeDocs = window.HYPE.documents;
                for (var docName in hypeDocs) {
                    var hypeDoc = hypeDocs[docName];
                    var functions = hypeDoc.functions();
                    for (var funcName in functions) {
                        if (functions.hasOwnProperty(funcName)) {
                            var func = functions[funcName];
                            var funcString = func.toString();
                            if (funcString.indexOf(id) !== -1) {
                                return {
                                    docName: docName,
                                    functionName: funcName,
                                    functionString: funcString
                                };
                            }
                        }
                    }
                }
                return null;
            }

            // Check if a function is a Hype function
            function isHypeFunction(code) {
                return /\(function\(\)\{return function\(hypeDocument, element, event\) \{/.test(code);
            }

            // Override the eval function
            window.eval = function (code) {
                const id = generateUniqueId();
                let codeToEval = code;

                if (isHypeFunction(code)) {

                    // Try to evaluate the code
                    try {
                        return originalEval(codeToEval);
                    } catch (error) {
                        // Return a function with the unique ID comment instead of throwing an error
                        const errorFunction = new Function(`/*${id}*/`);
                        
                        // Delay the dialog display to allow for the eval assignment
                        requestAnimationFrame(function() {
                            const result = scanHypeDocumentsForId(id);
                            let originalSource = code;  // Use original source code
                            let docName = '';
                            let funcName = '';
                            if (result) {
                                docName = result.docName;
                                funcName = result.functionName;
                            }
                            // Show the custom error dialog
                            showErrorDialog(error.message, formatHypeFunction(funcName, originalSource), '', '', error, docName, funcName);
                        });

                        return errorFunction;
                    }
                } else {
                    // Regular JavaScript function
                    try {
                        return originalEval(code);
                    } catch (error) {
                        showErrorDialog(error.message, code, '', '', error);
                        throw error;
                    }
                }
            };

            // Global error handler
            window.onerror = function (message, source, lineno, colno, error) {
                showErrorDialog(message, source, lineno, colno, error);
            };
            

        }

        // Public API for the extension
        return {
            version: '1.0.2',
            setDefault: setDefault,
            getDefault: getDefault,
            isHypePreview: isHypePreview,
            isHypeIDE: isHypeIDE,
            showErrorDialog: showErrorDialog
        };

    })();
    
    window.onerror = function (message, source, lineno, colno, error) {
        if (!HypeErrorDialog.isHypeIDE() && HypeErrorDialog.isHypePreview()) {
            setTimeout(function(){
                HypeErrorDialog.showErrorDialog(message, source, lineno, colno, error);
            }, 1);
        }
    }
}

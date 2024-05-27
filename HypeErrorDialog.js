/*!
 * Hype Error Dialog Extension v1.0.2
 * Copyright (2024) Max Ziebell, (https://maxziebell.de). MIT-license
 */

/*
 * Version-History
 * 1.0.0 Initial release under MIT-license
 * 1.0.1 Better formatting for Hype Errors
 * 1.0.2 Better formatting for regular JavaScript Errors
 */

if ("HypeErrorDialog" in window === false) {
    window.HypeErrorDialog = (function () {
        var _default = {};

        function setDefault(key, value) {
            if (typeof key === "object") {
                _default = Object.assign(_default, key);
            } else {
                _default[key] = value;
            }
        }

        function getDefault(key) {
            return key ? _default[key] : _default;
        }

        function formatHypeFunction(functionName, code) {
            const match = code.match(/\(function\(\)\{return function\(hypeDocument, element, event\) \{([\s\S]*?)\}\}\)\(\);/);
            if (match && match[1]) {
                const functionBody = match[1];
                return functionName + " (hypeDocument, element, event) {\n" + functionBody + "\n}";
            }
            return code;
        }

        function isHypePreview() {
            return window.location.href.indexOf("127.0.0.1:") != -1 &&
                window.location.href.indexOf("/preview/") != -1 &&
                navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        }

        function isHypeIDE() {
            return window.location.href.indexOf("/Hype/Scratch/HypeScratch.") != -1;
        }

        const inHypePreview = isHypePreview();
        const inHypeIDE = isHypeIDE();

        if (inHypePreview && !inHypeIDE) {
            function injectErrorDialogStyles() {
                const style = document.createElement("style");
                style.textContent = 
                    ".custom-error-dialog {" +
                        "position: fixed;" +
                        "top: 50%;" +
                        "left: 50%;" +
                        "transform: translate(-50%, -50%);" +
                        "background: linear-gradient(45deg, #f0f0f0, #ffffff);" +
                        "border: 1px solid black;" +
                        "border-radius: 10px;" +
                        "padding: 20px;" +
                        "z-index: 10000;" +
                        "font-family: 'Arial', sans-serif;" +
                        "box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);" +
                        "max-width: 600px;" +
                        "text-align: left;" +
                        "overflow: hidden;" +
                    "}" +
                    ".custom-error-dialog h2 {" +
                        "margin: 0 0 10px 0;" +
                        "font-size: 18px;" +
                        "color: red;" +
                    "}" +
                    ".custom-error-dialog pre {" +
                        "background: #f9f9f9;" +
                        "padding: 10px;" +
                        "border-radius: 5px;" +
                        "overflow-x: auto;" +
                        "white-space: pre-wrap;" +
                        "max-height: 200px;" +
                    "}" +
                    ".custom-error-dialog .close-btn {" +
                        "position: absolute;" +
                        "top: 10px;" +
                        "right: 10px;" +
                        "background: none;" +
                        "border: none;" +
                        "font-size: 20px;" +
                        "cursor: pointer;" +
                        "color: #ff0000;" +
                    "}" +
                    ".error-overlay {" +
                        "position: fixed;" +
                        "top: 0;" +
                        "left: 0;" +
                        "width: 100%;" +
                        "height: 100%;" +
                        "background: rgba(0, 0, 0, 0.2);" +
                        "z-index: 9999;" +
                    "}";
                document.head.appendChild(style);
            }

            function showErrorDialog(message, source, lineno, colno, error, docName, funcName) {
                const existingDialog = document.querySelector(".custom-error-dialog");
                if (existingDialog) {
                    existingDialog.remove();
                }

                const overlay = document.createElement("div");
                overlay.className = "error-overlay";
                document.body.appendChild(overlay);

                const errorDialog = document.createElement("div");
                errorDialog.className = "custom-error-dialog";
                errorDialog.innerHTML = 
                    "<button class='close-btn' onclick='document.querySelector(`.custom-error-dialog`).remove(); document.querySelector(`.error-overlay`).remove();'>&times;</button>" +
                    "<h2>JavaScript Error</h2>" +
                    "<p><strong>Message:</strong> " + message + "</p>" +
                    (docName ? "<p><strong>Hype Document:</strong> " + docName + "</p>" : "") +
                    (funcName ? "<p><strong>Hype Function:</strong> " + funcName + "</p>" : "") +
                    "<p><strong>Source:</strong></p>" +
                    "<pre>" + (source || "N/A") + "</pre>" +
                    (lineno ? "<p><strong>Line:</strong> " + lineno + "</p>" : "") +
                    (colno ? "<p><strong>Column:</strong> " + colno + "</p>" : "") +
                    "<p><strong>Error Object:</strong></p>" +
                    "<pre style='overflow-x: auto; white-space: pre;'>" + (error ? error.stack : "N/A") + "</pre>";
                document.body.appendChild(errorDialog);
            }

            injectErrorDialogStyles();

            const originalEval = window.eval;

            function generateUniqueId() {
                return "error-" + Math.random().toString(36).substr(2, 9);
            }

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

            function isHypeFunction(code) {
                return /\(function\(\)\{return function\(hypeDocument, element, event\) \{/.test(code);
            }

            window.eval = function (code) {
                const id = generateUniqueId();
                let codeToEval = code;

                if (isHypeFunction(code)) {
                    try {
                        return originalEval(codeToEval);
                    } catch (error) {
                        const errorFunction = new Function("/*" + id + "*/");
                        
                        requestAnimationFrame(function() {
                            const result = scanHypeDocumentsForId(id);
                            let originalSource = code;
                            let docName = "";
                            let funcName = "";
                            if (result) {
                                docName = result.docName;
                                funcName = result.functionName;
                            }
                            showErrorDialog(error.message, formatHypeFunction(funcName, originalSource), "", "", error, docName, funcName);
                        });

                        return errorFunction;
                    }
                } else {
                    try {
                        return originalEval(code);
                    } catch (error) {
                        showErrorDialog(error.message, code, "", "", error);
                        throw error;
                    }
                }
            };

            window.onerror = function (message, source, lineno, colno, error) {
                showErrorDialog(message, source, lineno, colno, error);
            };
        }

        return {
            version: "1.0.2",
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

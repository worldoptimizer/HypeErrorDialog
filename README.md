# Hype Error Dialog Extension

## Overview

The **Hype Error Dialog Extension** is a JavaScript extension for Tumult Hype that provides a custom error dialog for JavaScript errors. This extension helps users become aware of JavaScript errors without needing to frequently check the console.

## Key Features

- Displays a custom error dialog in the Hype Preview environment.
- Does not run in the Hype IDE or in exported projects.
- Formats Hype functions for better readability in the error dialog.

## Installation

1. **Add the Extension File to Your Hype Project:**
   - Upload the `HypeErrorDialog.js` file to the Hype Resources Library.

## Usage

The extension will automatically display a custom error dialog when a JavaScript error occurs in the Hype Preview environment. There is no need for additional configuration after installation.

**Note:** In production, you can remove the extension file from your resources. However, if left in, it will not trigger as it checks the URL to ensure it only runs in the preview.

## Future Plans

In the future, more features and improvements may be added to enhance error handling and debugging in Tumult Hype.

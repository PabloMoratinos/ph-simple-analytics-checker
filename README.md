
# PH Simple Analytics Checker

## Project info

**URL**: https://lovable.dev/projects/0e8429b9-d2b4-47c8-a3b4-aec422e6655f

## What is PH Simple Analytics Checker

Would you like to know with just one click which digital analytics tools are installed on a website?

PH Simple Analytics Checker is a Chrome extension that works as an analytics script detector.

It can detect:

- Google Tag Manager
- Google Analytics 4
- Adobe Analytics
- Amplitude
- MS Clarity

For some of these tools, it can also display their corresponding IDs.

---

## How to install the extension:

1. Download [this zip file with the compiled extension](https://drive.google.com/drive/folders/1fk-9UdtUnOGosQL2fHUsKBGJT5fv7AL5?usp=sharing).
2. Unzip it on your computer.
3. Open Chrome and type chrome://extensions in the address bar. Press Enter.
4. Enable Developer Mode using the toggle in the top right corner.
5. Click on Load unpacked, navigate to the ph-simple-analytics-checker-main directory, open it, and select the dist folder. This will install the extension in your browser.
6. Use the extension by clicking on it to open the side panel.

## Usage tips:

The extension checks for scripts when the page loads. On low-performance sites, it's a good idea to refresh the scan using the Refresh analysis button, in case some scripts take longer than usual to load. This might be a sign of potential tracking losses.

## Permissions Justification

This extension requires the following permissions, which are essential for its functionality:

### `activeTab`
This permission is required to access the current tab's information, allowing the extension to analyze the script tags and other elements in the currently open webpage. This is necessary to detect analytics tools embedded in the page.

### `scripting`
The `scripting` permission enables the extension to inject and execute content scripts in the active tab. This is crucial for examining the HTML structure and network requests to identify analytics tracking tools that may be loaded dynamically or through specific network requests (especially for tools like Amplitude and Clarity).

### `sidePanel`
The extension uses Chrome's side panel feature to display the analysis results without interrupting the user's browsing experience. This permission is necessary to create and control the side panel UI.

### `host_permissions: <all_urls>`
Access to all URLs is needed because:
1. The extension needs to analyze any website the user visits to detect analytics tools.
2. It needs to detect network requests to various analytics domains (e.g., amplitude.com, clarity.ms) regardless of which site the user is currently browsing.
3. Different analytics tools use different implementation methods, and some may load from external domains or use specific network requests that need to be monitored.

This broad permission is critical for the core functionality of detecting analytics tools across any website the user chooses to analyze.


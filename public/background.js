
// Configure the side panel to open when the extension action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Store detected analytics tools
let detectedAnalytics = {
  amplitude: false,
  clarity: false
};

// Check if URL is a chrome:// URL
function isChromeUrl(url) {
  return url.startsWith('chrome://');
}

// Listen for tab updates to refresh the side panel
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Skip chrome:// URLs
    if (tab.url && isChromeUrl(tab.url)) {
      console.log("Skipping analytics detection on chrome:// URL:", tab.url);
      return;
    }

    // Send a message to the extension that the page was loaded
    chrome.runtime.sendMessage({ 
      action: "pageLoaded", 
      tabId: tabId 
    }).catch(err => console.log("Error sending message:", err));

    // Execute a content script to detect Amplitude via network requests
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: checkForAmplitudeNetwork,
    }).then((results) => {
      if (results && results[0] && results[0].result) {
        detectedAnalytics.amplitude = results[0].result;
        // Notify the extension about the detected analytics
        chrome.runtime.sendMessage({
          action: "analyticsDetected",
          tool: "amplitude",
          detected: true
        }).catch(err => console.log("Error sending analytics detection message:", err));
      }
    }).catch(err => console.log("Error executing script for Amplitude detection:", err));

    // Execute a content script to detect Clarity via network requests
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: checkForClarityNetwork,
    }).then((results) => {
      if (results && results[0] && results[0].result) {
        detectedAnalytics.clarity = results[0].result;
        // Notify the extension about the detected analytics
        chrome.runtime.sendMessage({
          action: "analyticsDetected",
          tool: "clarity",
          detected: true
        }).catch(err => console.log("Error sending Clarity detection message:", err));
      }
    }).catch(err => console.log("Error executing script for Clarity detection:", err));
  }
});

// Function to be injected as a content script for Amplitude detection
function checkForAmplitudeNetwork() {
  // Look for Amplitude domains in network requests
  const amplitudeDetected = checkNetworkRequestsForAmplitude();
  return amplitudeDetected;

  // Helper function to check network requests for Amplitude domains
  function checkNetworkRequestsForAmplitude() {
    // Check performance entries if available
    if (window.performance && window.performance.getEntries) {
      const resources = window.performance.getEntries();
      for (const resource of resources) {
        if (resource.name && typeof resource.name === 'string') {
          if (resource.name.includes('amplitude.com') || 
              resource.name.includes('api.amplitude.com') || 
              resource.name.includes('api2.amplitude.com') || 
              resource.name.includes('cdn.amplitude.com') ||
              resource.name.includes('analytics.amplitude.com')) {
            console.log("Amplitude detected in network requests:", resource.name);
            return true;
          }
        }
      }
    }

    // Check for Amplitude objects in the global namespace
    if (window.amplitude || 
        window.Amplitude || 
        window.$amplitude || 
        window.AmplitudeClient) {
      console.log("Amplitude object detected in global namespace");
      return true;
    }

    return false;
  }
}

// Function to be injected as a content script for Clarity detection
function checkForClarityNetwork() {
  // Look for Clarity domains in network requests and global objects
  const clarityDetected = checkNetworkRequestsForClarity();
  return clarityDetected;

  // Helper function to check network requests for Clarity domains
  function checkNetworkRequestsForClarity() {
    // Check for any clarity.js script elements in the document
    const clarityScripts = document.querySelectorAll('script[src*="clarity.js"]');
    if (clarityScripts.length > 0) {
      console.log("Clarity script tag detected in document");
      return true;
    }
    
    // Check performance entries if available
    if (window.performance && window.performance.getEntries) {
      const resources = window.performance.getEntries();
      for (const resource of resources) {
        if (resource.name && typeof resource.name === 'string') {
          const url = resource.name.toLowerCase();
          if (url.includes('clarity.ms') || 
              url.includes('d.clarity.ms') ||
              url.includes('clarity.microsoft.com') || 
              url.includes('c.clarity.ms') || 
              url.includes('www.clarity.ms') ||
              url.includes('clarity.js')) {
            console.log("Microsoft Clarity detected in network requests:", resource.name);
            return true;
          }
        }
      }
    }

    // Check for Clarity objects in the global namespace
    if (window.clarity || 
        window.Clarity || 
        window.Microsoft?.clarity) {
      console.log("Clarity object detected in global namespace");
      return true;
    }

    return false;
  }
}

// Make sure the side panel is available
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Setting up side panel.");
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getDetectedAnalytics") {
    sendResponse(detectedAnalytics);
  }
  return true; // Keep the message channel open for async responses
});

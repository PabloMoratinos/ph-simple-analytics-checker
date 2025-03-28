
// Configure the side panel to open when the extension action is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Listen for tab updates to refresh the side panel
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Send a message to the extension that the page was loaded
    chrome.runtime.sendMessage({ 
      action: "pageLoaded", 
      tabId: tabId 
    }).catch(err => console.log("Error sending message:", err));
  }
});

// Make sure the side panel is available
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Setting up side panel.");
});

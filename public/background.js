
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for tab updates to refresh the side panel
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Refresh the side panel content when a page is loaded
    chrome.runtime.sendMessage({ action: "pageLoaded", tabId: tabId });
  }
});

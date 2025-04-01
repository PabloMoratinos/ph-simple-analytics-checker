
/**
 * Utility functions for browser tab operations
 */

/**
 * Checks if a URL is a chrome:// URL or other restricted URL
 * @param url - The URL to check
 * @returns Boolean indicating if it's a restricted URL
 */
export const isChromeUrl = (url: string): boolean => {
  // Check for common restricted URL patterns
  return url.startsWith('chrome://') || 
         url.startsWith('chrome-extension://') ||
         url.startsWith('devtools://') ||
         url.startsWith('edge://') ||  // For Microsoft Edge
         url.startsWith('about:') ||   // For about: pages
         url.startsWith('chrome-search://');
};

/**
 * Gets the URL of the current active tab
 * @returns Promise with the current tab URL
 */
export const getCurrentTab = async (): Promise<string> => {
  if (typeof window.chrome !== 'undefined' && window.chrome.tabs) {
    try {
      const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
      return tab.url || '';
    } catch (error) {
      console.error('Error al obtener la pestaña actual:', error);
      return '';
    }
  } else {
    // Fallback for development environment
    return window.location.href;
  }
};

/**
 * Retrieves HTML content from the current tab
 * @returns Promise with the HTML content
 */
export const getTabHTML = async (): Promise<string> => {
  if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.scripting) {
    try {
      // Get the active tab
      const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No se pudo obtener el ID de la pestaña');
      }
      
      // Check if the URL is restricted before attempting to access its content
      if (tab.url && isChromeUrl(tab.url)) {
        console.log("Skipping HTML retrieval for restricted URL:", tab.url);
        throw new Error("Cannot access a restricted URL");
      }
      
      // Execute script in the tab to get the page HTML
      const results = await window.chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML
      });
      
      return results[0].result as string;
    } catch (error) {
      console.error('Error al obtener el HTML de la pestaña:', error);
      throw error;
    }
  } else {
    // For development environment, return a mock HTML
    return `<html><body>Development environment - mock HTML</body></html>`;
  }
};

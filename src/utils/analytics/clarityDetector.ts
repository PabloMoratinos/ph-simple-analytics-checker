
/**
 * Utility functions for detecting Microsoft Clarity implementations
 */

/**
 * Extracts Microsoft Clarity IDs from HTML content
 * @param html - The HTML content to analyze
 * @returns Array of detected Clarity IDs
 */
export const extractClarityIds = (html: string): string[] => {
  // Look for Clarity project IDs
  const clarityRegex = /clarity\.load\(\s*["']([a-zA-Z0-9]+)["']/g;
  const clarityConfigRegex = /["|']projectId["|']\s*:\s*["|']([a-zA-Z0-9]+)["|']/g;
  const clarityScriptRegex = /src=["'](https?:\/\/[^"']*clarity\.js)["']/g;
  
  // Extract and merge all matches
  const clarityMatches = Array.from(html.matchAll(clarityRegex), m => m[1]);
  const configMatches = Array.from(html.matchAll(clarityConfigRegex), m => m[1]);
  
  // If we find a clarity.js script but no IDs, add a placeholder
  const clarityScripts = Array.from(html.matchAll(clarityScriptRegex));
  if (clarityScripts.length > 0 && clarityMatches.length === 0 && configMatches.length === 0) {
    console.log("Found Clarity script without ID:", clarityScripts[0][1]);
    clarityMatches.push("clarity-script-detected");
  }
  
  return [...new Set([...clarityMatches, ...configMatches])];
};

/**
 * Check if Microsoft Clarity is being used by examining network requests
 * This function should be called from a content script
 * @returns Promise that resolves to true if Clarity is detected, false otherwise
 */
export const detectClarityNetworkRequests = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Use window.performance if available to check existing network requests
    if (window.performance && window.performance.getEntries) {
      const resources = window.performance.getEntries();
      for (const resource of resources) {
        if (resource.name && typeof resource.name === 'string') {
          if (resource.name.includes('clarity.ms') || 
              resource.name.includes('d.clarity.ms') || 
              resource.name.includes('clarity.microsoft.com') || 
              resource.name.includes('c.clarity.ms') || 
              resource.name.includes('www.clarity.ms') ||
              resource.name.includes('clarity.js')) {
            console.log("Microsoft Clarity detected in network requests:", resource.name);
            resolve(true);
            return;
          }
        }
      }
      
      // If no Clarity requests found in performance entries, we'll resolve to false
      resolve(false);
    } else {
      // Cannot check network requests, resolve to false
      resolve(false);
    }
  });
};


/**
 * Utility functions for detecting Adobe Analytics implementations
 */

/**
 * Extracts Adobe Analytics IDs from HTML content
 * @param html - The HTML content to analyze
 * @returns Array of detected Adobe IDs
 */
export const extractAdobeIds = (html: string): string[] => {
  // Look for Adobe Analytics Report Suite IDs and Experience Cloud IDs
  const adobeRsidRegex = /s\.account\s*=\s*["']([A-Z0-9,]+)["']/g;
  const adobeEcidRegex = /MCMID\|(\d+)/g;
  const adobeLaunchRegex = /launch-[A-Za-z0-9]{8,}/g;
  
  // Extract and merge all matches
  const rsidMatches = Array.from(html.matchAll(/s\.account\s*=\s*["']([A-Z0-9,]+)["']/g), m => m[1]);
  const ecidMatches = Array.from(html.matchAll(/MCMID\|(\d+)/g), m => m[1]);
  const launchMatches = html.match(adobeLaunchRegex) || [];
  
  return [...new Set([...rsidMatches, ...ecidMatches, ...launchMatches])];
};

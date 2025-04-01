
/**
 * Utility functions for detecting Google Tag Manager implementations
 */

/**
 * Extracts Google Tag Manager IDs from HTML content
 * @param html - The HTML content to analyze
 * @returns Array of detected GTM IDs
 */
export const extractGTMIds = (html: string): string[] => {
  const gtmRegex = /GTM-[A-Z0-9]{1,8}/g;
  return [...new Set(html.match(gtmRegex) || [])];
};

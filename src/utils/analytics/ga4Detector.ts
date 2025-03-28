
/**
 * Utility functions for detecting Google Analytics 4 implementations
 */

/**
 * Extracts Google Analytics 4 measurement IDs from HTML content
 * @param html - The HTML content to analyze
 * @returns Array of detected GA4 IDs
 */
export const extractGA4Ids = (html: string): string[] => {
  // Look for G-XXXXXXXX measurement IDs
  const ga4Regex = /G-[A-Z0-9]{8,10}/g;
  return [...new Set(html.match(ga4Regex) || [])];
};

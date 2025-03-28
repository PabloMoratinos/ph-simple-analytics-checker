
/**
 * Utility functions for detecting Amplitude implementations
 */

/**
 * Extracts Amplitude API keys from HTML content
 * @param html - The HTML content to analyze
 * @returns Array of detected Amplitude API keys
 */
export const extractAmplitudeIds = (html: string): string[] => {
  // Improved Amplitude detection patterns
  const patterns = [
    // Standard amplitude.init pattern with API key
    /amplitude\.init\(\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern with apiKey parameter
    /apiKey\s*[:=]\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern for amplitude instance creation
    /amplitude\.getInstance\(\)\.init\(\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern for amplitude with configuration object
    /amplitude\.init\(\s*\{\s*apiKey\s*:\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern for newer amplitude installations (Amplitude.getInstance())
    /Amplitude\.getInstance\(\)\.init\(\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern for amplitude-js npm package
    /new\s+amplitude\.Amplitude\(\)\.init\(\s*["']([A-Za-z0-9]{32})["']/g,
    // Pattern for AmplitudeClient
    /new\s+AmplitudeClient\(\)\.init\(\s*["']([A-Za-z0-9]{32})["']/g,
  ];
  
  // Collect all matches from different patterns
  let allMatches: string[] = [];
  patterns.forEach(pattern => {
    const matches = Array.from(html.matchAll(pattern), m => m[1]);
    allMatches = [...allMatches, ...matches];
  });
  
  // Look for any JavaScript variable that might contain an Amplitude API key
  const amplitudeVarRegex = /(?:const|let|var)\s+\w+(?:ApiKey|Key|Token)?\s*=\s*["']([A-Za-z0-9]{32})["']/g;
  const varMatches = Array.from(html.matchAll(amplitudeVarRegex), m => m[1]);
  
  // Also check for Amplitude in JSON configuration
  const jsonConfigRegex = /"apiKey"\s*:\s*"([A-Za-z0-9]{32})"/g;
  const jsonMatches = Array.from(html.matchAll(jsonConfigRegex), m => m[1]);
  
  // Merge all matches and filter out duplicates
  return [...new Set([...allMatches, ...varMatches, ...jsonMatches])];
};

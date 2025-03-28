
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface AnalyticsData {
  gtm: {
    detected: boolean;
    ids: string[];
  };
  ga4: {
    detected: boolean;
    ids: string[];
  };
  adobe: {
    detected: boolean;
    ids: string[];
  };
  amplitude: {
    detected: boolean;
    ids: string[];
  };
  isLoading: boolean;
}

export const useAnalyticsDetection = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    gtm: { detected: false, ids: [] },
    ga4: { detected: false, ids: [] },
    adobe: { detected: false, ids: [] },
    amplitude: { detected: false, ids: [] },
    isLoading: false
  });

  const extractGTMIds = (html: string): string[] => {
    const gtmRegex = /GTM-[A-Z0-9]{1,7}/g;
    return [...new Set(html.match(gtmRegex) || [])];
  };

  const extractGA4Ids = (html: string): string[] => {
    // Look for G-XXXXXXXX measurement IDs
    const ga4Regex = /G-[A-Z0-9]{8,10}/g;
    return [...new Set(html.match(ga4Regex) || [])];
  };

  const extractAdobeIds = (html: string): string[] => {
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

  const extractAmplitudeIds = (html: string): string[] => {
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

  const getCurrentTab = async (): Promise<string> => {
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

  const analyzePage = async () => {
    console.log("Starting page analysis...");
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.scripting) {
        console.log("Chrome APIs detected, proceeding with extension mode analysis");
        // Get the active tab
        const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id) {
          throw new Error('No se pudo obtener el ID de la pestaña');
        }
        
        console.log("Active tab ID:", tab.id);
        
        // Execute script in the tab to get the page HTML
        const results = await window.chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.outerHTML
        });
        
        const html = results[0].result as string;
        console.log("HTML retrieved, length:", html.length);
        
        // Extract analytics IDs
        const gtmIds = extractGTMIds(html);
        const ga4Ids = extractGA4Ids(html);
        const adobeIds = extractAdobeIds(html);
        const amplitudeIds = extractAmplitudeIds(html);
        
        console.log("GTM IDs found:", gtmIds);
        console.log("GA4 IDs found:", ga4Ids);
        console.log("Adobe IDs found:", adobeIds);
        console.log("Amplitude IDs found:", amplitudeIds);
        
        setAnalyticsData({
          gtm: { detected: gtmIds.length > 0, ids: gtmIds },
          ga4: { detected: ga4Ids.length > 0, ids: ga4Ids },
          adobe: { detected: adobeIds.length > 0, ids: adobeIds },
          amplitude: { detected: amplitudeIds.length > 0, ids: amplitudeIds },
          isLoading: false
        });
        
        toast.success("Análisis de página completado");
      } else {
        console.log("Running in development mode, using simulation");
        // Fallback for development environment - simulate API call
        setTimeout(() => {
          const hasGTM = Math.random() > 0.3;
          const hasGA4 = Math.random() > 0.3;
          const hasAdobe = Math.random() > 0.3;
          const hasAmplitude = Math.random() > 0.3;
          
          const gtmIds = hasGTM ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `GTM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`) : [];
          
          const ga4Ids = hasGA4 ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `G-${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
          
          const adobeIds = hasAdobe ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `${Math.random() > 0.5 ? 'launch-' : ''}${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
          
          const amplitudeIds = hasAmplitude ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('').toUpperCase()}`) : [];
          
          setAnalyticsData({
            gtm: { detected: hasGTM, ids: gtmIds },
            ga4: { detected: hasGA4, ids: ga4Ids },
            adobe: { detected: hasAdobe, ids: adobeIds },
            amplitude: { detected: hasAmplitude, ids: amplitudeIds },
            isLoading: false
          });
          
          toast.success("Análisis de página completado (modo simulación)");
        }, 2000);
      }
    } catch (error) {
      console.error('Error al analizar la página:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
      toast.error("Error al analizar la página");
    }
  };

  // Initialize the extension and listen for page changes
  useEffect(() => {
    console.log("AnalyticsDetection hook initialized");
    analyzePage();

    // Add listener for runtime messages (from background.js)
    if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.onMessage) {
      console.log("Setting up Chrome message listener");
      const handleMessage = (message: any) => {
        console.log("Message received:", message);
        if (message.action === "pageLoaded") {
          console.log("Page loaded message received, triggering analysis");
          analyzePage();
        }
      };

      try {
        window.chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
          if (window.chrome?.runtime?.onMessage) {
            window.chrome.runtime.onMessage.removeListener(handleMessage);
          }
        };
      } catch (error) {
        console.error('Error adding message listener:', error);
      }
    }
  }, []);

  return {
    analyticsData,
    analyzePage
  };
};

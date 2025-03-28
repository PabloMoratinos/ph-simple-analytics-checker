
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
  adobeLaunch: {
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
    adobeLaunch: { detected: false, ids: [] },
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

  const extractAdobeLaunchIds = (html: string): string[] => {
    // Look for Adobe Launch script URLs or satellite URLs
    const adobeLaunchRegex = /assets\.adobedtm\.com\/launch-[A-Za-z0-9]{20,40}\.min\.js/g;
    const satelliteRegex = /satellite-[A-Za-z0-9]{16,32}\.js/g;
    
    const launchMatches = html.match(adobeLaunchRegex) || [];
    const satelliteMatches = html.match(satelliteRegex) || [];
    
    // Extract just the ID part from the URLs
    const launchIds = launchMatches.map(url => {
      const match = url.match(/launch-([A-Za-z0-9]{20,40})\.min\.js/);
      return match ? `launch-${match[1]}` : url;
    });
    
    const satelliteIds = satelliteMatches.map(url => {
      const match = url.match(/satellite-([A-Za-z0-9]{16,32})\.js/);
      return match ? `satellite-${match[1]}` : url;
    });
    
    return [...new Set([...launchIds, ...satelliteIds])];
  };

  const extractAmplitudeIds = (html: string): string[] => {
    // Look for Amplitude API keys
    const amplitudeRegex = /amplitude\.getInstance\(\)\.init\(["']([A-Za-z0-9]{32})["']/g;
    const amplitudeRegex2 = /apiKey:\s*["']([A-Za-z0-9]{32})["']/g;
    
    const matches = [];
    let match;
    
    // First regex pattern
    const regex1 = new RegExp(amplitudeRegex.source, 'g');
    while ((match = regex1.exec(html)) !== null) {
      if (match[1]) matches.push(match[1]);
    }
    
    // Second regex pattern
    const regex2 = new RegExp(amplitudeRegex2.source, 'g');
    while ((match = regex2.exec(html)) !== null) {
      if (match[1]) matches.push(match[1]);
    }
    
    // Also check for presence of amplitude.js
    if (html.includes('amplitude.js') || html.includes('amplitude.min.js')) {
      if (matches.length === 0) {
        matches.push('Amplitude detectado (ID no visible)');
      }
    }
    
    return [...new Set(matches)];
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
        
        // Extract all analytics IDs
        const gtmIds = extractGTMIds(html);
        const ga4Ids = extractGA4Ids(html);
        const adobeLaunchIds = extractAdobeLaunchIds(html);
        const amplitudeIds = extractAmplitudeIds(html);
        
        console.log("GTM IDs found:", gtmIds);
        console.log("GA4 IDs found:", ga4Ids);
        console.log("Adobe Launch IDs found:", adobeLaunchIds);
        console.log("Amplitude IDs found:", amplitudeIds);
        
        setAnalyticsData({
          gtm: { detected: gtmIds.length > 0, ids: gtmIds },
          ga4: { detected: ga4Ids.length > 0, ids: ga4Ids },
          adobeLaunch: { detected: adobeLaunchIds.length > 0, ids: adobeLaunchIds },
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
          const hasAdobeLaunch = Math.random() > 0.4;
          const hasAmplitude = Math.random() > 0.5;
          
          const gtmIds = hasGTM ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `GTM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`) : [];
          
          const ga4Ids = hasGA4 ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `G-${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
            
          const adobeLaunchIds = hasAdobeLaunch ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `launch-${Math.random().toString(36).substring(2, 30).toUpperCase()}`) : [];
            
          const amplitudeIds = hasAmplitude ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `${Math.random().toString(36).substring(2, 32).toUpperCase()}`) : [];
          
          setAnalyticsData({
            gtm: { detected: hasGTM, ids: gtmIds },
            ga4: { detected: hasGA4, ids: ga4Ids },
            adobeLaunch: { detected: hasAdobeLaunch, ids: adobeLaunchIds },
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


import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  extractGTMIds,
  extractGA4Ids,
  extractAdobeIds,
  extractAmplitudeIds,
  getCurrentTab,
  getTabHTML,
  generateMockAnalyticsData
} from '@/utils/analytics';

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

  const analyzePage = async () => {
    console.log("Starting page analysis...");
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.scripting) {
        console.log("Chrome APIs detected, proceeding with extension mode analysis");
        
        try {
          // Get HTML content from the current tab
          const html = await getTabHTML();
          console.log("HTML retrieved, length:", html.length);
          
          // Extract analytics IDs using our utility functions
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
        } catch (error) {
          console.error("Error during tab analysis:", error);
          setAnalyticsData(prev => ({ ...prev, isLoading: false }));
          toast.error("Error al analizar la página");
        }
      } else {
        console.log("Running in development mode, using simulation");
        // Fallback for development environment - simulate API call
        setTimeout(() => {
          const mockData = generateMockAnalyticsData();
          setAnalyticsData(mockData);
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

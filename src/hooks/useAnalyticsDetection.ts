
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
  isLoading: boolean;
}

export const useAnalyticsDetection = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    gtm: { detected: false, ids: [] },
    ga4: { detected: false, ids: [] },
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
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.scripting) {
        // Get the active tab
        const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id) {
          throw new Error('No se pudo obtener el ID de la pestaña');
        }
        
        // Execute script in the tab to get the page HTML
        const results = await window.chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.outerHTML
        });
        
        const html = results[0].result as string;
        
        // Extract GTM and GA4 IDs
        const gtmIds = extractGTMIds(html);
        const ga4Ids = extractGA4Ids(html);
        
        setAnalyticsData({
          gtm: { detected: gtmIds.length > 0, ids: gtmIds },
          ga4: { detected: ga4Ids.length > 0, ids: ga4Ids },
          isLoading: false
        });
        
        toast.success("Análisis de página completado");
      } else {
        // Fallback for development environment - simulate API call
        setTimeout(() => {
          const hasGTM = Math.random() > 0.3;
          const hasGA4 = Math.random() > 0.3;
          
          const gtmIds = hasGTM ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `GTM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`) : [];
          
          const ga4Ids = hasGA4 ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
            (_, i) => `G-${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
          
          setAnalyticsData({
            gtm: { detected: hasGTM, ids: gtmIds },
            ga4: { detected: hasGA4, ids: ga4Ids },
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
    analyzePage();

    // Add listener for runtime messages (from background.js)
    if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.onMessage) {
      const handleMessage = (message: any) => {
        if (message.action === "pageLoaded") {
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

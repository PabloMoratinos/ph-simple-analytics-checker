
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  extractGTMIds,
  extractGA4Ids,
  extractAdobeIds,
  extractAmplitudeIds,
  extractClarityIds,
  getCurrentTab,
  getTabHTML,
  isChromeUrl,
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
  clarity: {
    detected: boolean;
    ids: string[];
  };
  isLoading: boolean;
  isRestrictedUrl: boolean;
  currentUrl: string;
}

export const useAnalyticsDetection = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    gtm: { detected: false, ids: [] },
    ga4: { detected: false, ids: [] },
    adobe: { detected: false, ids: [] },
    amplitude: { detected: false, ids: [] },
    clarity: { detected: false, ids: [] },
    isLoading: false,
    isRestrictedUrl: false,
    currentUrl: ''
  });

  const analyzePage = async () => {
    console.log("Starting page analysis...");
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.scripting) {
        console.log("Chrome APIs detected, proceeding with extension mode analysis");
        
        try {
          // Check if current tab is a restricted URL
          const url = await getCurrentTab();
          setAnalyticsData(prev => ({ ...prev, currentUrl: url }));
          
          if (isChromeUrl(url)) {
            console.log("Detected restricted URL:", url);
            setAnalyticsData(prev => ({ 
              ...prev, 
              isLoading: false,
              isRestrictedUrl: true,
              gtm: { detected: false, ids: [] },
              ga4: { detected: false, ids: [] },
              adobe: { detected: false, ids: [] },
              amplitude: { detected: false, ids: [] },
              clarity: { detected: false, ids: [] }
            }));
            toast.info("Análisis no disponible en páginas del sistema", {
              description: "Las URLs que empiezan con chrome:// no son accesibles por extensiones"
            });
            return;
          }
          
          // Reset restricted URL flag if we're on a normal page
          setAnalyticsData(prev => ({ ...prev, isRestrictedUrl: false }));
          
          // Get HTML content from the current tab
          try {
            const html = await getTabHTML();
            console.log("HTML retrieved, length:", html.length);
            
            // Extract analytics IDs using our utility functions
            const gtmIds = extractGTMIds(html);
            const ga4Ids = extractGA4Ids(html);
            const adobeIds = extractAdobeIds(html);
            let amplitudeIds = extractAmplitudeIds(html);
            let clarityIds = extractClarityIds(html);
            
            console.log("GTM IDs found:", gtmIds);
            console.log("GA4 IDs found:", ga4Ids);
            console.log("Adobe IDs found:", adobeIds);
            console.log("Amplitude IDs found:", amplitudeIds);
            console.log("Clarity IDs found:", clarityIds);
            
            // Check for Amplitude in the current tab via content script
            const amplitudeDetectedInNetwork = await checkAmplitudeInBackground();
            console.log("Amplitude detected in network:", amplitudeDetectedInNetwork);
            
            // Check for Clarity in the current tab via content script
            const clarityDetectedInNetwork = await checkClarityInBackground();
            console.log("Clarity detected in network:", clarityDetectedInNetwork);
            
            // Set Amplitude as detected if either code detection or network detection is positive
            const amplitudeDetected = amplitudeIds.length > 0 || amplitudeDetectedInNetwork;
            const clarityDetected = clarityIds.length > 0 || clarityDetectedInNetwork;
            
            setAnalyticsData({
              gtm: { detected: gtmIds.length > 0, ids: gtmIds },
              ga4: { detected: ga4Ids.length > 0, ids: ga4Ids },
              adobe: { detected: adobeIds.length > 0, ids: adobeIds },
              amplitude: { 
                detected: amplitudeDetected, 
                ids: amplitudeIds 
              },
              clarity: {
                detected: clarityDetected,
                ids: clarityIds
              },
              isLoading: false,
              isRestrictedUrl: false,
              currentUrl: url
            });
            
            toast.success("Análisis completado");
          } catch (error: any) {
            console.error("Error during tab analysis:", error);
            
            // Check if this is a restricted URL error
            if (error.message && (
                error.message.includes("Cannot access a restricted URL") ||
                error.message.includes("chrome://") ||
                error.message.includes("Cannot access contents of url")
              )) {
              setAnalyticsData(prev => ({ 
                ...prev, 
                isLoading: false,
                isRestrictedUrl: true
              }));
              toast.info("Análisis no disponible en páginas del sistema", {
                description: "Las URLs que empiezan con chrome:// no son accesibles por extensiones"
              });
            } else {
              setAnalyticsData(prev => ({ ...prev, isLoading: false }));
              toast.error("Error al analizar la página");
            }
          }
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
          setAnalyticsData({
            ...mockData,
            isRestrictedUrl: false,
            currentUrl: 'https://example.com'
          });
          toast.success("Análisis completado (modo simulación)");
        }, 2000);
      }
    } catch (error) {
      console.error('Error analyzing the page:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
      toast.error("Error al analizar la página");
    }
  };
  
  // Function to check for Amplitude via background script message
  const checkAmplitudeInBackground = async (): Promise<boolean> => {
    if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.sendMessage) {
      try {
        // Use Promise to handle the async message response
        return new Promise((resolve) => {
          // Create message handler function
          const messageHandler = (response: any) => {
            console.log("Received response from background:", response);
            if (response && response.amplitude) {
              resolve(true);
            } else {
              resolve(false);
            }
          };

          // Send message to background script
          // Note: Using a try/catch to handle potential errors with sendMessage
          try {
            window.chrome.runtime.sendMessage({ action: "getDetectedAnalytics" })
              .then(messageHandler)
              .catch(error => {
                console.error("Error in sendMessage:", error);
                resolve(false);
              });
          } catch (error) {
            console.error("Exception sending message to background script:", error);
            resolve(false);
          }
        });
      } catch (error) {
        console.error("Error in checkAmplitudeInBackground:", error);
        return false;
      }
    }
    return false;
  };

  // Function to check for Clarity via background script message
  const checkClarityInBackground = async (): Promise<boolean> => {
    if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.sendMessage) {
      try {
        // Use Promise to handle the async message response
        return new Promise((resolve) => {
          // Create message handler function
          const messageHandler = (response: any) => {
            console.log("Received Clarity response from background:", response);
            if (response && response.clarity) {
              resolve(true);
            } else {
              resolve(false);
            }
          };

          // Send message to background script
          try {
            window.chrome.runtime.sendMessage({ action: "getDetectedAnalytics" })
              .then(messageHandler)
              .catch(error => {
                console.error("Error in Clarity sendMessage:", error);
                resolve(false);
              });
          } catch (error) {
            console.error("Exception sending message to background script for Clarity:", error);
            resolve(false);
          }
        });
      } catch (error) {
        console.error("Error in checkClarityInBackground:", error);
        return false;
      }
    }
    return false;
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
        } else if (message.action === "analyticsDetected") {
          if (message.tool === "amplitude") {
            console.log("Amplitude detected message received:", message.detected);
            setAnalyticsData(prev => ({
              ...prev,
              amplitude: {
                ...prev.amplitude,
                detected: message.detected
              }
            }));
          } else if (message.tool === "clarity") {
            console.log("Clarity detected message received:", message.detected);
            setAnalyticsData(prev => ({
              ...prev,
              clarity: {
                ...prev.clarity,
                detected: message.detected
              }
            }));
          }
        } else if (message.action === "restrictedUrl") {
          console.log("Restricted URL message received:", message.url);
          setAnalyticsData(prev => ({ 
            ...prev, 
            isRestrictedUrl: true,
            currentUrl: message.url,
            isLoading: false,
            gtm: { detected: false, ids: [] },
            ga4: { detected: false, ids: [] },
            adobe: { detected: false, ids: [] },
            amplitude: { detected: false, ids: [] },
            clarity: { detected: false, ids: [] }
          }));
          toast.info("Análisis no disponible en páginas del sistema", {
            description: "Las URLs que empiezan con chrome:// no son accesibles por extensiones"
          });
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

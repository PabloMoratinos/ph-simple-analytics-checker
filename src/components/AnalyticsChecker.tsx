
import React, { useState, useEffect } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusBadge from './StatusBadge';
import { toast } from 'sonner';

interface AnalyticsData {
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

// Expanded Chrome namespace type definition to include onUpdated listener
declare global {
  interface Window {
    chrome?: {
      tabs?: {
        query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<any[]>;
        // Add the onUpdated event listener to the type definition
        onUpdated?: {
          addListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
          removeListener: (callback: (tabId: number, changeInfo: any, tab: any) => void) => void;
        };
      };
      scripting?: {
        executeScript: (options: { target: { tabId: number }; func: () => any }) => Promise<any>;
      };
      runtime?: {
        sendMessage: (message: any) => void;
        onMessage?: {
          addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
          removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
        };
      };
    };
  }
}

const AnalyticsChecker: React.FC = () => {
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

  const handleRefresh = async () => {
    toast.info("Actualizando análisis...");
    analyzePage();
  };

  // Analyze page on initial load and whenever the tab changes
  useEffect(() => {
    const initializeExtension = async () => {
      analyzePage();
    };
    
    initializeExtension();

    // Add listener for tab updates in Chrome extension
    if (typeof window.chrome !== 'undefined' && window.chrome.tabs && window.chrome.tabs.onUpdated) {
      const handleTabUpdate = (tabId: number, changeInfo: any) => {
        if (changeInfo.status === 'complete') {
          analyzePage();
        }
      };

      // Try to add the listener
      try {
        window.chrome.tabs.onUpdated.addListener(handleTabUpdate);
        return () => {
          window.chrome.tabs.onUpdated.removeListener(handleTabUpdate);
        };
      } catch (error) {
        console.error('Error adding tab update listener:', error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-analytics-blue-light">
      <header className="bg-analytics-blue text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">PH-Analytics-Checker</h1>
        <p className="text-sm opacity-80">Verifique los scripts de analítica en cualquier página web</p>
      </header>
      
      <div className="p-4">
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          className="w-full mb-4 border-analytics-blue text-analytics-blue hover:bg-analytics-blue-light"
          disabled={analyticsData.isLoading}
        >
          <RefreshCwIcon size={16} className={`mr-2 ${analyticsData.isLoading ? 'animate-spin' : ''}`} />
          Actualizar análisis
        </Button>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold text-analytics-gray-dark">Google Tag Manager</h2>
                <p className="text-xs text-analytics-gray">Contenedor de etiquetas</p>
              </div>
              <StatusBadge 
                status={analyticsData.isLoading ? 'loading' : (analyticsData.gtm.detected ? 'detected' : 'not-detected')} 
              />
            </div>
            
            {analyticsData.gtm.detected && (
              <div className="mt-2">
                <p className="text-sm font-medium text-analytics-gray-dark">IDs detectados:</p>
                <div className="mt-1 space-y-1">
                  {analyticsData.gtm.ids.map(id => (
                    <div key={id} className="text-sm bg-analytics-blue-light text-analytics-blue-dark px-2 py-1 rounded">
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          
          <Card className="p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-semibold text-analytics-gray-dark">Google Analytics 4</h2>
                <p className="text-xs text-analytics-gray">Medición y análisis</p>
              </div>
              <StatusBadge 
                status={analyticsData.isLoading ? 'loading' : (analyticsData.ga4.detected ? 'detected' : 'not-detected')}
              />
            </div>
            
            {analyticsData.ga4.detected && (
              <div className="mt-2">
                <p className="text-sm font-medium text-analytics-gray-dark">IDs detectados:</p>
                <div className="mt-1 space-y-1">
                  {analyticsData.ga4.ids.map(id => (
                    <div key={id} className="text-sm bg-analytics-blue-light text-analytics-blue-dark px-2 py-1 rounded">
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <footer className="mt-auto p-4 text-center text-xs text-analytics-gray">
        <p>Esta extensión analiza el código fuente de la página actual para detectar scripts de GTM y GA4.</p>
      </footer>
    </div>
  );
};

export default AnalyticsChecker;

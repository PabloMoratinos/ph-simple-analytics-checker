
import React, { useState, useEffect } from 'react';
import { SearchIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const AnalyticsChecker: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
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

  const simulatePageScan = () => {
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call/page scanning
    setTimeout(() => {
      // For demonstration, randomly decide if tags are found
      const hasGTM = Math.random() > 0.3;
      const hasGA4 = Math.random() > 0.3;
      
      // Create random IDs for demonstration
      const gtmIds = hasGTM ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
        (_, i) => `GTM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`) : [];
      
      const ga4Ids = hasGA4 ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, 
        (_, i) => `G-${Math.random().toString(36).substring(2, 10).toUpperCase()}`) : [];
      
      setAnalyticsData({
        gtm: { detected: hasGTM, ids: gtmIds },
        ga4: { detected: hasGA4, ids: ga4Ids },
        isLoading: false
      });
      
      toast.success("Análisis de página completado");
    }, 2000);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast.error("Por favor, introduce una URL válida");
      return;
    }
    
    simulatePageScan();
  };

  const handleRefresh = () => {
    simulatePageScan();
  };

  // Simulate initial scan
  useEffect(() => {
    simulatePageScan();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-analytics-blue-light">
      <header className="bg-analytics-blue text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">PH-Analytics-Checker</h1>
        <p className="text-sm opacity-80">Verifique los scripts de analítica en cualquier página web</p>
      </header>
      
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
          <Input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://ejemplo.com"
            className="flex-grow"
          />
          <Button type="submit" className="bg-analytics-blue hover:bg-analytics-blue-dark">
            <SearchIcon size={18} className="mr-1" />
            Analizar
          </Button>
        </form>
        
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
        <p>Esta aplicación simula una extensión de Chrome. En una extensión real, analizaría el código fuente de la página actual.</p>
      </footer>
    </div>
  );
};

export default AnalyticsChecker;

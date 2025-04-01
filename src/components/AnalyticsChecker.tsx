
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAnalyticsDetection } from '@/hooks/useAnalyticsDetection';
import Header from './Header';
import Footer from './Footer';
import { Separator } from '@/components/ui/separator';
import RefreshButton from './analytics/RefreshButton';
import AnalyticsSummary from './analytics/AnalyticsSummary';
import AnalyticsCardList from './analytics/AnalyticsCardList';
import { AlertCircle } from 'lucide-react';

const AnalyticsChecker: React.FC = () => {
  const { analyticsData, analyzePage } = useAnalyticsDetection();

  const handleRefresh = async () => {
    console.log("Refresh button clicked");
    toast.info("Actualizando análisis...");
    analyzePage();
  };

  // Show success toast when analysis completes
  useEffect(() => {
    if (!analyticsData.isLoading && analyticsData.gtm.ids.length > 0) {
      toast.success("Análisis completado");
    }
  }, [analyticsData.isLoading, analyticsData.gtm.ids.length]);

  return (
    <div className="flex flex-col h-screen bg-[#e3e3e3]">
      <Header />
      
      <div className="p-4 flex-1 overflow-auto">
        <RefreshButton 
          onClick={handleRefresh} 
          isLoading={analyticsData.isLoading} 
          className="w-full"
        />
        
        <Separator className="my-4" />
        
        {analyticsData.isRestrictedUrl ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 mr-3 h-5 w-5 mt-0.5" />
              <div>
                <h3 className="text-amber-800 font-medium">URL restringida</h3>
                <p className="text-amber-700 text-sm mt-1">
                  No se puede analizar esta página porque es una URL interna del navegador 
                  ({analyticsData.currentUrl}).
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  Las extensiones de Chrome no pueden acceder al contenido de las URLs que 
                  comienzan con chrome://, chrome-extension://, about:, etc. por razones de seguridad.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <AnalyticsSummary analyticsData={analyticsData} />
            <AnalyticsCardList analyticsData={analyticsData} />
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AnalyticsChecker;

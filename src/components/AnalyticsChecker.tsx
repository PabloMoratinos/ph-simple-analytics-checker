
import React from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAnalyticsDetection } from '@/hooks/useAnalyticsDetection';
import Header from './Header';
import Footer from './Footer';
import AnalyticsCard from './AnalyticsCard';

const AnalyticsChecker: React.FC = () => {
  const { analyticsData, analyzePage } = useAnalyticsDetection();

  const handleRefresh = async () => {
    console.log("Refresh button clicked");
    toast.info("Actualizando análisis...");
    analyzePage();
  };

  return (
    <div className="flex flex-col h-screen bg-analytics-blue-light">
      <Header />
      
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
          <AnalyticsCard
            title="Google Tag Manager"
            description="Contenedor de etiquetas"
            isLoading={analyticsData.isLoading}
            detected={analyticsData.gtm.detected}
            ids={analyticsData.gtm.ids}
          />
          
          <AnalyticsCard
            title="Google Analytics 4"
            description="Medición y análisis"
            isLoading={analyticsData.isLoading}
            detected={analyticsData.ga4.detected}
            ids={analyticsData.ga4.ids}
          />
          
          <AnalyticsCard
            title="Adobe Analytics"
            description="Seguimiento y análisis web"
            isLoading={analyticsData.isLoading}
            detected={analyticsData.adobe.detected}
            ids={analyticsData.adobe.ids}
          />
          
          <AnalyticsCard
            title="Amplitude"
            description="Analítica de comportamiento"
            isLoading={analyticsData.isLoading}
            detected={analyticsData.amplitude.detected}
            ids={analyticsData.amplitude.ids}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AnalyticsChecker;


import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAnalyticsDetection } from '@/hooks/useAnalyticsDetection';
import Header from './Header';
import Footer from './Footer';
import { Separator } from '@/components/ui/separator';
import RefreshButton from './analytics/RefreshButton';
import AnalyticsSummary from './analytics/AnalyticsSummary';
import AnalyticsCardList from './analytics/AnalyticsCardList';

const AnalyticsChecker: React.FC = () => {
  const { analyticsData, analyzePage } = useAnalyticsDetection();

  const handleRefresh = async () => {
    console.log("Refresh button clicked");
    toast.info("Updating analysis...");
    analyzePage();
  };

  // Show success toast when analysis completes
  useEffect(() => {
    if (!analyticsData.isLoading && analyticsData.gtm.ids.length > 0) {
      toast.success("Analysis completed");
    }
  }, [analyticsData.isLoading, analyticsData.gtm.ids.length]);

  return (
    <div className="flex flex-col h-screen bg-analytics-blue-light">
      <Header />
      
      <div className="p-4 flex-1 overflow-auto">
        <RefreshButton 
          onClick={handleRefresh} 
          isLoading={analyticsData.isLoading} 
          className="w-full"
        />
        
        <Separator className="my-4" />
        
        <AnalyticsSummary analyticsData={analyticsData} />
        
        <AnalyticsCardList analyticsData={analyticsData} />
      </div>
      
      <Footer />
    </div>
  );
};

export default AnalyticsChecker;

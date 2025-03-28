
import React from 'react';
import { AnalyticsData } from '@/hooks/useAnalyticsDetection';
import AnalyticsCard from '../AnalyticsCard';

interface AnalyticsCardListProps {
  analyticsData: AnalyticsData;
}

const AnalyticsCardList: React.FC<AnalyticsCardListProps> = ({ analyticsData }) => {
  const { gtm, ga4, adobe, amplitude, isLoading } = analyticsData;
  
  return (
    <div className="space-y-3">
      <AnalyticsCard
        title="Google Tag Manager"
        description="Tag container"
        isLoading={isLoading}
        detected={gtm.detected}
        ids={gtm.ids}
      />
      
      <AnalyticsCard
        title="Google Analytics 4"
        description="Measurement and analysis"
        isLoading={isLoading}
        detected={ga4.detected}
        ids={ga4.ids}
      />
      
      <AnalyticsCard
        title="Adobe Analytics"
        description="Web tracking and analytics"
        isLoading={isLoading}
        detected={adobe.detected}
        ids={adobe.ids}
      />
      
      <AnalyticsCard
        title="Amplitude"
        description="Behavioral analytics"
        isLoading={isLoading}
        detected={amplitude.detected}
        ids={amplitude.ids}
      />
    </div>
  );
};

export default AnalyticsCardList;

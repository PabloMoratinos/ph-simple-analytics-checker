
import React from 'react';
import { AnalyticsData } from '@/hooks/useAnalyticsDetection';
import { CircleCheck, CircleX } from 'lucide-react';

interface AnalyticsSummaryProps {
  analyticsData: AnalyticsData;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ analyticsData }) => {
  const { gtm, ga4, adobe, amplitude, clarity, isLoading } = analyticsData;
  
  // Count detected tools
  const detectedCount = [
    gtm.detected,
    ga4.detected,
    adobe.detected,
    amplitude.detected,
    clarity.detected
  ].filter(Boolean).length;
  
  // Skip rendering if still loading
  if (isLoading) {
    return null;
  }
  
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-sm font-medium text-analytics-gray-dark mb-2">Analysis Summary</h2>
      
      {detectedCount > 0 ? (
        <div className="flex items-center text-analytics-green-dark">
          <CircleCheck className="w-4 h-4 mr-2" />
          <p className="text-sm">
            <span className="font-medium">{detectedCount}</span> analytics tools detected on this page
          </p>
        </div>
      ) : (
        <div className="flex items-center text-analytics-gray">
          <CircleX className="w-4 h-4 mr-2" />
          <p className="text-sm">
            No analytics tools detected on this page
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSummary;

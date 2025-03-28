
import React from 'react';
import { Card } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import DetectedIds from './DetectedIds';

interface AnalyticsCardProps {
  title: string;
  description: string;
  isLoading: boolean;
  detected: boolean;
  ids: string[];
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  description, 
  isLoading, 
  detected, 
  ids 
}) => {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-semibold text-analytics-gray-dark">{title}</h2>
          <p className="text-xs text-analytics-gray">{description}</p>
        </div>
        <StatusBadge 
          status={isLoading ? 'loading' : (detected ? 'detected' : 'not-detected')} 
        />
      </div>
      
      {detected && <DetectedIds ids={ids} />}
    </Card>
  );
};

export default AnalyticsCard;


import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'detected' | 'not-detected' | 'loading';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'detected':
        return {
          bgColor: 'bg-analytics-green-light',
          textColor: 'text-analytics-green-dark',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          label: 'Detected'
        };
      case 'not-detected':
        return {
          bgColor: 'bg-analytics-red-light',
          textColor: 'text-analytics-red-dark',
          icon: <XCircle className="w-4 h-4 mr-1" />,
          label: 'Not detected'
        };
      case 'loading':
        return {
          bgColor: 'bg-analytics-gray-light',
          textColor: 'text-analytics-gray-dark',
          icon: <Loader2 className="w-4 h-4 mr-1 animate-spin" />,
          label: 'Analyzing...'
        };
      default:
        return {
          bgColor: 'bg-analytics-gray-light',
          textColor: 'text-analytics-gray-dark',
          icon: null,
          label: 'Unknown'
        };
    }
  };

  const { bgColor, textColor, icon, label } = getStatusDetails();

  return (
    <div className={cn(
      'flex items-center px-2 py-1 rounded-full text-xs font-medium',
      bgColor,
      textColor,
      className
    )}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;

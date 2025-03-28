
import React from 'react';
import { Card } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import DetectedIds from './DetectedIds';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isOpen, setIsOpen] = React.useState(detected);

  // Update open state when detected status changes
  React.useEffect(() => {
    if (detected) {
      setIsOpen(true);
    }
  }, [detected]);

  return (
    <Card className={cn(
      "p-4 shadow-sm transition-all duration-200",
      detected ? "border-l-4 border-l-analytics-green" : "",
      isLoading ? "opacity-80" : ""
    )}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-semibold text-analytics-gray-dark">{title}</h2>
          <p className="text-xs text-analytics-gray">{description}</p>
        </div>
        <StatusBadge 
          status={isLoading ? 'loading' : (detected ? 'detected' : 'not-detected')} 
        />
      </div>
      
      {detected && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full text-left flex items-center justify-between text-xs text-analytics-blue mt-2 hover:underline">
            <span>{isOpen ? 'Ocultar detalles' : 'Mostrar detalles'}</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <DetectedIds ids={ids} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};

export default AnalyticsCard;

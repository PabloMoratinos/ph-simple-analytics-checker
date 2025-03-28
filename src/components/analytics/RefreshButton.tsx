
import React from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading: boolean;
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onClick, 
  isLoading,
  className
}) => {
  return (
    <Button 
      variant="outline" 
      onClick={onClick} 
      className={cn(
        "border-analytics-blue text-analytics-blue hover:bg-analytics-blue-light",
        "transition-all duration-200",
        isLoading && "opacity-70",
        className
      )}
      disabled={isLoading}
    >
      <RefreshCwIcon 
        size={16} 
        className={cn(
          "mr-2",
          isLoading && "animate-spin" 
        )} 
      />
      {isLoading ? "Analyzing..." : "Refresh analysis"}
    </Button>
  );
};

export default RefreshButton;

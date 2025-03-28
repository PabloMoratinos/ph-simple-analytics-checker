
import React from 'react';

interface DetectedIdsProps {
  ids: string[];
}

const DetectedIds: React.FC<DetectedIdsProps> = ({ ids }) => {
  if (ids.length === 0) return null;
  
  return (
    <div className="mt-2">
      <p className="text-sm font-medium text-analytics-gray-dark">IDs detectados:</p>
      <div className="mt-1 space-y-1">
        {ids.map(id => (
          <div key={id} className="text-sm bg-analytics-blue-light text-analytics-blue-dark px-2 py-1 rounded">
            {id}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetectedIds;

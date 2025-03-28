
import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Code } from 'lucide-react';

interface DetectedIdsProps {
  ids: string[];
}

const DetectedIds: React.FC<DetectedIdsProps> = ({ ids }) => {
  if (ids.length === 0) return null;
  
  return (
    <div className="mt-3 animate-fade-in">
      <p className="text-sm font-medium text-analytics-gray-dark mb-2">Detected IDs:</p>
      <Table>
        <TableBody>
          {ids.map(id => (
            <TableRow key={id}>
              <TableCell className="py-2">
                <div className="flex items-center space-x-2 text-sm bg-analytics-blue-light text-analytics-blue-dark px-2 py-1 rounded">
                  <Code size={14} />
                  <span className="font-mono">{id}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetectedIds;

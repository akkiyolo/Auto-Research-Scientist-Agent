import React from 'react';
import type { ComparisonMetric } from '../types';

interface ComparisonTableProps {
  data: ComparisonMetric[];
}

// Function to format header keys (e.g., "keyFinding" -> "Key Finding")
const formatHeader = (key: string) => {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-400">No comparison data available.</p>;
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-700">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="py-3 px-6">
                {formatHeader(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-800/40">
              {headers.map((header) => (
                <td key={`${rowIndex}-${header}`} className="py-4 px-6">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

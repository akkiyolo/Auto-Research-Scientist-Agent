import React from 'react';
import type { ComparisonRow } from '../types';

interface ComparisonTableProps {
  data: ComparisonRow[];
  paperKeys: string[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, paperKeys }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-400">No comparison data available.</p>;
  }

  const headerKeys = ['aspect', ...paperKeys];

  return (
    <div className="overflow-x-auto border border-gray-700 rounded-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/70">
          <tr>
            {headerKeys.map((key, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-indigo-400 uppercase tracking-wider"
              >
                {key === 'aspect' ? 'Feature' : `Paper ${index}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-900/50 divide-y divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-800/60 transition-colors duration-200">
              {headerKeys.map((key, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-pre-wrap text-sm transition-colors duration-200 ${colIndex === 0 ? 'font-semibold text-gray-200' : 'text-gray-400'}`}
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
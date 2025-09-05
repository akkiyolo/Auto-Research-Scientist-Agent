import React, { useState } from 'react';
import type { ResearchResult } from '../types';
import { ComparisonTable } from './ComparisonTable';
import { CodeBlock } from './CodeBlock';
import { createNotebookFile } from '../services/notebookService';
import { DocumentIcon } from './icons/DocumentIcon';
import { TableIcon } from './icons/TableIcon';
import { CodeIcon } from './icons/CodeIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultsDisplayProps {
  result: ResearchResult;
  topic: string;
}

type Tab = 'brief' | 'table' | 'notebook';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, topic }) => {
  const [activeTab, setActiveTab] = useState<Tab>('brief');

  const handleDownloadNotebook = () => {
    const file = createNotebookFile(result.notebookCode);
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    const safeFilename = topic.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
    a.href = url;
    a.download = `${safeFilename}_baseline.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 ${
        activeTab === tab
          ? 'bg-card-bg text-brand-purple border-brand-accent'
          : 'text-gray-400 border-transparent hover:bg-gray-800/40 hover:text-brand-purple'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-card-bg border border-purple-500/20 rounded-xl">
      <div className="border-b border-gray-700/50 px-4">
        <nav className="flex space-x-2 -mb-px">
          <TabButton tab="brief" label="Research Brief" icon={<DocumentIcon />} />
          <TabButton tab="table" label="Comparison Table" icon={<TableIcon />} />
          <TabButton tab="notebook" label="Jupyter Notebook" icon={<CodeIcon />} />
        </nav>
      </div>

      <div key={activeTab} className="p-6 sm:p-8 animate-fade-in">
        {activeTab === 'brief' && (
          <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-brand-purple">
            <h2 className="text-2xl font-bold mb-4 text-brand-purple font-display">Research Brief</h2>
            <div dangerouslySetInnerHTML={{ __html: result.researchBrief.replace(/\n/g, '<br />') }} />
          </div>
        )}

        {activeTab === 'table' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-brand-purple font-display">Methodology Comparison</h2>
            {/* FIX: Removed paperKeys prop as it's no longer needed with the updated data structure. */}
            <ComparisonTable data={result.comparisonTable} />
          </div>
        )}

        {activeTab === 'notebook' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-brand-purple font-display">Experiment Notebook</h2>
              <button
                onClick={handleDownloadNotebook}
                className="flex items-center gap-2 bg-brand-accent text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors duration-200"
              >
                <DownloadIcon />
                Download .ipynb
              </button>
            </div>
            <CodeBlock code={result.notebookCode} />
          </div>
        )}
      </div>
    </div>
  );
};

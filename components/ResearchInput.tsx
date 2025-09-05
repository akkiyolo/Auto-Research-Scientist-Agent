import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface ResearchInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topic);
  };

  const handleSampleClick = (sampleTopic: string) => {
    setTopic(sampleTopic);
    onSubmit(sampleTopic);
  };

  const sampleTopics = [
    "Latest transformer-based methods for protein folding",
    "Graph Neural Networks for drug discovery",
    "Federated Learning for medical imaging analysis",
  ];

  return (
    <div className="bg-card-bg border border-purple-500/20 rounded-xl p-8">
      <form onSubmit={handleSubmit}>
        <label htmlFor="research-topic" className="block text-md font-medium text-gray-300 mb-3 font-display">
          Enter Research Topic
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="research-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Quantum computing for materials science'"
            className="flex-grow bg-[#0D0B1A] border border-gray-600 rounded-lg py-3 px-4 text-gray-100 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="flex items-center justify-center gap-2 bg-brand-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <SearchIcon />
            {isLoading ? 'Researching...' : 'Generate'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-sm text-gray-400">
        <span className="font-medium">Or try an example:</span>
        <div className="flex flex-wrap gap-3 mt-3">
          {sampleTopics.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleClick(sample)}
              disabled={isLoading}
              className="px-4 py-1.5 bg-gray-700/60 hover:bg-gray-700 rounded-full text-xs text-gray-300 hover:text-white transition-colors duration-200 disabled:opacity-50"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
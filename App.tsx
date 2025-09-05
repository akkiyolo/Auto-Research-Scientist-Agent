import React, { useState, useCallback, useEffect } from 'react';
import type { ResearchResult } from './types';
import { ResearchInput } from './components/ResearchInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { generateResearch } from './services/geminiService';
import { ChevronUpIcon } from './components/icons/ChevronUpIcon';

// Helper function to parse complex error messages for better UI display
const parseErrorMessage = (message: string): string => {
  // Look for a JSON object within the error string, which often comes from API errors
  const jsonMatch = message.match(/({.*})/s);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const errorObj = JSON.parse(jsonMatch[1]);
      // Extract the most specific message available from the nested structure
      if (errorObj?.error?.message) {
        return errorObj.error.message;
      }
      if (errorObj?.message) {
        return errorObj.message;
      }
    } catch (e) {
      // If parsing fails, fall through to the generic cleanup
    }
  }

  // If no JSON, or if parsing failed, return a cleaned-up version of the original string
  const cleanMessage = message.split('{')[0].replace(/got status: \d+.*?\. /i, '').trim();
  return cleanMessage || message;
};

const App: React.FC = () => {
  const [researchTopic, setResearchTopic] = useState<string>('');
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResearchSubmit = useCallback(async (topic: string) => {
    if (!topic || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResearchResult(null);
    setResearchTopic(topic);

    try {
      const result = await generateResearch(topic);
      setResearchResult(result);
    } catch (err) {
      console.error('Error during research generation:', err);
      const rawMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      // Use the helper to get a user-friendly message
      const cleanMessage = parseErrorMessage(rawMessage);
      setError(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-deep-purple text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-12 font-sans">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-brand-purple font-display">
            Auto-Research Scientist Agent
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Your AI partner for automated scientific discovery and code generation.
          </p>
        </header>

        <main>
          <ResearchInput onSubmit={handleResearchSubmit} isLoading={isLoading} />

          {isLoading && <Loader topic={researchTopic} />}

          {error && (
            <div className="mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-center animate-fade-in">
              <p className="font-bold">An Error Occurred</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {!isLoading && researchResult && (
            <div className="mt-10 w-full animate-fade-in-up">
              <ResultsDisplay result={researchResult} topic={researchTopic}/>
            </div>
          )}
        </main>
      </div>
      
      {showScrollTop && (
         <footer className="fixed bottom-0 left-0 right-0 h-14 bg-black/30 backdrop-blur-sm flex justify-end items-center pr-10 animate-fade-in">
            <button
              onClick={handleScrollTop}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Scroll to top"
            >
              <ChevronUpIcon />
            </button>
        </footer>
      )}

    </div>
  );
};

export default App;
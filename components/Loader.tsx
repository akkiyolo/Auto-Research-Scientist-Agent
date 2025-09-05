import React from 'react';

interface LoaderProps {
  topic: string;
}

const loadingSteps = [
    "Querying academic databases...",
    "Retrieving top papers...",
    "Analyzing methodologies and results...",
    "Synthesizing research brief...",
    "Generating comparison table...",
    "Writing baseline Python code...",
    "Finalizing Jupyter notebook..."
];

export const Loader: React.FC<LoaderProps> = ({ topic }) => {
    const [currentStep, setCurrentStep] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % loadingSteps.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

  return (
    <div className="mt-8 p-8 bg-card-bg border border-purple-500/20 rounded-xl flex flex-col items-center text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent"></div>
      <h2 className="mt-5 text-xl font-semibold text-gray-200 font-display">
        Generating Research for: <span className="text-brand-purple">"{topic}"</span>
      </h2>
      <div className="mt-2 text-gray-400 transition-opacity duration-500 h-6 flex items-center justify-center">
        <span key={currentStep} className="animate-fade-in">
          {loadingSteps[currentStep]}
        </span>
      </div>
    </div>
  );
};
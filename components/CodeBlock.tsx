import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-gray-900/70 rounded-lg border border-gray-700 relative">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-gray-700/80 rounded-md hover:bg-gray-600 transition-all duration-200 text-gray-300 transform hover:scale-110"
        aria-label="Copy code to clipboard"
      >
        {isCopied ? <CheckIcon /> : <ClipboardIcon />}
      </button>
      <pre className="p-4 pt-12 overflow-x-auto text-sm">
        <code className="language-python font-mono">{code}</code>
      </pre>
    </div>
  );
};
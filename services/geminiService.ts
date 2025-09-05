import type { ResearchResult } from '../types';

export const generateResearch = async (topic: string): Promise<ResearchResult> => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
    throw new Error(errorData.error || 'Failed to fetch research from the server.');
  }

  const result: ResearchResult = await response.json();
  return result;
};

import { GoogleGenAI, Type } from '@google/genai';
import type { ResearchResult } from '../types';

// This is a Vercel-style or Edge-style API route.
// It uses the web-standard Request and Response objects.

// The Gemini API key is expected to be in the environment variables.
if (!process.env.API_KEY) {
    // Using console.error for server-side logging
    console.error("The API_KEY environment variable is not set.");
    // In a real app, you might have a more graceful startup check.
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const researchSchema = {
    type: Type.OBJECT,
    properties: {
      researchBrief: {
        type: Type.STRING,
        description: 'A concise summary of the research topic, formatted with Markdown.',
      },
      comparisonTable: {
        type: Type.ARRAY,
        description: 'An array of objects, where each object represents a key research paper and its comparison metrics.',
        items: {
          type: Type.OBJECT,
          properties: {
            paper: { type: Type.STRING, description: 'Title of the paper and author/year.' },
            methodology: { type: Type.STRING, description: 'The core methodology used in the paper.' },
            dataset: { type: Type.STRING, description: 'The dataset(s) used for evaluation.' },
            keyFinding: { type: Type.STRING, description: 'The main finding or result of the paper.' },
          },
          required: ['paper', 'methodology', 'dataset', 'keyFinding'],
        },
      },
      notebookCode: {
        type: Type.STRING,
        description: 'A single string of Python code for a baseline Jupyter notebook using PyTorch or TensorFlow. The code should be complete and runnable in a single cell.',
      },
    },
    required: ['researchBrief', 'comparisonTable', 'notebookCode'],
};

const createPrompt = (topic: string) => {
    return `You are an expert research scientist AI. Your task is to analyze a given research topic and produce a structured, comprehensive report in JSON format.
    
Research Topic: "${topic}"

Please perform the following tasks based on the topic:

1.  **Research Brief**: Write a concise but detailed summary (3-4 paragraphs) of the current state-of-the-art, key existing methodologies, common challenges, and potential future research directions. Format this using Markdown.

2.  **Comparison Table**: Identify 3 to 4 of the most influential and recent academic papers related to the topic. For each paper, provide its title (including authors and year), the methodology used, the dataset(s) it was evaluated on, and its key finding or contribution.

3.  **Jupyter Notebook Code**: Generate a single, self-contained block of Python code for a baseline experiment. This code should be ready to be pasted into a Jupyter notebook cell. It should include:
    *   Necessary library imports (e.g., PyTorch, TensorFlow, scikit-learn, pandas).
    *   A simple, representative model architecture (e.g., a basic neural network).
    *   Placeholder functions for data loading (\`load_data\`), model training (\`train_model\`), and evaluation (\`evaluate_model\`).
    *   A main execution block that demonstrates how to use these functions.
    *   Clear comments explaining each part of the code.

Your final output must be a single JSON object that strictly adheres to the provided schema. Do not include any text, markdown formatting, or code fences before or after the JSON object.`;
};

// Vercel/Next.js App Router style API route
export async function POST(req: Request): Promise<Response> {
    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'Server configuration error: API_KEY is not set.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { topic } = body;

        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            return new Response(JSON.stringify({ error: 'Invalid or empty topic provided.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const prompt = createPrompt(topic);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: researchSchema,
                temperature: 0.3,
            },
        });

        const responseText = response.text;
        
        const researchData: ResearchResult = JSON.parse(responseText);

        return new Response(JSON.stringify(researchData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in /api/generate:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return new Response(JSON.stringify({ error: `An error occurred while generating research: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper function to extract a JSON string from a larger text block
function extractJson(text: string): string | null {
  const match = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
  if (match) {
    // Return the content of the json block, or the matched object itself
    return match[1] || match[2];
  }
  return null;
}

// The main handler for the API route, using the standard Vercel runtime
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CRUCIAL: Check if the API key is configured on the server
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return res.status(500).json({ error: "API_KEY is not configured on the server. Please add it to your Vercel project's environment variables." });
  }

  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required and must be a string' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // The detailed prompt for the AI model
    const prompt = `
You are an expert research scientist AI. Your task is to analyze a given research topic and produce a structured JSON output containing a comprehensive summary, a comparison of key methodologies, and a baseline codebase for experimentation.

For the topic: "${topic}"

Please generate a JSON object with the following structure:
{
  "researchBrief": "...",
  "paperKeys": ["Paper 1", "Paper 2", "Paper 3"],
  "comparisonTable": [
    { "aspect": "Methodology", "Paper 1": "...", "Paper 2": "...", "Paper 3": "..." },
    { "aspect": "Dataset", "Paper 1": "...", "Paper 2": "...", "Paper 3": "..." },
    { "aspect": "Key Result", "Paper 1": "...", "Paper 2": "...", "Paper 3": "..." }
  ],
  "notebookCode": "..."
}

Here are the detailed requirements for each field:

1.  **researchBrief**: A concise but comprehensive summary of the research topic. Explain the background, key challenges, and recent advancements. The output should be a single string. Use newline characters (\n) for paragraph breaks. Do NOT use any HTML tags.

2.  **paperKeys**: An array of 3 short, unique identifiers for the key papers you analyzed. Use the format "Paper 1", "Paper 2", "Paper 3". These keys MUST EXACTLY match the keys used in the comparisonTable objects.

3.  **comparisonTable**: An array of objects. Each object represents a row in a comparison table. The first key of each object MUST be "aspect" (e.g., "Methodology", "Dataset Used", "Key Result/Metric", "Novelty"). The subsequent keys in each object MUST be the identifiers from the paperKeys array, containing the corresponding information for that paper.

4.  **notebookCode**: A single string containing well-commented Python code for a baseline Jupyter Notebook. It should include necessary imports (e.g., PyTorch or TensorFlow), a basic model class or function, and placeholder functions for data loading, training, and evaluation. Do not wrap the code in markdown backticks.
`;

    // The schema to enforce the JSON output structure
    const schema = {
      type: Type.OBJECT,
      properties: {
        researchBrief: {
          type: Type.STRING,
          description: "A summary of the research topic with newline characters for formatting."
        },
        paperKeys: {
          type: Type.ARRAY,
          description: "An array of unique string identifiers for the papers, e.g., ['Paper 1', 'Paper 2'].",
          items: { type: Type.STRING },
        },
        comparisonTable: {
          type: Type.ARRAY,
          description: "An array of objects for the comparison table. Each object must have an 'aspect' key.",
          items: {
            type: Type.OBJECT,
            properties: {
              aspect: { type: Type.STRING },
            },
            required: ['aspect'],
            // Allow other properties (Paper 1, etc.)
            additionalProperties: { type: Type.STRING }
          },
        },
        notebookCode: {
          type: Type.STRING,
          description: "A string containing Python code for a Jupyter notebook."
        },
      },
      required: ["researchBrief", "paperKeys", "comparisonTable", "notebookCode"],
    };

    // Call the Gemini API
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    // Parse and validate the response
    let researchData;
    try {
        const rawText = response.text;
        const jsonText = extractJson(rawText);
        if (!jsonText) {
          console.error("No valid JSON object found in Gemini response:", rawText);
          throw new Error("The AI model returned an invalid data structure. Please try again.");
        }
        researchData = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", response.text, e);
        throw new Error("The AI model returned an invalid data structure. Please try again.");
    }

    // Additional validation for the structure
    if (
        !researchData.researchBrief || typeof researchData.researchBrief !== 'string' ||
        !Array.isArray(researchData.paperKeys) ||
        !Array.isArray(researchData.comparisonTable) ||
        !researchData.notebookCode || typeof researchData.notebookCode !== 'string'
    ) {
        console.error("Validation failed for the parsed data structure:", researchData);
        throw new Error("The AI model's response was missing required fields.");
    }

    // Return the successful response
    return res.status(200).json(researchData);

  } catch (error) {
    console.error("Error in /api/generate:", error);
    // Send back a specific error message instead of letting the function crash
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return res.status(500).json({ error: message });
  }
}
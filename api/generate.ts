/**
 * This file defines the serverless API endpoint for generating research results.
 * It receives a research topic, uses the Google GenAI API to generate a structured
 * research brief, comparison table, and Python notebook code, and returns
 * it as a JSON response.
 */
import { GoogleGenAI, Type } from "@google/genai";

// A serverless function handler (e.g., for Vercel, Netlify).
// `req` and `res` are typed as `any` to avoid dependency on a specific platform's types.
export default async function handler(req: any, res: any) {
  // FIX: Implement request method validation. Only POST is allowed.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // FIX: Securely access API key from server-side environment variables.
  // As per guidelines, this is assumed to be configured.
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    // FIX: Implement request body validation.
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    // FIX: Initialize the GoogleGenAI client as per the guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // FIX: Define a strict JSON schema for the expected output, matching the `ResearchResult` type.
    // This ensures the model returns data in a predictable and usable format.
    const schema = {
      type: Type.OBJECT,
      properties: {
        researchBrief: {
          type: Type.STRING,
          description: "A detailed summary and brief on the research topic, formatted with markdown-style headings and paragraphs. Explain the core concepts, importance, and recent advancements."
        },
        comparisonTable: {
          type: Type.ARRAY,
          description: "A comparison of at least 3-5 different papers or methodologies related to the topic.",
          items: {
            type: Type.OBJECT,
            properties: {
              paper: { type: Type.STRING, description: "The title of the research paper or name of the method." },
              methodology: { type: Type.STRING, description: "A concise summary of the methodology used." },
              dataset: { type: Type.STRING, description: "The dataset(s) used for evaluation." },
              keyFinding: { type: Type.STRING, description: "The single most important finding or result of the paper/method." }
            },
            required: ["paper", "methodology", "dataset", "keyFinding"]
          }
        },
        notebookCode: {
          type: Type.STRING,
          description: "A complete Python code for a Jupyter notebook that provides a baseline experiment for the research topic. It should be fully functional, including necessary imports (e.g., tensorflow or torch), a sample model architecture, placeholder data loading functions, and a basic training and evaluation loop. The code should be well-commented."
        }
      },
      required: ["researchBrief", "comparisonTable", "notebookCode"]
    };

    // FIX: Create a detailed prompt instructing the model on its role and the desired output format.
    const prompt = `
      As an expert research scientist, generate a comprehensive analysis of the topic: "${topic}".
      Your response must be a JSON object that strictly adheres to the provided schema.
      - The research brief should be a well-structured summary, using markdown for formatting (e.g. ## for headings, * for bullet points).
      - The comparison table must contain at least 3 distinct entries.
      - The notebook code must be a single block of Python code ready to be placed in a Jupyter cell.
    `;

    // FIX: Call the Gemini API using the recommended `generateContent` method and model.
    // Configure it to return JSON based on the defined schema.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, // Lower temperature for more factual, less creative output
      },
    });
    
    // FIX: Extract the text response and parse it as JSON, with error handling.
    const jsonText = response.text;
    
    let result;
    try {
        result = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", jsonText);
        // This provides a more specific error to the client if the model fails to return valid JSON.
        throw new Error("The model returned an invalid JSON response, please try again.");
    }

    res.status(200).json(result);

  } catch (error) {
    // FIX: Implement robust error handling for API calls and other potential issues.
    console.error("Error in /api/generate:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    res.status(500).json({ error: `Failed to generate research. Details: ${message}` });
  }
}

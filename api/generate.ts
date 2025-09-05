/**
 * This file defines the serverless API endpoint for generating research results.
 * It receives a research topic, uses the Google GenAI API to generate a structured
 * research brief, comparison table, and Python notebook code, and returns
 * it as a JSON response.
 */
import { GoogleGenAI, Type } from "@google/genai";

// A serverless function handler (e.g., for Vercel, Netlify).
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const prompt = `
      As an expert research scientist, generate a comprehensive analysis of the topic: "${topic}".
      Your response must be a JSON object that strictly adheres to the provided schema.
      - The research brief should be a well-structured summary, using markdown for formatting (e.g. ## for headings, * for bullet points).
      - The comparison table must contain at least 3 distinct entries.
      - The notebook code must be a single block of Python code ready to be placed in a Jupyter cell.
      IMPORTANT: Only output the raw JSON object, with no additional text or markdown formatting before or after it.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });
    
    // With responseSchema, the API guarantees a valid JSON string.
    // A direct parse is the correct and most robust method.
    const result = JSON.parse(response.text);

    res.status(200).json(result);

  } catch (error) {
    console.error("Error in /api/generate:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    res.status(500).json({ error: message });
  }
}
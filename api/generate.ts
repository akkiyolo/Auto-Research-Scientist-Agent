// Fix: Implement the serverless function to call the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define types locally to avoid path resolution issues in a serverless environment.
interface ComparisonRow {
  aspect: string;
  [paperKey: string]: string;
}

interface ResearchResult {
  researchBrief: string;
  comparisonTable: ComparisonRow[];
  paperKeys: string[];
  notebookCode: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are an expert research scientist AI. Your task is to analyze a given research topic and produce a structured JSON output.
      For the topic: "${topic}"

      Please perform the following steps:
      1.  Identify 2-3 seminal or recent, highly-relevant academic papers on this topic.
      2.  For each paper, define a short, unique key (e.g., "Paper 1").
      3.  For each paper, create a comparison data structure comparing it across several key aspects (e.g., 'Methodology', 'Key Innovation', 'Reported Performance', 'Dataset Used').
      4.  Write a concise "Research Brief" summarizing the key concepts, methodologies, and findings from all papers. Format it as a single string with markdown-style newlines.
      5.  Generate a baseline Python code implementation in a single block for a Jupyter Notebook. This code should provide a starting point for someone to experiment with the core concepts discussed. It should include placeholder functions for data loading, a simple model definition (using a common framework like PyTorch or TensorFlow), a basic training loop, and an evaluation function. Add comments to explain the code.

      The final output MUST conform to the provided JSON schema.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          researchBrief: {
            type: Type.STRING,
            description: "A concise summary of the research topic, methodologies, and key findings from the analyzed papers."
          },
          papers: {
            type: Type.ARRAY,
            description: "An array of objects, where each object contains details and comparison points for a single academic paper.",
            items: {
              type: Type.OBJECT,
              properties: {
                key: {
                  type: Type.STRING,
                  description: "A short, unique identifier for the paper, e.g., 'Paper 1'."
                },
                comparison: {
                  type: Type.ARRAY,
                  description: "An array of aspects and their corresponding values for this paper.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      aspect: { type: Type.STRING, description: "The feature being compared, e.g., 'Methodology'." },
                      value: { type: Type.STRING, description: "The value of the feature for this paper." }
                    },
                    required: ["aspect", "value"]
                  }
                }
              },
              required: ["key", "comparison"]
            }
          },
          notebookCode: {
            type: Type.STRING,
            description: "A string containing Python code for a baseline Jupyter notebook implementation."
          }
        },
        required: ["researchBrief", "papers", "notebookCode"]
      };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.5,
      },
    });
    
    const geminiResponse = JSON.parse(response.text);

    // Transform Gemini response to the frontend's expected ResearchResult format
    const { researchBrief, papers, notebookCode } = geminiResponse;
    const paperKeys = papers.map((p: any) => p.key);

    const allAspects = new Set<string>();
    papers.forEach((p: any) => {
        p.comparison.forEach((c: any) => {
            allAspects.add(c.aspect);
        });
    });

    const comparisonTable: ComparisonRow[] = Array.from(allAspects).map(aspect => {
        const row: ComparisonRow = { aspect };
        papers.forEach((paper: any) => {
            const comparisonItem = paper.comparison.find((c: any) => c.aspect === aspect);
            row[paper.key] = comparisonItem ? comparisonItem.value : 'N/A';
        });
        return row;
    });

    const result: ResearchResult = {
        researchBrief,
        paperKeys,
        comparisonTable,
        notebookCode,
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error generating research:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}

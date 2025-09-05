import { GoogleGenAI, Type } from "@google/genai";
import type { ResearchResult, ComparisonRow } from '../types';

// This function will be deployed as a Vercel serverless function.
// It's the secure backend that communicates with the Gemini API.
export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic } = request.body;

  if (!topic || typeof topic !== 'string') {
    return response.status(400).json({ error: 'Topic is required and must be a string.' });
  }

  try {
    const result = await generateResearch(topic);
    return response.status(200).json(result);
  } catch (error) {
    console.error('Error in serverless function:', error);
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return response.status(500).json({ error: message });
  }
}


// --- All the Gemini API logic is now here, on the server-side. ---

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This error will be caught by the handler and sent to the user.
  // It's a server-side check.
  throw new Error("API_KEY environment variable is not set on the server.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const findRelevantPapers = async (topic: string): Promise<string> => {
    const prompt = `Using Google Search, find the top 3-5 most recent and influential scientific papers on the topic: "${topic}". For each paper, provide its title, authors, publication year, a direct URL to the paper (preferably arXiv, PubMed, or Semantic Scholar), and a concise one-sentence summary of its main contribution. Format the output clearly.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    return response.text;
};

const generateResearchArtifacts = async (topic: string, papersInfo: string): Promise<ResearchResult> => {
    const researchSchema = {
        type: Type.OBJECT,
        properties: {
            researchBrief: {
                type: Type.STRING,
                description: "A comprehensive summary synthesizing the key findings, trends, and methodologies from the provided papers. Use markdown for formatting with headings and bullet points.",
            },
            comparisonTable: {
                type: Type.ARRAY,
                description: "A table comparing the papers across several key aspects.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        aspect: { type: Type.STRING, description: "The feature being compared, e.g., 'Methodology', 'Dataset Used', 'Key Result/Benchmark'." },
                        paper_1: { type: Type.STRING, description: "Details for the first paper regarding the aspect." },
                        paper_2: { type: Type.STRING, description: "Details for the second paper regarding the aspect." },
                        paper_3: { type: Type.STRING, description: "Details for the third paper regarding the aspect." },
                    },
                }
            },
            paperKeys: {
                type: Type.ARRAY,
                description: "An array of short, descriptive keys for each paper, e.g., ['paper_1', 'paper_2', 'paper_3'].",
                items: { type: Type.STRING }
            }
        },
    };

    const notebookPrompt = `Based on the research topic "${topic}" and the summarized papers, generate Python code for a baseline Jupyter notebook. Use PyTorch. The notebook should be a single block of code and include:
1. Comments indicating where to install dependencies (e.g., torch, numpy).
2. A basic, relevant model architecture (e.g., a simple Transformer block, a GNN layer, a basic CNN).
3. Placeholder functions for loading data, training, and evaluation loops.
4. Extensive comments explaining each part of the code for a researcher to easily get started.`;

    const [researchPromise, notebookPromise] = await Promise.allSettled([
        ai.models.generateContent({
            model,
            contents: `Topic: "${topic}"\n\nFound Papers:\n${papersInfo}\n\nBased on the topic and papers, generate a research brief and a comparison table.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: researchSchema
            }
        }),
        ai.models.generateContent({
            model,
            contents: notebookPrompt,
        })
    ]);

    let researchBrief = "Failed to generate the research brief. The API call may have failed or returned an invalid response.";
    let comparisonTable: ComparisonRow[] = [];
    let paperKeys: string[] = [];
    let notebookCode = "# An error occurred while generating the notebook code.\n# Please try again.";
    
    let researchFailed = false;
    let notebookFailed = false;

    if (researchPromise.status === 'fulfilled') {
        try {
            const researchJson = JSON.parse(researchPromise.value.text);
            researchBrief = researchJson.researchBrief;
            paperKeys = researchJson.paperKeys || [];
            
            const formattedTable = (researchJson.comparisonTable || []).map((row: any) => {
                const newRow: ComparisonRow = { aspect: row.aspect };
                paperKeys.forEach((key: string, index: number) => {
                     newRow[key] = row[`paper_${index + 1}`] || 'N/A';
                });
                return newRow;
            });
            comparisonTable = formattedTable;
        } catch (e) {
            console.error("Failed to parse research JSON:", e);
            researchBrief = "Failed to process the research data. The model may have returned an invalid format.";
            researchFailed = true;
        }
    } else {
        console.error("Research generation promise rejected:", researchPromise.reason);
        researchFailed = true;
    }

    if (notebookPromise.status === 'fulfilled') {
        notebookCode = notebookPromise.value.text;
    } else {
        console.error("Notebook generation promise rejected:", notebookPromise.reason);
        notebookFailed = true;
    }

    if (researchFailed && notebookFailed) {
        throw new Error("Both research brief and notebook generation failed. Please check the console for details.");
    }

    return {
        researchBrief,
        comparisonTable,
        paperKeys,
        notebookCode,
    };
};

const generateResearch = async (topic: string): Promise<ResearchResult> => {
    console.log("Step 1: Finding relevant papers...");
    let papersInfo: string;
    try {
        papersInfo = await findRelevantPapers(topic);
        if (!papersInfo || papersInfo.trim() === '') {
            throw new Error("No relevant papers were found by the search tool. Please try a different or broader topic.");
        }
    } catch (error) {
        console.error("Error in findRelevantPapers:", error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to retrieve research papers. The search tool may be unavailable. Details: ${message}`);
    }
    
    console.log("Step 2: Generating research artifacts and notebook...");
    const result = await generateResearchArtifacts(topic, papersInfo);
    console.log("Research generation complete.");
    return result;
};

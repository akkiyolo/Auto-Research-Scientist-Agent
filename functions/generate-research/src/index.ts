import { GoogleGenAI, Type } from "@google/genai";

type AppwriteContext = {
  req: {
    body: string;
    method: string;
  },
  res: {
    json: (data: object, statusCode?: number) => any;
    send: (text: string, statusCode?: number) => any;
  },
  log: (message: any) => void;
  error: (message: any) => void;
}

export default async ({ req, res, log, error }: AppwriteContext) => {
  if (req.method !== 'POST') {
    return res.send('Method Not Allowed', 405);
  }

  if (!process.env.API_KEY) {
    error('API key is not configured.');
    return res.json({ error: 'API key is not configured on the server.' }, 500);
  }

  try {
    const { topic } = JSON.parse(req.body);
    if (!topic || typeof topic !== 'string') {
      return res.json({ error: 'Research topic is required.' }, 400);
    }
    
    log(`Generating research for topic: "${topic}"`);

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
    
    const result = JSON.parse(response.text);

    return res.json(result);

  } catch (e: any) {
    error(`Error processing request: ${e.message}`);
    error(JSON.stringify(e));
    return res.json({ error: e.message || "An internal server error occurred." }, 500);
  }
}

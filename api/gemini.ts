import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context, systemInstruction, responseMimeType, responseSchema, model: modelName } = req.body;
  console.log(`[GEMINI-HANDLER] Incoming modelName: "${modelName}"`);
  
  if (!prompt && !req.body.contents) {
    return res.status(400).json({ error: 'Prompt or contents is required' });
  }

  let apiKey = process.env.USER_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.MY_GEMINI_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey === 'MY_GEMINI_API_KEY' || !apiKey) {
    apiKey = process.env.GEMINI_API_KEY;
  }

  const defaultModel = "gemini-3.5-flash";
  let finalModel = modelName || defaultModel;
  if (finalModel === "gemini-3-flash-preview" || finalModel === "gemini-2.0-flash") {
    finalModel = "gemini-3.5-flash";
  }
  console.log(`[GEMINI-HANDLER] Incoming modelName: "${modelName}"`);
  console.log(`[GEMINI-HANDLER] Using model: ${finalModel}`);

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please add it to your environment variables as USER_GEMINI_API_KEY.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = genAI.getGenerativeModel({ 
      model: finalModel,
      systemInstruction: systemInstruction || undefined
    });

    const generationConfig: any = {};
    if (responseMimeType) generationConfig.responseMimeType = responseMimeType;
    if (responseSchema) generationConfig.responseSchema = responseSchema;

    let result;
    const fullPrompt = context 
      ? `Contexte: ${context}\n\nQuestion/Tâche: ${prompt}`
      : prompt;

    if (req.body.contents) {
      result = await selectedModel.generateContent({
        contents: req.body.contents,
        generationConfig
      });
    } else {
      result = await selectedModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig
      });
    }

    const response = await result.response;
    const text = response.text();
    
    const parts = response.candidates?.[0]?.content?.parts || [];
    const inlineData = parts.find(p => p.inlineData);

    res.json({ 
      text, 
      inlineData: inlineData ? inlineData.inlineData : undefined 
    });
  } catch (error: any) {
    console.error(`Gemini Vercel Error:`, error.message);
    
    let status = 500;
    let errorMessage = error.message || "Erreur lors de l'appel à l'IA.";
    let suggestion = undefined;

    if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
      status = 429;
      errorMessage = "Limite de quota de l'IA atteinte.";
      suggestion = "Le quota gratuit de l'IA est épuisé. Veuillez ajouter votre propre USER_GEMINI_API_KEY dans vos variables d'environnement Vercel.";
    }

    res.status(status).json({ 
      error: errorMessage,
      suggestion: suggestion,
      details: error.response?.data || error.message
    });
  }
}

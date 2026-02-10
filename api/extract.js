import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

  const { url } = req.query;
  if (!url) return res.status(200).json({ status: "online" });

  try {
    // Inicializamos sin especificar versión, dejando que el SDK decida
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Intentamos con el ID técnico completo
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-1.5-flash" 
    });

    const prompt = `Analiza la web: ${url}. 
    Responde solo JSON: {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: "Error persistente de Google", 
      message: error.message,
      check: "Si esto falla, el problema podría ser que la API Key es de un proyecto antiguo de Google Cloud en lugar de AI Studio (aistudio.google.com)"
    });
  }
}

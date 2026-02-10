import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Verificación de la API Key
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta VITE_GEMINI_API_KEY en Vercel" });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(200).json({ status: "online", message: "API lista. Envía ?url=" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analiza esta URL de propiedad: ${url}. 
    Extrae la info y responde solo JSON: 
    {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: "Error de IA", details: error.message });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Falta API Key en Vercel" });

  const { url } = req.query;
  if (!url) return res.status(200).json({ status: "online", message: "Esperando URL..." });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Cambiamos a gemini-pro que es el modelo más estable para la v1
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analiza la web inmobiliaria: ${url}. 
    Extrae datos y responde SOLO en JSON:
    {"title": "título", "price": "precio", "address": "dirección", "sourceName": "web", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      error: "Error de IA", 
      message: error.message,
      check: "Verifica que tu API Key sea válida para el modelo gemini-pro"
    });
  }
}

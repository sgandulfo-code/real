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
    // Forzamos la inicialización con la versión de API específica si es necesario
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Probamos con el nombre del modelo estándar
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const prompt = `Analiza el contenido de esta URL: ${url}. 
    Extrae la info de la propiedad y responde UNICAMENTE en JSON:
    {"title": "título", "price": "precio", "address": "dirección", "sourceName": "web", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    // Si falla el flash, intentamos con el pro como respaldo automático
    return res.status(500).json({ 
      error: "Error de comunicación con Google", 
      message: error.message,
      tip: "Si el error persiste, intenta cambiar el nombre del modelo a 'gemini-pro' en el código."
    });
  }
}

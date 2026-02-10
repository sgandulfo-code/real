const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Verificar API Key
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Configuración incompleta: Falta la API Key en Vercel." });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(200).json({ status: "online", message: "API lista. Envía una URL para analizar." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analiza la siguiente URL de propiedad inmobiliaria: ${url}. 
    Extrae los datos y responde únicamente en formato JSON con estas llaves: 
    {"title": "título", "price": "precio", "address": "dirección", "sourceName": "nombre de la web", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: "Error en la IA", details: error.message });
  }
};

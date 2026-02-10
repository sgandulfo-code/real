// Usamos require para máxima compatibilidad en Vercel Functions
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
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
    return res.status(500).json({ error: "Falta la VITE_GEMINI_API_KEY en las variables de entorno de Vercel" });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(200).json({ status: "ok", message: "API lista. Envía ?url= para procesar." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analiza esta URL de propiedad: ${url}. 
    Extrae la información y responde exclusivamente en formato JSON con esta estructura:
    {"title": "título", "price": "precio", "address": "dirección", "sourceName": "web", "lat": 0, "lng": 0}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Limpieza de posibles etiquetas markdown de la IA
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      error: "Error al invocar la función", 
      message: error.message 
    });
  }
};

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta API Key" });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(200).json({ status: "online", message: "API lista." });
  }

  try {
    // Inicializamos el SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // CAMBIO CLAVE: Usamos 'gemini-1.5-flash' sin rutas adicionales
    // El SDK se encarga de elegir v1 o v1beta internamente
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analiza la URL: ${url}. 
    Responde solo un objeto JSON con: title, price, address, sourceName, lat, lng. 
    Si no encuentras coordenadas, usa lat: 0, lng: 0.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    // Si el error persiste, este log nos dirá si es por el nombre del modelo
    console.error(error);
    return res.status(500).json({ 
      error: "Error en la IA", 
      message: error.message,
      suggestion: "Verifica que el modelo gemini-1.5-flash esté disponible en tu región."
    });
  }
}

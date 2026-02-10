export default async function handler(req, res) {
  // Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online", message: "Esperando URL..." });
  if (!apiKey) return res.status(500).json({ error: "No se encontró la API Key en Vercel" });

  try {
    // Llamada directa a la API de Google (v1 estable)
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza la siguiente web inmobiliaria: ${url}. 
            Extrae los datos y responde UNICAMENTE un objeto JSON con esta estructura:
            {"title": "título", "price": "precio", "address": "dirección", "sourceName": "web", "lat": 0, "lng": 0}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Error en la respuesta de Google");
    }

    // Extraer el texto de la respuesta de Google
    let aiText = data.candidates[0].content.parts[0].text;
    
    // Limpiar el JSON de posibles marcas de la IA
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      error: "Error en el servidor de extracción", 
      message: error.message 
    });
  }
}

export default async function handler(req, res) {
  // 1. Configuración de CORS para que tu web pueda consultar la API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder rápido a las peticiones de comprobación (browser pre-flight)
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  // Verificaciones iniciales
  if (!url) return res.status(200).json({ status: "online", message: "API conectada. Envía una URL en el parámetro ?url=" });
  if (!apiKey) return res.status(500).json({ error: "Falta configurar VITE_GEMINI_API_KEY en Vercel" });

  // Usamos el modelo 'flash-latest' que es el más estable en cuotas gratuitas
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Actúa como un extractor de datos profesional. Analiza esta URL inmobiliaria: ${url}. 
            Extrae la información y responde ÚNICAMENTE con un objeto JSON (sin texto extra, sin markdown) que tenga esta estructura:
            {"title": "título", "price": "precio", "address": "dirección", "sourceName": "web", "lat": 0, "lng": 0}`
          }]
        }]
      })
    });

    const data = await response.json();

    // Si hay error de cuota o de Google, lo capturamos aquí
    if (data.error) {
      return res.status(data.error.code || 500).json({
        error: "Error de Google",
        message: data.error.message,
        tip: "Si el error es de 'Quota', espera 1 minuto o crea una nueva API Key en Google AI Studio."
      });
    }

    // Extraer y limpiar el texto de la IA
    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Devolvemos el JSON final a tu aplicación
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Error en el handler:", error);
    return res.status(500).json({ 
      error: "Error en el servidor de extracción", 
      details: error.message 
    });
  }
}

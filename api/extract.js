export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });
  if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

  try {
    // 1. Usamos Jina AI para leer la web (es gratuito y convierte la web en texto limpio para IA)
    const jinaUrl = `https://r.jina.ai/${url}`;
    const webResponse = await fetch(jinaUrl);
    
    if (!webResponse.ok) {
      throw new Error("No se pudo extraer el contenido de la web.");
    }

    const cleanText = await webResponse.text();

    // 2. Enviamos ese texto a Gemini usando el modelo que SI funcionó: gemini-flash-latest
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza el siguiente texto de una propiedad inmobiliaria y extrae los datos exactos. 
            Si el precio o dirección no están claros, pon "Consultar". NO INVENTES DATOS.
            
            CONTENIDO:
            ${cleanText.substring(0, 10000)}

            RESPONDE SOLO JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      // Si el modelo 'flash-latest' falla, intentamos con el ID técnico como último recurso
      throw new Error(data.error.message);
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    return res.status(500).json({ 
      error: "Error de extracción", 
      message: error.message 
    });
  }
}

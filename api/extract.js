export default async function handler(req, res) {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });
  if (!apiKey) return res.status(500).json({ error: "Falta API Key en Vercel" });

  try {
    // 1. Obtener contenido vía Jina (más estable para evitar bloqueos)
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const webResponse = await fetch(jinaUrl);
    
    if (!webResponse.ok) {
      throw new Error(`Jina error: ${webResponse.status}`);
    }

    const cleanText = await webResponse.text();
    // Acortamos el texto para no saturar la memoria de la función serverless
    const contextText = cleanText.substring(0, 8000);

    // 2. Configurar llamada a Gemini
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza este texto de una web inmobiliaria y extrae:
            - Título de la propiedad
            - Precio (busca números con USD o $)
            - Dirección completa
            - Nombre de la inmobiliaria
            - Latitud y Longitud (solo si figuran, si no 0)

            IMPORTANTE: Responde UNICAMENTE un objeto JSON. Si no encuentras un dato, pon "No disponible".
            
            TEXTO:
            ${contextText}`
          }]
        }]
      })
    });

    const data = await geminiResponse.json();

    if (data.error) {
      return res.status(500).json({ error: "Error de Google", details: data.error.message });
    }

    // Validar que existan candidatos antes de acceder a ellos
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error("Gemini devolvió una respuesta vacía o inválida");
    }

    const aiText = data.candidates[0].content.parts[0].text;
    
    // Limpieza de JSON ultra-segura
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no devolvió un formato JSON válido");
    }

    const cleanJson = JSON.parse(jsonMatch[0]);
    return res.status(200).json(cleanJson);

  } catch (error) {
    console.error("Crash report:", error.message);
    return res.status(500).json({ 
      error: "Error interno del servidor", 
      message: error.message 
    });
  }
}

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
    // 1. CAMBIO: Usamos AllOrigins para obtener el HTML crudo saltando bloqueos
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const webResponse = await fetch(proxyUrl);
    
    if (!webResponse.ok) throw new Error("No se pudo acceder a la web");
    
    const webData = await webResponse.json();
    const htmlRaw = webData.contents;

    // Limpiamos el HTML para dejar solo el texto relevante
    const cleanText = htmlRaw
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 15000);

    // 2. Llamada a Gemini
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres un experto extrayendo datos de RE/MAX Argentina. 
            Busca en el texto:
            1. PRECIO: Está entre la palabra "Venta" y "Expensas". Suele ser USD seguido de un número.
            2. DIRECCIÓN: Busca nombres de calles y altura en Capital Federal o Buenos Aires.
            3. TÍTULO: El nombre de la propiedad.

            IMPORTANTE: Si no encuentras el precio entre "Venta" y "Expensas", búscalo en cualquier parte del texto que tenga el símbolo USD o $.
            
            Responde SOLO JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "RE/MAX", "lat": 0, "lng": 0}

            TEXTO:
            ${cleanText}`
          }]
        }]
      })
    });

    const data = await geminiResponse.json();
    if (data.error) throw new Error(data.error.message);

    const aiText = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    return res.status(500).json({ 
      error: "Error de lectura profunda", 
      message: error.message 
    });
  }
}

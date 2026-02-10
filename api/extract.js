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
    // 1. Simular un navegador real para evitar bloqueos
    const webResponse = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8'
      } 
    });

    if (!webResponse.ok) {
      throw new Error(`La web de la inmobiliaria bloqueó la conexión (Status: ${webResponse.status})`);
    }

    const htmlText = await webResponse.text();
    
    // Limpieza agresiva de basura (CSS, SVG, Scripts)
    const cleanText = htmlText
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gim, "")
      .replace(/<[^>]*>?/gm, ' ') // Quitar todas las etiquetas HTML
      .replace(/\s+/g, ' ')       // Quitar espacios extra
      .substring(0, 15000); 

    // 2. Llamada a Gemini
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza este contenido de una web inmobiliaria y extrae los datos REALES. 
            Si un dato no está, pon "No disponible". NO INVENTES PRECIOS.
            
            CONTENIDO:
            ${cleanText}

            RESPONDE SOLO JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    return res.status(500).json({ 
      error: "Error de lectura", 
      message: error.message 
    });
  }
}

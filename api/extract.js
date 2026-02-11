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
    // 1. Intentamos leer la web con un User-Agent muy común para evitar bloqueos rápidos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos máximo para leer la web

    const webResponse = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const htmlText = await webResponse.text();

    // 2. Limpieza ultra-rápida: Extraemos solo lo que parece texto importante
    // Quitamos scripts, estilos y etiquetas, pero dejamos el contenido
    const textContext = htmlText
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 10000); // 10k caracteres es suficiente para RE/MAX

    // 3. Llamada a Gemini con el modelo más rápido
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Extrae datos de esta web de RE/MAX. 
            Busca el precio de venta (esta entre 'Venta' y 'Expensas', ej: USD 200.000). 
            Busca la dirección y el título. 
            
            Responde SOLO este JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "RE/MAX", "lat": 0, "lng": 0}
            
            TEXTO: ${textContext}`
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
    console.error("Error:", error.message);
    // Si falla la lectura directa, devolvemos un error amigable
    return res.status(500).json({ 
      error: "Error de conexión o tiempo excedido", 
      details: "La web de la inmobiliaria tardó mucho en responder o bloqueó la conexión." 
    });
  }
}

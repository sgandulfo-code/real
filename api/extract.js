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
    // 1. Intentamos obtener el contenido de la web manualmente
    const webResponse = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const htmlText = await webResponse.text();
    
    // Limpiamos un poco el HTML para no saturar a la IA (quitamos scripts y estilos)
    const cleanText = htmlText
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
      .substring(0, 10000); // Enviamos los primeros 10k caracteres para no exceder límites

    // 2. Le pasamos el texto a Gemini con instrucciones de CERO INVENCIÓN
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Basándote EXCLUSIVAMENTE en el siguiente texto de una página web, extrae los datos de la propiedad. 
            Si el dato no está en el texto, responde "No disponible". No uses conocimiento previo ni inventes precios.

            TEXTO DE LA WEB:
            ${cleanText}

            RESPONDE SOLO JSON:
            {"title": "título exacto", "price": "precio con moneda", "address": "dirección", "sourceName": "nombre de la inmobiliaria", "lat": 0, "lng": 0}`
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
    console.error(error);
    return res.status(500).json({ 
      error: "Error de extracción", 
      details: "No se pudo leer la web o la IA falló. Verifica que la URL sea pública." 
    });
  }
}

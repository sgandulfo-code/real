export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });

  try {
    // 1. Usamos el motor de Jina Reader que es el más potente para saltar bloqueos
    // Añadimos un prefijo que fuerza la lectura del contenido dinámico
    const readerUrl = `https://r.jina.ai/${url}`;
    
    const webResponse = await fetch(readerUrl, {
      headers: {
        'X-Return-Format': 'text', // Forzamos texto plano para que sea rápido
        'X-Wait-For-Selector': '.property-description' // Esperamos a que cargue la descripción
      }
    });

    const cleanText = await webResponse.text();

    // 2. Llamamos a Gemini usando la versión "flash-latest" que es la que te funcionó
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza este texto de una propiedad.
            - PRECIO: El valor de venta (esta entre 'Venta' y 'Expensas').
            - DIRECCIÓN: Calle y altura.
            - TÍTULO: Nombre de la publicación.

            Responde ÚNICAMENTE este JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "RE/MAX", "lat": 0, "lng": 0}

            TEXTO: ${cleanText.substring(0, 8000)}`
          }]
        }]
      })
    });

    const data = await geminiResponse.json();
    
    if (data.error) {
      return res.status(500).json({ error: "Error de Gemini", details: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    return res.status(500).json({ 
      error: "Error crítico", 
      message: "No se pudo leer la inmobiliaria. RE/MAX está bloqueando el acceso." 
    });
  }
}

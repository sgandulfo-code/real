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
    // Usamos Jina pero con un timeout y codificación estricta
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const webResponse = await fetch(jinaUrl);
    const cleanText = await webResponse.text();

    // Recortamos el texto alrededor de donde suele estar el precio para darle prioridad
    const contextText = cleanText.substring(0, 10000);

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres un experto en portales de RE/MAX. Analiza el texto adjunto.
            
            INSTRUCCIÓN DE PRECIO:
            - El precio de venta aparece SIEMPRE después de la palabra "Venta" y ANTES de la palabra "Expensas".
            - Ignora el valor de las Expensas.
            - Busca el patrón: Venta [SÍMBOLO MONEDA] [NÚMERO] Expensas.
            
            Extrae:
            1. title: Título de la propiedad.
            2. price: El valor de venta encontrado entre "Venta" y "Expensas".
            3. address: Dirección en Argentina.
            4. sourceName: "RE/MAX"
            5. lat/lng: Busca coordenadas en el texto o pon 0.

            Responde exclusivamente este JSON:
            {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}

            TEXTO:
            ${contextText}`
          }]
        }]
      })
    });

    const data = await geminiResponse.json();
    if (data.error) throw new Error(data.error.message);

    const aiText = data.candidates[0].content.parts[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("Formato de respuesta inválido");

    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    return res.status(500).json({ error: "Error de extracción", message: error.message });
  }
}

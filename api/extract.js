export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });

  try {
    // 1. Obtenemos Metadatos y Screenshot con Microlink
    // Esto funciona con RE/MAX, Zonaprop y cualquier web.
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
    const metaResponse = await fetch(microlinkUrl);
    const metaData = await metaResponse.json();

    const title = metaData.data.title || "";
    const description = metaData.data.description || "";
    const screenshot = metaData.data.screenshot?.url || "";

    // 2. Le pedimos a Gemini que analice solo los metadatos (rápido y sin bloqueos)
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza este título: "${title}" y esta descripción: "${description}". 
            Extrae el precio y la dirección para una web inmobiliaria argentina. 
            Si no los encuentras, deja los campos vacíos. 
            Responde SOLO JSON: {"price": "...", "address": "...", "title": "..."}`
          }]
        }]
      })
    });

    const geminiData = await geminiResponse.json();
    let aiFields = { price: "", address: "", title: title };

    if (geminiData.candidates) {
      const aiText = geminiData.candidates[0].content.parts[0].text;
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) aiFields = JSON.parse(jsonMatch[0]);
    }

    // 3. Devolvemos todo al frontend
    return res.status(200).json({
      title: aiFields.title || title,
      price: aiFields.price || "",
      address: aiFields.address || "",
      sourceName: metaData.data.publisher || "Inmobiliaria",
      screenshot: screenshot, // Esta es la imagen que el usuario usará para confirmar
      url: url
    });

  } catch (error) {
    console.error(error);
    return res.status(200).json({
      title: "Carga manual requerida",
      price: "",
      address: "",
      screenshot: "",
      error: true
    });
  }
}

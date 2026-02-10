export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });
  if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

  // USAMOS EL NOMBRE EXACTO DE TU LISTA: gemini-flash-latest
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza la web: ${url}. Responde solo JSON: {"title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({
        error: "Google responde",
        message: data.error.message,
        suggestion: "Si sale 404 de nuevo, por favor genera una clave nueva en un proyecto nuevo de AI Studio."
      });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    return res.status(500).json({ error: "Error de red", details: error.message });
  }
}

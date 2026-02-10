export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });
  if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

  // Probamos con v1beta que es donde suelen estar activos los modelos gratuitos de AI Studio/Cloud
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analiza esta web inmobiliaria: ${url}. Extrae: title, price, address, sourceName, lat, lng. Responde solo JSON puro.`
          }]
        }]
      })
    });

    const data = await response.json();

    // Si Google dice que no encuentra el modelo, intentamos con el nombre alternativo
    if (data.error && data.error.message.includes("not found")) {
      return res.status(404).json({
        error: "Modelo no activo",
        message: "Tu clave de Google aún no tiene acceso a gemini-1.5-flash. Intenta cambiar 'gemini-1.5-flash' por 'gemini-pro' en el código de api/extract.js",
        debug: data.error.message
      });
    }

    if (data.error) throw new Error(data.error.message);

    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error) {
    return res.status(500).json({ error: "Error de conexión", details: error.message });
  }
}

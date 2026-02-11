export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const { url } = req.query;

  if (!url) return res.status(200).json({ status: "online" });

  try {
    // 1. Intentamos sacar el título básico usando Microlink (es muy difícil que lo bloqueen)
    const metaRes = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const metaData = await metaRes.json();
    
    const title = metaData.data?.title || "Nueva Propiedad";

    // 2. Le pedimos a Gemini que analice el Título y URL por si hay datos ahí
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Extrae precio y dirección de este texto: "${title}". Si no están, deja vacío. Responde JSON: {"price": "", "address": ""}`
          }]
        }]
      })
    });

    const geminiData = await geminiRes.json();
    let aiFields = { price: "", address: "" };
    
    if (geminiData.candidates) {
      const aiText = geminiData.candidates[0].content.parts[0].text;
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) aiFields = JSON.parse(jsonMatch[0]);
    }

    // Enviamos lo que tenemos (aunque sea poco) para que el usuario lo vea
    return res.status(200).json({
      title: title,
      price: aiFields.price || "",
      address: aiFields.address || "",
      url: url
    });

  } catch (error) {
    return res.status(200).json({ title: "Carga manual", price: "", address: "", url: url });
  }
}

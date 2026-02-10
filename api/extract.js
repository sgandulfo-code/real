export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Falta API Key" });

  // Esta URL consulta qué modelos tienes habilitados exactamente
  const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(listModelsUrl);
    const data = await response.json();

    if (data.error) {
      return res.status(data.error.code || 500).json({
        error: "Error de autenticación",
        message: data.error.message,
        hint: "Si dice 'API Key not valid', la clave de Cloud no tiene activada la Generative Language API."
      });
    }

    // Extraemos solo los nombres de los modelos para que sea fácil de leer
    const availableModels = data.models ? data.models.map(m => m.name) : "No se encontraron modelos";

    return res.status(200).json({
      mensaje: "Lista de modelos detectada para tu clave",
      modelos: availableModels,
      instruccion: "Dime cuál de estos nombres aparece en la lista para actualizar el código."
    });

  } catch (error) {
    return res.status(500).json({ error: "Error de red", details: error.message });
  }
}

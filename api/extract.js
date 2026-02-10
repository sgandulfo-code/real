const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Falta la URL" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract property info from this link: ${url}. Return ONLY JSON: { "title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0 }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({ error: "Error en la IA" });
  }
};

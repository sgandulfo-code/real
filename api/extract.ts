import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  // En Vercel estándar, los parámetros vienen en req.query
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Falta la URL" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extrae información de este enlace: ${url}. Responde solo JSON: { "title": "...", "price": "...", "address": "...", "sourceName": "...", "lat": 0, "lng": 0 }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    return res.status(500).json({ error: "Error en la IA" });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  const { url } = req.query;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract property info from this link: ${url}. Return ONLY JSON: {title, price, address, sourceName, lat, lng}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.status(200).json(JSON.parse(text));
  } catch (error) {
    res.status(500).json({ error: "Failed to extract" });
  }
}

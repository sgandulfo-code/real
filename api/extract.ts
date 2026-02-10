import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel usará la clave que configuraste en "Environment Variables"
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export default async function handler(req: any) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: "No se proporcionó URL" }), { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extrae información de este enlace inmobiliario: ${url}. 
    Responde ÚNICAMENTE un JSON con: title, price, address, sourceName, lat (número), lng (número).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Fallo al extraer datos" }), { status: 500 });
  }
}

export const config = {
  runtime: 'edge',
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiExtractionResult } from "../types";

// Usamos import.meta.env para Vite y el nombre de tu variable en Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const extractPropertyInfo = async (url: string): Promise<GeminiExtractionResult> => {
  // Usamos el modelo 1.5-flash que es el más rápido y estable
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const prompt = `Act as a real estate data extractor. Link: ${url}. 
      Extract property details and return ONLY a JSON object with:
      title, price, address, sourceName, lat (number), lng (number). 
      If you can't find exact coordinates, provide approximate ones for the city mentioned.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    // Devolvemos un objeto por defecto para que la app no se rompa si falla la IA
    return {
      title: "Property at " + new URL(url).hostname,
      price: "Consultar",
      address: "Ver en el sitio web",
      sourceName: new URL(url).hostname.replace('www.', ''),
      lat: 40.4167,
      lng: -3.7033
    };
  }
};

export const suggestViewingQuestions = async (propertyTitle: string, price: string): Promise<string[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  try {
    const prompt = `I will visit: "${propertyTitle}" (${price}). 
      Return a JSON array with 5 smart questions for the realtor.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    return ["¿Gastos de comunidad?", "¿Estado de la ITE?", "¿Orientación solar?"];
  }
};

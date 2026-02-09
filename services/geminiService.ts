
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiExtractionResult } from "../types";

// Always use a helper or fresh instantiation for GoogleGenAI with named apiKey parameter
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractPropertyInfo = async (url: string): Promise<GeminiExtractionResult> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I have a real estate link: ${url}. 
      Based on this URL, please generate a realistic mockup of the property details. 
      I need a professional title, a formatted price, an address, and the name of the portal.
      Additionally, provide approximate latitude and longitude coordinates for this property based on the address.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            price: { type: Type.STRING },
            address: { type: Type.STRING },
            sourceName: { type: Type.STRING },
            lat: { type: Type.NUMBER, description: "Latitude coordinate" },
            lng: { type: Type.NUMBER, description: "Longitude coordinate" },
          },
          required: ["title", "price", "address", "sourceName"]
        }
      }
    });

    // Access .text property directly, do not call as a function
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return {
      title: "New Property Discovery",
      price: "TBD",
      address: "Pending analysis",
      sourceName: new URL(url).hostname.replace('www.', '')
    };
  }
};

export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number } | null> => {
  if (!address || address === "Pending analysis") return null;
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert this address to latitude and longitude coordinates: "${address}". Return only the numbers in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
          },
          required: ["lat", "lng"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Geocoding Error:", error);
    return null;
  }
};

export const suggestViewingQuestions = async (propertyTitle: string, price: string): Promise<string[]> => {
  const ai = getAi();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I am going to visit a property: "${propertyTitle}" priced at ${price}. 
      Give me 5 smart, critical questions I should ask the agent during the visit.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    return ["What are the community fees?", "Are there any pending structural renovations?", "How is the natural light during the day?"];
  }
};

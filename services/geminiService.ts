import { GeminiExtractionResult } from "../types";

export const extractPropertyInfo = async (url: string): Promise<GeminiExtractionResult> => {
  try {
    // Llamamos a nuestra propia API de Vercel (el archivo api/extract.ts)
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    
    return await response.json();
  } catch (error) {
    console.error("Extraction error:", error);
    // Datos por defecto si falla la conexión
    return {
      title: "Nueva Propiedad Detectada",
      price: "Ver en web",
      address: "Dirección pendiente",
      sourceName: new URL(url).hostname.replace('www.', ''),
      lat: 40.4167,
      lng: -3.7033
    };
  }
};

export const suggestViewingQuestions = async (propertyTitle: string, price: string): Promise<string[]> => {
  // Por ahora, devolvemos preguntas fijas para evitar errores de API aquí
  return [
    "¿Cuál es el estado de la ITE (Inspección Técnica)?",
    "¿Cuánto son los gastos de comunidad y qué incluyen?",
    "¿La orientación de la vivienda permite luz natural?",
    "¿Hay derramas pendientes en la comunidad?",
    "¿Cómo es el aislamiento térmico y acústico?"
  ];
};

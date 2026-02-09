export const extractPropertyInfo = async (url: string) => {
  try {
    // Llamamos a nuestra propia API de Vercel
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      title: "Nueva Propiedad",
      price: "Consultar",
      address: "Dirección pendiente",
      sourceName: new URL(url).hostname,
      lat: 40.41,
      lng: -3.70
    };
  }
};

// Mantén las otras funciones si las necesitas, pero esta es la principal

export const extractPropertyInfo = async (url: string) => {
  try {
    // Llamada a nuestra API en Vercel
    const response = await fetch(`/api?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Error en el servidor");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

// Esta es la función que Vite dice que falta:
export const suggestViewingQuestions = async (propertyDetails: any) => {
  return [
    "¿Cuál es el estado de las instalaciones eléctricas?",
    "¿Hay gastos de comunidad pendientes?",
    "¿La zona es ruidosa por la noche?"
  ];
};

// Esta también la pide el error:
export const geocodeAddress = async (address: string) => {
  // Retorna una posición por defecto (Madrid) para que no falle
  return { lat: 40.4168, lng: -3.7038 };
};

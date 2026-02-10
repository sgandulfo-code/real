export const extractPropertyInfo = async (url: string) => {
  try {
    // Sin el "src", la ruta es simplemente /api/extract
    const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Error en el servidor");
    return await response.json();
  } catch (error) {
    return {
      title: "Propiedad Nueva",
      price: "Consultar",
      address: "Ver web",
      sourceName: new URL(url).hostname,
      lat: 40.41,
      lng: -3.70
    };
  }
};

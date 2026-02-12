import React from 'react';
import { MapPin } from 'lucide-react';

const MapView = ({ properties, onSelectProperty }) => {
  // Coordenadas por defecto (Buenos Aires) si no hay datos
  const centerLat = properties.length > 0 ? properties[0].lat : -34.6037;
  const centerLng = properties.length > 0 ? properties[0].lng : -58.3816;

  // URL de Google Maps Embebido (No requiere API Key y no usa librerías)
  const mapUrl = `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=14&output=embed`;

  return (
    <div className="w-full h-full relative bg-slate-100">
      {/* EL MAPA: Un simple iframe que Vite/Vercel siempre aceptarán */}
      <iframe
        title="Property Map"
        className="w-full h-full border-none grayscale-[0.1] contrast-[1.1]"
        src={mapUrl}
        loading="lazy"
      ></iframe>

      {/* CARDS FLOTANTES SOBRE EL MAPA */}
      <div className="absolute bottom-6 left-0 right-0 px-6 overflow-x-auto flex gap-3 no-scrollbar pb-2">
        {properties.map((prop) => (
          <div
            key={prop.id}
            onClick={() => onSelectProperty(prop.id)}
            className="flex-shrink-0 bg-white/90 backdrop-blur-md p-4 rounded-[24px] shadow-2xl border border-white/20 w-48 cursor-pointer hover:bg-white transition-all active:scale-95"
          >
            <div className="flex items-start gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-indigo-600 font-black text-xs leading-none mb-1">{prop.price}</p>
                <p className="text-[10px] font-bold text-slate-700 truncate">{prop.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;

import React from 'react';
import { MapPin } from 'lucide-react';

interface Property {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price: string;
}

interface MapViewProps {
  properties: Property[];
  onSelectProperty: (id: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, onSelectProperty }) => {
  // Tomamos la posición de la primera propiedad como centro, o Buenos Aires por defecto
  const centerLat = properties.length > 0 ? properties[0].lat : -34.6037;
  const centerLng = properties.length > 0 ? properties[0].lng : -58.3816;

  // Creamos la URL para un Iframe de Google Maps (Modo Vista)
  // Nota: Esto muestra un mapa interactivo estándar sin necesidad de librerías externas
  const mapUrl = `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=14&output=embed`;

  return (
    <div className="w-full h-full relative bg-slate-100 flex flex-col">
      {/* MAPA REAL (IFRAME) */}
      <iframe
        title="Map View"
        className="w-full flex-1 border-none filter grayscale-[0.2] contrast-[1.1]"
        src={mapUrl}
        loading="lazy"
        allowFullScreen
      ></iframe>

      {/* OVERLAY DE PINES SELECCIONABLES (Lista rápida lateral o inferior) */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {properties.map((prop) => (
          <button
            key={prop.id}
            onClick={() => onSelectProperty(prop.id)}
            className="flex-shrink-0 bg-white shadow-xl border border-slate-100 p-3 rounded-2xl flex items-center gap-3 hover:bg-indigo-600 group transition-all"
          >
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-500">
              <MapPin className="w-4 h-4 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-indigo-100">
                {prop.price}
              </p>
              <p className="text-xs font-bold text-slate-700 truncate w-24 group-hover:text-white">
                {prop.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapView;

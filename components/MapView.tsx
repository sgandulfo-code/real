import React from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Esto es necesario para que los iconos de los pines se vean bien en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ properties, onSelectProperty }: any) => {
  // Centro por defecto: Buenos Aires o la primera propiedad
  const centerLat = properties.length > 0 ? properties[0].lat : -34.6037;
  const centerLng = properties.length > 0 ? properties[0].lng : -58.3816;

  // Filtrar propiedades que tengan coordenadas válidas
  const validProperties = properties.filter((p: any) => p.lat && p.lng);

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden">
      
      {/* MAPA REAL CON MÚLTIPLES MARCAS */}
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // Quitamos los botones +/- para que sea más limpio
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />

        {validProperties.map((prop: any) => (
          <Marker 
            key={prop.id} 
            position={[prop.lat, prop.lng]}
            eventHandlers={{
              click: () => onSelectProperty(prop.id),
            }}
          >
            <Popup>
              <div className="font-sans p-1">
                <p className="font-black text-slate-900 text-[10px] uppercase leading-tight">{prop.title}</p>
                <p className="text-indigo-600 font-bold text-xs">{prop.price}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CARDS FLOTANTES (Mantenemos tu diseño original que es genial) */}
      <div className="absolute bottom-8 left-0 right-0 px-6 overflow-x-auto flex gap-3 no-scrollbar pb-4 z-[1000]">
        {properties.map((prop: any) => (
          <div
            key={prop.id}
            onClick={() => onSelectProperty(prop.id)}
            className="flex-shrink-0 bg-white/80 backdrop-blur-xl p-4 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 w-52 cursor-pointer hover:bg-white transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-indigo-600 font-black text-sm leading-none mb-1">{prop.price}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">{prop.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de cantidad en la esquina */}
      <div className="absolute top-6 right-6 z-[1000] bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
        {validProperties.length} Propiedades encontradas
      </div>
    </div>
  );
};

export default MapView;

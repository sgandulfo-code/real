import React from 'react';
import GoogleMapReact from 'google-map-react';
import { MapPin } from 'lucide-react';

// Componente para el Pin Personalizado
const Marker = ({ price, title, onClick }) => (
  <div 
    onClick={onClick}
    className="relative flex flex-col items-center group cursor-pointer"
    style={{ transform: 'translate(-50%, -100%)' }} // Centrar el pin
  >
    <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl mb-1 group-hover:bg-indigo-600 transition-colors whitespace-nowrap">
      {price}
    </div>
    <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform" />
  </div>
);

const MapView = ({ properties, onSelectProperty }) => {
  // Centro inicial (Buenos Aires por defecto si no hay propiedades)
  const defaultCenter = {
    lat: properties[0]?.lat || -34.6037,
    lng: properties[0]?.lng || -58.3816
  };

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-inner border border-slate-100">
      <GoogleMapReact
        bootstrapURLKeys={{ key: "TU_API_KEY_AQUI" }} // Reemplazar con tu API Key
        defaultCenter={defaultCenter}
        defaultZoom={13}
        options={{
          styles: mapStyles, // Estilo minimalista abajo
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {properties.map(prop => (
          <Marker
            key={prop.id}
            lat={prop.lat}
            lng={prop.lng}
            price={prop.price}
            title={prop.title}
            onClick={() => onSelectProperty(prop.id)}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
};

// Estilo minimalista para el mapa (Snazzy Maps style)
const mapStyles = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
  { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
];

export default MapView;

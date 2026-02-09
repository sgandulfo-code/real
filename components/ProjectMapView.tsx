
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types';

interface Props {
  properties: Property[];
  onSelectProperty: (id: string) => void;
}

const ProjectMapView: React.FC<Props> = ({ properties, onSelectProperty }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.FeatureGroup | null>(null);

  const propsWithCoords = properties.filter(p => p.lat && p.lng);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([0, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
      markersLayer.current = L.featureGroup().addTo(mapInstance.current);
    }

    if (markersLayer.current && mapInstance.current) {
      markersLayer.current.clearLayers();

      propsWithCoords.forEach((prop) => {
        const icon = L.divIcon({
          className: 'custom-project-marker',
          html: `
            <div class="relative group">
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md border border-slate-200 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                ${prop.price}
              </div>
              <div class="w-8 h-8 bg-indigo-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                <img src="${prop.favicon}" class="w-4 h-4 rounded-sm" />
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([prop.lat!, prop.lng!], { icon })
          .on('click', () => onSelectProperty(prop.id));
        
        markersLayer.current?.addLayer(marker);
      });

      if (propsWithCoords.length > 0) {
        const bounds = markersLayer.current.getBounds();
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [propsWithCoords, onSelectProperty]);

  if (propsWithCoords.length === 0) {
    return (
      <div className="w-full h-[500px] bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="font-bold">No properties with location found</p>
        <p className="text-sm">Add addresses to your properties to see them on the map.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl bg-white group">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-slate-100">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Project Overview</p>
           <p className="text-sm font-bold text-slate-800">{propsWithCoords.length} Properties Located</p>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 z-10 flex gap-2">
         <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <span className="text-xs font-bold text-slate-600">Saved Listing</span>
         </div>
      </div>
    </div>
  );
};

export default ProjectMapView;

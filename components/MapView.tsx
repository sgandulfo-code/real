
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Props {
  lat?: number;
  lng?: number;
  address: string;
}

const MapView: React.FC<Props> = ({ lat, lng, address }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(mapInstance.current);

      // Add a clean zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([lat, lng], 15);
    }

    // Custom circle marker for a cleaner "app" look
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-indigo-600/30 rounded-full animate-ping"></div>
          <div class="w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-lg"></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    if (markerInstance.current) {
      markerInstance.current.setLatLng([lat, lng]);
    } else {
      markerInstance.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
    }

    return () => {
      // We don't necessarily want to destroy the map on every small update, 
      // but clean up is good for strict React behavior.
    };
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div className="w-full h-40 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
         <span className="text-xs font-medium uppercase tracking-widest">Location unknown</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
        REAL-TIME LOCATION
      </div>
    </div>
  );
};

export default MapView;

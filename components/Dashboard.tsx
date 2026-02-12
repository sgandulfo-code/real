import React, { useState } from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';
import ProjectMapView from './ProjectMapView';
import { Home, Heart, Eye, CheckCircle } from 'lucide-react'; // Importamos iconos para las stats

interface Props {
  properties: Property[];
  onSelect: (id: string) => void;
}

type ViewMode = 'grid' | 'map';

const Dashboard: React.FC<Props> = ({ properties, onSelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Cálculo de estadísticas dinámicas
  const stats = {
    total: properties.length,
    favorites: properties.filter(p => p.rating >= 4).length,
    interested: properties.filter(p => p.status === PropertyStatus.INTERESTED).length,
    visited: properties.filter(p => p.status === PropertyStatus.VISITED).length,
  };

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No properties tracked yet</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Paste a link from Zillow, Idealista, or any real estate portal into the bar above to start managing your search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SECCIÓN DE ESTADÍSTICAS REALES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Home className="w-5 h-5" />} label="Total" value={stats.total} color="bg-blue-600" />
        <StatCard icon={<Heart className="w-5 h-5" />} label="Favoritas" value={stats.favorites} color="bg-rose-500" />
        <StatCard icon={<Eye className="w-5 h-5" />} label="Interés" value={stats.interested} color="bg-amber-500" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Visitadas" value={stats.visited} color="bg-emerald-500" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Workspace</h2>
          <p className="text-slate-500 font-medium text-sm">Managing {properties.length} potential homes</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Switcher */}
          <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              Grid
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Map
            </button>
          </div>

          <div className="flex gap-2">
             <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100">
               <option>All Statuses</option>
               <option>Interested</option>
               <option>Visited</option>
             </select>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => onSelect(property.id)} 
              />
            ))}
          </div>
        ) : (
          <ProjectMapView 
            properties={properties} 
            onSelectProperty={onSelect} 
          />
        )}
      </div>
    </div>
  );
};

// Componente para las tarjetas de estadísticas con estilo PropTrack
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex items-center gap-4 transition-all hover:border-indigo-100">
    <div className={`${color} text-white p-3 rounded-2xl shadow-lg shadow-slate-100`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;

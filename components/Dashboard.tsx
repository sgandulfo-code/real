import React, { useState } from 'react';
import { Property, PropertyStatus } from '../types';
import PropertyCard from './PropertyCard';
import ProjectMapView from './ProjectMapView';
import { Home, Heart, Eye, CheckCircle, Target } from 'lucide-react';

interface Props {
  properties: Property[];
  onSelect: (id: string) => void;
}

type ViewMode = 'grid' | 'map';

const Dashboard: React.FC<Props> = ({ properties, onSelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Estadísticas dinámicas
  const stats = {
    total: properties.length,
    favorites: properties.filter(p => p.rating >= 4).length,
    interested: properties.filter(p => p.status === PropertyStatus.INTERESTED).length,
    visited: properties.filter(p => p.status === PropertyStatus.VISITED).length,
  };

  // Cálculo de progreso (Propiedades con decisión tomada / Total)
  const progress = stats.total > 0 
    ? Math.round((stats.visited / stats.total) * 100) 
    : 0;

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
          <Home className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No properties tracked yet</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Paste a link from any real estate portal into the bar above to start.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECCIÓN DE PROGRESO Y STATS */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cuadrícula de Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:flex-1 gap-4">
          <StatCard icon={<Home className="w-5 h-5" />} label="Total" value={stats.total} color="bg-indigo-600" />
          <StatCard icon={<Heart className="w-5 h-5" />} label="Favoritas" value={stats.favorites} color="bg-rose-500" />
          <StatCard icon={<Eye className="w-5 h-5" />} label="Interés" value={stats.interested} color="bg-amber-500" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Visitadas" value={stats.visited} color="bg-emerald-500" />
        </div>

        {/* Barra de Progreso de Búsqueda */}
        <div className="lg:w-80 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Búsqueda</p>
              <p className="text-sm font-black text-slate-800">Progreso de Visitas</p>
            </div>
            <span className="text-2xl font-black text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
            {progress === 100 ? '¡Todas las propiedades visitadas!' : `${stats.total - stats.visited} propiedades pendientes`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-t border-slate-100 pt-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Workspace</h2>
          <p className="text-slate-500 font-medium text-sm">Managing potential homes</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Map
            </button>
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

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-indigo-100">
    <div className={`${color} text-white p-3 rounded-2xl`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;

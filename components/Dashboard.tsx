import React, { useState } from 'react';
import { 
  Edit3, 
  Home, 
  Map as MapIcon, 
  LayoutGrid, 
  Check, 
  X, 
  Bed, 
  Maximize, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import MapView from './MapView';

const Dashboard = ({ properties, onSelect, groupName, onUpdateGroup }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'map'

  const handleUpdate = () => {
    if (newName.trim()) {
      onUpdateGroup(newName);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- SECCIÓN DE CABECERA Y CONTROL --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Workspace Activo
            </span>
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2 mt-2">
              <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-3xl md:text-4xl font-black text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
              <button 
                onClick={handleUpdate} 
                className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 group">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {groupName}
              </h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
              >
                <Edit3 className="w-6 h-6" />
              </button>
            </div>
          )}
          
          <p className="text-slate-400 font-medium flex items-center gap-2 pt-1">
            <Home className="w-4 h-4 text-slate-300" />
            <span className="font-bold text-slate-500">{properties.length}</span> propiedades en este análisis
          </p>
        </div>

        {/* SELECTOR DE VISTA (TOGGLE) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start md:self-end shadow-inner">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'grid' 
                ? 'bg-white shadow-md text-slate-900' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Lista
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'map' 
                ? 'bg-white shadow-md text-slate-900' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {viewMode === 'map' ? (
        <div className="w-full h-[650px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative bg-slate-100">
          <MapView 
            properties={properties} 
            onSelectProperty={onSelect} 
          />
          <div className="absolute bottom-6 left-6 right-6 flex justify-center pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-xs font-black shadow-2xl pointer-events-auto flex items-center gap-3 tracking-widest uppercase">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Explorando {properties.length} ubicaciones
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div 
              key={property.id}
              onClick={() => onSelect(property.id)}
              className="group bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer hover:-translate-y-2"
            >
              {/* Imagen con Badge de Fuente */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={property.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={property.title}
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl text-[10px] font-black text-slate-800 shadow-sm uppercase tracking-tighter flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {property.sourceName}
                </div>
              </div>

              {/* Contenido de la Card */}
              <div className="p-7">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                    {property.title}
                  </h3>
                </div>
                
                <p className="text-2xl font-black text-indigo-600 mb-6 flex items-center gap-1">
                  {property.price}
                </p>
                
                {/* Specs: Dormitorios, Baños, Metros */}
                <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-bold text-sm">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Maximize className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-bold text-sm">{property.sqft}m²</span>
                  </div>
                  
                  <div className="ml-auto">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {properties.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[50px] bg-slate-50/30">
              <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-50">
                <Home className="w-10 h-10 text-indigo-200" />
              </div>
              <h4 className="text-slate-900 font-black text-xl mb-2">Tu Workspace está vacío</h4>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                Pega un enlace de cualquier portal inmobiliario arriba para empezar el análisis.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

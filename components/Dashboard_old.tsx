import React, { useState } from 'react';
import { 
  Edit3, Home, Map as MapIcon, LayoutGrid, Check, X, 
  Bed, Maximize, ChevronRight, MapPin, Link as LinkIcon, Plus
} from 'lucide-react';
import MapView from './MapView';

const Dashboard = ({ properties, onSelect, groupName, onUpdateGroup, onAddProperty }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName);
  const [viewMode, setViewMode] = useState('grid');
  const [url, setUrl] = useState('');

  // 1. Manejo del cambio de nombre del grupo
  const handleUpdate = () => {
    if (newName.trim()) {
      onUpdateGroup(newName);
      setIsEditing(false);
    }
  };

  // 2. Manejo de nueva propiedad (lo que le faltaba al viejo)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAddProperty(url); // Esto dispararía el Verificador/Tamara AI
      setUrl('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
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
              <button onClick={handleUpdate} className="p-2 bg-emerald-500 text-white rounded-full">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 group">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {groupName}
              </h2>
              <button onClick={() => setIsEditing(true)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100">
                <Edit3 className="w-6 h-6" />
              </button>
            </div>
          )}
          
          <p className="text-slate-400 font-medium flex items-center gap-2 pt-1">
            <Home className="w-4 h-4 text-slate-300" />
            <span className="font-bold text-slate-500">{properties.length}</span> propiedades analizadas
          </p>
        </div>

        {/* SELECTOR DE VISTA */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start md:self-end shadow-inner">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Lista
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
          >
            <MapIcon className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>

      {/* --- BARRA DE CAPTURA (Agregada para que sea funcional) --- */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="url"
              placeholder="Pega el link de la propiedad aquí..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 font-medium text-slate-600 transition-all"
            />
          </div>
          <button className="bg-slate-900 text-white px-8 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200">
            <Plus className="w-5 h-5" /> Analizar
          </button>
        </form>
      </div>

      {/* --- CONTENIDO --- */}
      {viewMode === 'map' ? (
        <div className="w-full h-[650px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative bg-slate-100">
          <MapView properties={properties} onSelectProperty={onSelect} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div 
              key={property.id}
              onClick={() => onSelect(property.id)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 relative"
            >
              {/* Contenido de la tarjeta (se mantiene igual a tu diseño original) */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={property.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={property.title} />
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                  <p className="text-indigo-600 font-black text-xl leading-none">{property.price}</p>
                </div>
              </div>
              <div className="p-7">
                <h3 className="font-bold text-slate-800 text-lg mb-6 line-clamp-1">{property.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 text-slate-700">
                    <span className="flex items-center gap-2"><Bed className="w-4 h-4 text-slate-400" /> {property.bedrooms}</span>
                    <span className="flex items-center gap-2"><Maximize className="w-4 h-4 text-slate-400" /> {property.sqft}m²</span>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {properties.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-indigo-200">
                <MapPin className="w-8 h-8" />
              </div>
              <h4 className="text-slate-900 font-black text-xl mb-1">Tu lista está vacía</h4>
              <p className="text-slate-400 text-sm">Comienza agregando enlaces de propiedades arriba.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

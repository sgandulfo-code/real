import React, { useState } from 'react';
import { Edit3, Home, Map as MapIcon, List, LayoutGrid, Check, X } from 'lucide-react';

const Dashboard = ({ properties, onSelect, groupName, onUpdateGroup }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName);

  const handleUpdate = () => {
    onUpdateGroup(newName);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* HEADER DEL PROYECTO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
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
                className="text-3xl font-black text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent"
                autoFocus
              />
              <button onClick={handleUpdate} className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 group">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                {groupName}
              </h2>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <p className="text-slate-400 font-medium flex items-center gap-2">
            <Home className="w-4 h-4" />
            {properties.length} propiedades encontradas en esta zona
          </p>
        </div>

        {/* SELECTOR DE VISTA (Opcional para futuro) */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-700">
            <LayoutGrid className="w-4 h-4" /> Galería
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            <MapIcon className="w-4 h-4" /> Mapa
          </button>
        </div>
      </div>

      {/* GRILLA DE PROPIEDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div 
            key={property.id}
            onClick={() => onSelect(property.id)}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer hover:-translate-y-1"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={property.thumbnail} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={property.title}
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-700 shadow-sm uppercase">
                {property.sourceName}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{property.title}</h3>
              <p className="text-indigo-600 font-black text-xl mb-4">{property.price}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold text-xs">🛌 {property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-bold text-xs">📐 {property.sqft}m²</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ver Detalles</span>
              </div>
            </div>
          </div>
        ))}
        
        {properties.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-medium">No hay propiedades aún. ¡Pega un link arriba para empezar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

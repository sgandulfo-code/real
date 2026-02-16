import React, { useState } from 'react';
import { 
  Edit3, 
  Home, 
  Map as MapIcon, 
  LayoutGrid, 
  Check, 
  Bed, 
  Maximize, 
  ChevronRight,
  MapPin
} from 'lucide-react';
import MapView from './MapView';

const Dashboard = ({ properties, onSelect, groupName, onUpdateGroup }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(groupName);
  const [viewMode, setViewMode] = useState('grid');

  const handleUpdate = () => {
    if (newName.trim()) {
      onUpdateGroup(newName);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* --- SELECTOR DE VISTA Y CONTROLES SUPERIORES --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={16} /> LISTA
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <MapIcon size={16} /> MAPA
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Home size={16} />
          <span className="text-sm font-bold"><span className="text-slate-900">{properties.length}</span> Propiedades encontradas</span>
        </div>
      </div>

      {/* --- CONTENIDO DINÁMICO --- */}
      {viewMode === 'map' ? (
        <div className="w-full h-[600px] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-xl bg-slate-100">
          <MapView properties={properties} onSelectProperty={onSelect} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div 
              key={property.id}
              onClick={() => onSelect(property.id)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2"
            >
              {/* Imagen */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={property.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={property.title}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800'; }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{property.sourceName}</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black shadow-lg">
                    {property.price}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-7">
                <h3 className="font-black text-slate-800 text-lg mb-4 line-clamp-1">{property.title}</h3>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Dorms</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Bed size={14} className="text-slate-400" />
                        <span className="font-black text-sm text-slate-700">{property.bedrooms}</span>
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-100" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sup</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Maximize size={14} className="text-slate-400" />
                        <span className="font-black text-sm text-slate-700">{property.sqft}m²</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Estado vacío */}
          {properties.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-slate-200" size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay propiedades en este grupo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

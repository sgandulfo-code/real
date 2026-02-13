import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '../types';
import { ArrowLeft, Heart, Trash2, MapPin, MessageSquare, Target } from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  const [localProp, setLocalProp] = useState<Property>(property);
  useEffect(() => { setLocalProp(property); }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updated = { ...localProp, [e.target.name]: e.target.value };
    setLocalProp(updated);
    onUpdate(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-[2rem] backdrop-blur-sm border border-white shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold group transition-all">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdate({...localProp, isFavorite: !localProp.isFavorite})} className={`p-3 rounded-2xl ${localProp.isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-white text-slate-300 shadow-sm'}`}>
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={onDelete} className="p-3 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative">
              <img src={localProp.thumbnail} className="w-full h-full object-cover" alt="Property" />
            </div>
            <div className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                <div className="flex-1 space-y-2">
                  <input name="title" className="w-full text-4xl font-black text-slate-900 border-none p-0 outline-none bg-transparent" value={localProp.title} onChange={handleChange} />
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <input name="address" className="w-full border-none p-0 outline-none bg-transparent" value={localProp.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="bg-indigo-50 px-8 py-5 rounded-[2rem] h-fit">
                  <input name="price" className="text-3xl font-black text-indigo-600 border-none p-0 outline-none bg-transparent w-40 text-right" value={localProp.price} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                   <MessageSquare className="w-3 h-3 text-indigo-500" /> Notas del Inversor
                </label>
                <textarea name="comments" rows={6} className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-slate-700 outline-none text-lg" value={localProp.comments || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2 tracking-tight">
              <Target className="w-5 h-5 text-indigo-600" /> Gestión
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado</label>
                <select name="status" className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none appearance-none" value={localProp.status} onChange={handleChange}>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

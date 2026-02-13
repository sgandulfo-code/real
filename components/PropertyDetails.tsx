import React, { useState } from 'react';
import { Property } from '../types';
import { ArrowLeft, Trash2, MapPin } from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (p: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({ ...property, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600">
        <ArrowLeft className="w-5 h-5" /> Volver
      </button>

      <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
        <img src={property.thumbnail} className="w-full h-64 object-cover" alt="Property" />
        <div className="p-8 space-y-6">
          <input name="title" className="text-3xl font-black w-full border-none p-0 outline-none" value={property.title} onChange={handleChange} />
          <input name="price" className="text-xl font-bold text-indigo-600 w-full border-none p-0 outline-none" value={property.price} onChange={handleChange} />
          <textarea name="comments" className="w-full bg-slate-50 rounded-2xl p-4 text-slate-600 outline-none" rows={4} value={property.comments || ''} onChange={handleChange} placeholder="Notas..." />
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 flex items-center gap-2 text-sm font-bold pt-4"><Trash2 className="w-4 h-4" /> Eliminar propiedad</button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

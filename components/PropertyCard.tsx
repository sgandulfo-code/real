import React from 'react';
import { Property } from '../types';
import { MapPin } from 'lucide-react';

interface Props {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<Props> = ({ property, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 cursor-pointer group"
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={property.thumbnail} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={property.title} 
        />
      </div>
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight leading-tight">{property.title}</h3>
          <span className="text-indigo-600 font-black">{property.price}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
          <MapPin size={12} className="text-indigo-400" />
          <span className="truncate">{property.address}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

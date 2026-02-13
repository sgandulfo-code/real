import React from 'react';
import { Property } from '../types';
import { MapPin, Heart } from 'lucide-react';

interface Props {
  property: Property;
  onClick: () => void;
  onUpdate: (property: Property) => void;
}

const PropertyCard: React.FC<Props> = ({ property, onClick, onUpdate }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
      <div className="aspect-video relative">
        <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
        <button 
          onClick={(e) => { e.stopPropagation(); onUpdate({...property, isFavorite: !property.isFavorite}); }}
          className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md ${property.isFavorite ? 'bg-pink-500 text-white' : 'bg-white/80 text-slate-400'}`}
        >
          <Heart className={`w-4 h-4 ${property.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="p-5 space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 truncate">{property.title}</h3>
          <span className="text-indigo-600 font-black">{property.price}</span>
        </div>
        <p className="text-slate-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.address}</p>
      </div>
    </div>
  );
};

export default PropertyCard;

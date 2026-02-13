import React from 'react';
import { Property } from '../types';
import { MapPin, Heart, TrendingDown } from 'lucide-react';

interface Props {
  property: Property;
  onClick: () => void;
  onUpdate: (property: Property) => void;
}

const PropertyCard: React.FC<Props> = ({ property, onClick, onUpdate }) => {
  // Cálculo de Score simplificado para la Card
  const getPriceNum = (p: string) => Number(p.replace(/[^0-9.-]+/g, ""));
  const ratio = property.sqft > 0 ? getPriceNum(property.price) / property.sqft : 0;
  
  // Lógica visual: Si el $/m2 es menor a 2200 (ejemplo), es buena oferta
  const score = ratio > 0 ? Math.min(Math.round(180000 / ratio), 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer relative"
    >
      {/* Badge de Score en el Dashboard */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-3 py-1.5 rounded-full text-white text-[10px] font-black shadow-lg backdrop-blur-md flex items-center gap-2 ${score > 70 ? 'bg-emerald-500' : 'bg-slate-900'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          SCORE: {score}
        </div>
      </div>

      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={property.thumbnail} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({...property, isFavorite: !property.isFavorite});
          }}
          className={`absolute bottom-4 right-4 p-2 rounded-xl backdrop-blur-md border border-white/20 transition-all ${property.isFavorite ? 'bg-pink-500 text-white' : 'bg-white/80 text-slate-400 hover:text-pink-500'}`}
        >
          <Heart className={`w-4 h-4 ${property.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-black text-slate-800 leading-tight line-clamp-2 uppercase text-sm tracking-tight">{property.title}</h3>
          <p className="text-indigo-600 font-black text-lg">{property.price}</p>
        </div>
        
        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
          <MapPin className="w-3 h-3 text-indigo-400" />
          <span className="truncate">{property.address}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
           <div className="flex gap-3 text-[10px] font-black text-slate-400">
              <span className="bg-slate-50 px-2 py-1 rounded-md">{property.bedrooms} DORM</span>
              <span className="bg-slate-50 px-2 py-1 rounded-md">{property.sqft} m²</span>
           </div>
           {score > 75 && (
             <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black">
               <TrendingDown className="w-3 h-3" /> GRAN PRECIO
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

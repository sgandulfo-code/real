
import React from 'react';
import { Property } from '../types';
import StatusBadge from './StatusBadge';
import Rating from './Rating';

interface Props {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<Props> = ({ property, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={property.thumbnail} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
           <StatusBadge status={property.status} />
           {property.isFavorite && (
              <div className="bg-white/95 backdrop-blur p-1.5 rounded-full shadow-lg text-pink-500">
                 <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
           )}
        </div>
        <div className="absolute top-3 left-3">
          <div className="bg-white/95 backdrop-blur p-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
             <img src={property.favicon} alt={property.sourceName} className="w-4 h-4" />
             <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{property.sourceName}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm inline-block border border-white/50">
             <span className="text-indigo-700 font-bold text-lg">{property.price}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">{property.title}</h3>
        </div>
        
        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span className="truncate">{property.address}</span>
        </p>

        {/* Personal Notes Preview Section */}
        <div className="mb-4">
           {property.comments ? (
             <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 relative group/notes">
                <div className="flex items-start gap-2">
                   <svg className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                   <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">
                     "{property.comments}"
                   </p>
                </div>
             </div>
           ) : (
             <div className="border border-dashed border-slate-200 rounded-xl p-3 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">No notes yet</span>
             </div>
           )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <Rating value={property.rating} />
          {property.nextVisit ? (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-lg">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
               <span>{new Date(property.nextVisit).toLocaleDateString()}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No visit set</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

import React from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Trash2, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Phone, 
  User as UserIcon, 
  Calendar,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailsProps {
  property: Property | undefined;
  onBack: () => void;
  onUpdate: (updatedProperty: Property) => void;
  onDelete: (id: string) => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onBack, onUpdate, onDelete }) => {
  // 1. Salvaguarda: Si por alguna razón la propiedad no llega, mostramos un error en lugar de blanco
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <p className="text-slate-500 font-bold mb-4">No se pudo encontrar la información de la propiedad.</p>
        <button onClick={onBack} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onDelete(property.id)}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            title="Eliminar de mi lista"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <a 
            href={property.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Ver Original <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: IMAGEN Y BÁSICOS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={property.thumbnail} 
              className="w-full aspect-video object-cover"
              alt={property.title}
            />
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {property.sourceName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Agregado hoy
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {property.address || 'Ubicación no especificada'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <Bed className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-black text-slate-800">{property.bedrooms}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Dorms</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <Bath className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-black text-slate-800">{property.bathrooms || 1}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Baños</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <Maximize className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-black text-slate-800">{property.sqft}m²</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Superficie</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PRECIO Y CONTACTO */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest mb-2">Precio de Venta</p>
            <h2 className="text-4xl font-black mb-6">{property.price}</h2>
            <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-700/20">
              Me interesa esta propiedad
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" /> Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Teléfono</p>
                  <p className="font-bold text-slate-700">{property.contactPhone || 'No disponible'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Nombre</p>
                  <p className="font-bold text-slate-700">{property.contactName || 'Inmobiliaria'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

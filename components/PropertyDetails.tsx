import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Trash2, 
  ExternalLink, 
  MessageCircle, 
  BedDouble, 
  Bath, 
  Maximize, 
  Calendar,
  Star,
  User,
  Phone
} from 'lucide-react';
import { Property, PropertyStatus } from '../types';

interface PropertyDetailsProps {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

export default function PropertyDetails({ property, onUpdate, onBack, onDelete }: PropertyDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const statusColors = {
    [PropertyStatus.INTERESTED]: 'bg-indigo-100 text-indigo-700',
    [PropertyStatus.VISITING]: 'bg-amber-100 text-amber-700',
    [PropertyStatus.OFFERED]: 'bg-emerald-100 text-emerald-700',
    [PropertyStatus.REJECTED]: 'bg-rose-100 text-rose-700',
    [PropertyStatus.COMPLETED]: 'bg-slate-100 text-slate-700',
  };

  const shareOnWhatsApp = () => {
    const message = `¡Mira esta propiedad! \n\n${property.title}\nPrecio: ${property.price}\nLink: ${property.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Barra de Navegación Superior */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-tight">Volver al listado</span>
        </button>

        <div className="flex gap-3">
          <button 
            onClick={shareOnWhatsApp}
            className="p-3 bg-green-50 text-green-600 rounded-2xl border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm"
            title="Compartir por WhatsApp"
          >
            <MessageCircle size={22} />
          </button>
          <button 
            onClick={() => setIsDeleting(true)}
            className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Imagen y Galería */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
            <img 
              src={property.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80'} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${statusColors[property.status]}`}>
                {property.status}
              </span>
            </div>
          </div>

          {/* Tarjeta de Ubicación */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <MapPin className="text-indigo-600" size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Ubicación</h4>
                <p className="text-slate-500 font-medium">{property.address || 'Dirección no especificada'}</p>
              </div>
            </div>
            {/* Aquí iría el mini-mapa o el link externo */}
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Ver en Google Maps <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* COLUMNA DERECHA: Info y Acción */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100 relative overflow-hidden">
            {/* Elemento Decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -mr-16 -mt-16" />

            <div className="relative">
              <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-3">Propiedad Seleccionada</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                {property.title}
              </h1>
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-indigo-600 tracking-tighter">{property.price}</span>
                <span className="text-slate-400 font-bold uppercase text-xs">Total</span>
              </div>

              {/* Grid de Atributos (Match con el listado) */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center text-center">
                  <BedDouble className="text-slate-400 mb-2" size={20} />
                  <span className="text-slate-900 font-black text-sm">{property.bedrooms}</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Dorm.</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center text-center">
                  <Bath className="text-slate-400 mb-2" size={20} />
                  <span className="text-slate-900 font-black text-sm">{property.bathrooms}</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">Baños</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center text-center">
                  <Maximize className="text-slate-400 mb-2" size={20} />
                  <span className="text-slate-900 font-black text-sm">{property.sqft}</span>
                  <span className="text-slate-400 text-[9px] font-bold uppercase">M² Tot.</span>
                </div>
              </div>

              {/* Contacto del Vendedor */}
              <div className="space-y-4 border-t border-slate-50 pt-8">
                <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contacto Directo</h5>
                <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm leading-none mb-1">{property.contactName || 'Inmobiliaria'}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                      <Phone size={12} /> {property.contactPhone || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <a 
                href={property.url}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-center block hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 group"
              >
                VISITAR PUBLICACIÓN ORIGINAL
                <ExternalLink size={18} className="inline-all ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Borrado */}
      {isDeleting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl border border-white">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">¿Estás seguro?</h3>
            <p className="text-slate-500 font-medium mb-8">Esta acción eliminará la propiedad de tu proyecto de forma permanente.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleting(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={onDelete}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-shadow shadow-lg shadow-rose-200"
              >
                BORRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyStatus } from '../types';
// Importamos solo lo que sabemos que existe en Lucide
import { 
  ArrowLeft, Heart, Share2, Trash2, ExternalLink, 
  MapPin, Star, MessageSquare, Phone, Calendar, 
  Zap, Info, Check, X, Send, Mail, Copy
} from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  // Estado local para evitar lag al escribir
  const [localProp, setLocalProp] = useState<Property>(property);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Sincronizar si la prop cambia externamente
  useEffect(() => {
    setLocalProp(property);
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...localProp, [name]: value };
    setLocalProp(updated);
    onUpdate(updated);
  };

  const toggleFavorite = () => {
    const updated = { ...localProp, isFavorite: !localProp.isFavorite };
    setLocalProp(updated);
    onUpdate(updated);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(localProp.url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Renderizado de Estrellas manual para evitar que Rating.tsx rompa la app
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= (rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
            }`}
            onClick={() => onUpdate({ ...localProp, rating: star })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header de Navegación */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold group"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver a la lista
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-2xl transition-all ${localProp.isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-white text-slate-300 hover:text-pink-400 shadow-sm'}`}
          >
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => setShowShareModal(true)}
            className="p-3 bg-white text-slate-300 hover:text-indigo-600 rounded-2xl shadow-sm transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2" />
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative group">
              <img src={localProp.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property" />
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{localProp.sourceName}</span>
                </div>
              </div>
            </div>

            <div className="p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex-1 space-y-2">
                  <input 
                    name="title" 
                    className="w-full text-4xl font-black text-slate-900 border-none p-0 focus:ring-0 outline-none placeholder:text-slate-200"
                    value={localProp.title}
                    onChange={handleChange}
                  />
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <input 
                      name="address" 
                      className="w-full border-none p-0 focus:ring-0 outline-none text-lg bg-transparent"
                      value={localProp.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-[2rem]">
                  <input 
                    name="price" 
                    className="text-3xl font-black text-indigo-600 border-none p-0 focus:ring-0 outline-none text-right bg-transparent w-40"
                    value={localProp.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Personal Rating */}
              <div className="flex items-center gap-6 py-6 border-y border-slate-50 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tu Valoración</label>
                  {renderStars(localProp.rating)}
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <a 
                  href={localProp.url} 
                  target="_blank" 
                  className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                >
                  Link Original <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Notas */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <MessageSquare className="w-3 h-3" /> Notas y Observaciones
                </label>
                <textarea 
                  name="comments"
                  rows={5}
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-lg"
                  placeholder="¿Qué te pareció el barrio? ¿Viste alguna humedad? ¿Es ruidoso?"
                  value={localProp.comments}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* AI Strategy (Simplificado para evitar errores de GeminiService) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-black">Estrategia de Visita</h3>
              </div>
              <p className="text-slate-400 mb-8 font-medium">Recomendaciones para tu próxima visita a esta propiedad.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Revisar presión de agua', 'Consultar por expensas', 'Ver orientación del sol', 'Preguntar por cochera'].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span className="font-bold text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Barra Lateral: Gestión */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
              Gestión
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado del Proceso</label>
                <select 
                  name="status"
                  className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  value={localProp.status}
                  onChange={handleChange}
                >
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Visita</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    name="nextVisit"
                    type="datetime-local"
                    className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-700 outline-none"
                    value={localProp.nextVisit || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto del Agente</label>
               <input 
                 name="contactName"
                 className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none"
                 placeholder="Nombre del Agente"
                 value={localProp.contactName || ''}
                 onChange={handleChange}
               />
               <input 
                 name="contactPhone"
                 className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none"
                 placeholder="WhatsApp / Tel"
                 value={localProp.contactPhone || ''}
                 onChange={handleChange}
               />
               <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                 <Phone className="w-5 h-5" /> Llamar ahora
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Compartir</h3>
              <div className="grid grid-cols-1 gap-3">
                 <button onClick={copyLink} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                    <div className="flex items-center gap-3">
                      <Copy className="w-5 h-5" /> Copiar Link
                    </div>
                    {copyFeedback && <span className="text-[10px] text-indigo-600">¡COPIADO!</span>}
                 </button>
                 <button onClick={() => setShowShareModal(false)} className="mt-4 text-slate-400 font-bold py-2">Cerrar</button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">¿Eliminar propiedad?</h3>
              <p className="text-slate-500 mb-8 font-medium text-sm">Esta acción no se puede deshacer.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={onDelete} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-600">Eliminar</button>
                 <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

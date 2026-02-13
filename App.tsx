import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyStatus } from '../types';
import { 
  ArrowLeft, Heart, Share2, Trash2, ExternalLink, 
  MapPin, Star, MessageSquare, Phone, Calendar, 
  Zap, Check, Copy, Save
} from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  // Estado local para que Tamara escriba fluido
  const [localProp, setLocalProp] = useState<Property>(property);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Referencia para evitar el guardado automático al entrar a la pantalla
  const skipFirstRender = useRef(true);

  // Si cambiamos de propiedad, reseteamos el estado local
  useEffect(() => {
    setLocalProp(property);
    skipFirstRender.current = true;
  }, [property.id]);

  // DEBOUNCE: Solo guarda en Supabase 1 segundo después de dejar de escribir
  useEffect(() => {
    if (skipFirstRender.current) {
      skipFirstRender.current = false;
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(() => {
      onUpdate(localProp);
      setIsSaving(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [localProp, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalProp(prev => ({ ...prev, [name]: value }));
  };

  const toggleFavorite = () => {
    setLocalProp(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(localProp.url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header con Indicador de Guardado */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold group">
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Volver
          </button>
          
          {/* Nube de guardado (Feedback visual para Tamara) */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${isSaving ? 'text-amber-500 bg-amber-50 animate-pulse' : 'text-emerald-500 bg-emerald-50'}`}>
            <Save className="w-3 h-3" />
            {isSaving ? 'Guardando...' : 'Sincronizado'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleFavorite} className={`p-3 rounded-2xl transition-all ${localProp.isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-white text-slate-300 shadow-sm'}`}>
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-3 bg-white text-slate-300 rounded-2xl shadow-sm hover:text-indigo-600"><Share2 className="w-5 h-5" /></button>
          <div className="w-px h-8 bg-slate-200 mx-2" />
          <button onClick={() => setShowDeleteModal(true)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative overflow-hidden">
              <img src={localProp.thumbnail} className="w-full h-full object-cover" alt="Prop" />
              <div className="absolute top-6 left-6 bg-white/95 px-4 py-2 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest text-slate-700">
                {localProp.sourceName}
              </div>
            </div>

            <div className="p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex-1 space-y-2">
                  <input name="title" className="w-full text-4xl font-black text-slate-900 border-none p-0 focus:ring-0 outline-none bg-transparent" value={localProp.title} onChange={handleChange} />
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <input name="address" className="w-full border-none p-0 focus:ring-0 outline-none text-lg bg-transparent" value={localProp.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-[2rem]">
                  <input name="price" className="text-3xl font-black text-indigo-600 border-none p-0 focus:ring-0 outline-none text-right bg-transparent w-40" value={localProp.price} onChange={handleChange} />
                </div>
              </div>

              {/* Valoración */}
              <div className="flex items-center gap-6 py-6 border-y border-slate-50 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tu Valoración</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} onClick={() => setLocalProp(p => ({...p, rating: star}))} className={`w-5 h-5 cursor-pointer ${star <= (localProp.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <a href={localProp.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">Link Original <ExternalLink className="w-4 h-4" /></a>
              </div>

              {/* TEXTAREA DE NOTAS (El que fallaba) */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <MessageSquare className="w-3 h-3" /> Notas y Observaciones
                </label>
                <textarea 
                  name="comments"
                  rows={6}
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-lg"
                  placeholder="Escribe tus notas aquí..."
                  value={localProp.comments || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Estrategia de Visita (Tu diseño favorito) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-black">Estrategia de Visita</h3>
              </div>
              <p className="text-slate-400 mb-8 font-medium">Puntos clave para revisar en este departamento.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Presión de agua y cañerías', 'Estado de aberturas', 'Humedad en techos', 'Ruido del entorno'].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-sm font-bold">
                    <Check className="w-5 h-5 text-indigo-400 shrink-0" /> {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar de Gestión */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 sticky top-24">
            <h3 className="font-black text-slate-900 text-xl">Gestión</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                <select name="status" className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none cursor-pointer" value={localProp.status} onChange={handleChange}>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Visita</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input name="nextVisit" type="datetime-local" className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-700 outline-none" value={localProp.nextVisit || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</label>
               <input name="contactName" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none" placeholder="Nombre" value={localProp.contactName || ''} onChange={handleChange} />
               <input name="contactPhone" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none" placeholder="Teléfono" value={localProp.contactPhone || ''} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center animate-in zoom-in-95">
              <h3 className="text-2xl font-black mb-6">Compartir</h3>
              <button onClick={copyLink} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold">
                <div className="flex items-center gap-3"><Copy className="w-5 h-5" /> Copiar Link</div>
                {copyFeedback && <span className="text-[10px] text-indigo-600 animate-pulse">¡COPIADO!</span>}
              </button>
              <button onClick={() => setShowShareModal(false)} className="mt-4 text-slate-400 font-bold">Cerrar</button>
           </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-8 h-8" /></div>
              <h3 className="text-xl font-black mb-6">¿Eliminar propiedad?</h3>
              <button onClick={onDelete} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200">Eliminar</button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-slate-400 font-bold">Cancelar</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

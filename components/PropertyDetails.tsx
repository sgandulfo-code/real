import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyStatus } from '../types';
import { 
  ArrowLeft, Heart, Share2, Trash2, ExternalLink, 
  MapPin, Star, MessageSquare, Phone, Calendar, 
  Zap, Check, Copy, Save, Building2, Home, Landmark, Ruler
} from 'lucide-react';

interface Props {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  // 1. Estado local para edición fluida
  const [localProp, setLocalProp] = useState<Property>(property);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const isFirstRender = useRef(true);

  // Sincronizar al cambiar de propiedad
  useEffect(() => {
    setLocalProp(property);
    isFirstRender.current = true;
  }, [property.id]);

  // 2. Lógica de Guardado (Debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
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

  // Cálculo de valor por M2 (Ponderado: 100% Cubierto + 50% Descubierto)
  const calculatePricePerM2 = () => {
    const priceClean = parseFloat(localProp.price?.toString().replace(/[^0-9]/g, '') || '0');
    const covered = Number(localProp.m2Covered || 0);
    const uncovered = Number(localProp.m2Uncovered || 0) * 0.5;
    const totalM2Ponderado = covered + uncovered;

    if (priceClean > 0 && totalM2Ponderado > 0) {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        maximumFractionDigits: 0 
      }).format(priceClean / totalM2Ponderado);
    }
    return '—';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Superior */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-bold group">
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Volver a la lista
          </button>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${isSaving ? 'text-amber-500 bg-amber-50 animate-pulse' : 'text-emerald-500 bg-emerald-50'}`}>
            <Save className="w-3 h-3" />
            {isSaving ? 'Guardando...' : 'Sincronizado'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLocalProp(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
            className={`p-3 rounded-2xl transition-all ${localProp.isFavorite ? 'bg-pink-50 text-pink-500 shadow-inner' : 'bg-white text-slate-300 hover:text-pink-400 shadow-sm'}`}
          >
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-3 bg-white text-slate-300 hover:text-indigo-600 rounded-2xl shadow-sm transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2" />
          <button onClick={() => setShowDeleteModal(true)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            
            {/* Imagen y Badges de Operación */}
            <div className="aspect-video relative group">
              <img src={localProp.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property" />
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{localProp.sourceName}</span>
                </div>
                <div className={`px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest text-white ${localProp.operationType === 'Alquiler' ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                  {localProp.operationType || 'Venta'}
                </div>
              </div>
            </div>

            <div className="p-10">
              {/* NIVELES SUPERIORES (Selectores) */}
              <div className="flex flex-wrap gap-3 mb-8">
                <select 
                  name="operationType" 
                  value={localProp.operationType || 'Venta'} 
                  onChange={handleChange}
                  className="bg-slate-100 border-none rounded-2xl px-4 py-2.5 font-bold text-slate-700 text-xs uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Venta">💰 En Venta</option>
                  <option value="Alquiler">🔑 En Alquiler</option>
                </select>

                <select 
                  name="propertyType" 
                  value={localProp.propertyType || 'Departamento'} 
                  onChange={handleChange}
                  className="bg-slate-100 border-none rounded-2xl px-4 py-2.5 font-bold text-slate-700 text-xs uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Departamento">🏢 Departamento</option>
                  <option value="Casa">🏠 Casa</option>
                  <option value="PH">🏘️ PH</option>
                  <option value="Terreno">🌱 Terreno</option>
                </select>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 text-xs font-bold text-slate-600">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Piso/Dto</span>
                  <input 
                    name="floorNumber" 
                    placeholder="—"
                    className="bg-transparent border-none p-0 w-12 focus:ring-0 text-center font-black"
                    value={localProp.floorNumber || ''} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Título y Dirección */}
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

              {/* FICHA TÉCNICA (M2 y Valoración m2) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-slate-50 mb-8">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">M2 Cubiertos</label>
                  <input type="number" name="m2Covered" className="text-xl font-black text-slate-700 border-none p-0 focus:ring-0 outline-none bg-transparent w-full" value={localProp.m2Covered || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">M2 Descub.</label>
                  <input type="number" name="m2Uncovered" className="text-xl font-black text-slate-700 border-none p-0 focus:ring-0 outline-none bg-transparent w-full" value={localProp.m2Uncovered || ''} onChange={handleChange} />
                </div>
                <div className="col-span-2 bg-slate-900 p-4 rounded-3xl flex flex-col justify-center items-center shadow-lg">
                  <label className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">USD / M2 (Ponderado)</label>
                  <div className="text-2xl font-black text-white">{calculatePricePerM2()}</div>
                </div>
              </div>

              {/* Valoración y Link */}
              <div className="flex items-center gap-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tu Valoración</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} onClick={() => setLocalProp(p => ({...p, rating: star}))} className={`w-5 h-5 cursor-pointer transition-colors ${star <= (localProp.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-100" />
                <a href={localProp.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 font-bold hover:underline">
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
                  placeholder="Escribe aquí lo que te pareció..."
                  value={localProp.comments || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Estrategia de Visita */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-black">Estrategia de Visita</h3>
              </div>
              <p className="text-slate-400 mb-8 font-medium">Puntos clave para revisar según el tipo de propiedad.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Presión de agua', 'Humedad en techos', 'Ruido ambiente', 'Luz natural'].map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span className="font-bold text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Gestión */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 sticky top-24">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">Gestión</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                <select name="status" className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none" value={localProp.status} onChange={handleChange}>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Visita</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input name="nextVisit" type="datetime-local" className="w-full bg-slate-100 border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-slate-700 outline-none text-sm" value={localProp.nextVisit || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expensas Mensuales</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input name="expenses" type="number" className="w-full bg-slate-100 border-none rounded-2xl pl-8 pr-5 py-4 font-bold text-slate-700 outline-none" placeholder="0" value={localProp.expenses || ''} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Contacto</label>
               <input name="contactName" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none text-sm" placeholder="Nombre" value={localProp.contactName || ''} onChange={handleChange} />
               <input name="contactPhone" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none text-sm" placeholder="Teléfono" value={localProp.contactPhone || ''} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center animate-in zoom-in-95">
              <h3 className="text-2xl font-black mb-6">Compartir</h3>
              <button onClick={() => { navigator.clipboard.writeText(localProp.url); setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000); }} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold transition-all hover:bg-slate-100">
                <div className="flex items-center gap-3"><Copy className="w-5 h-5" /> Copiar Link</div>
                {copyFeedback && <span className="text-[10px] text-indigo-600 animate-pulse font-black uppercase">¡Copiado!</span>}
              </button>
              <button onClick={() => setShowShareModal(false)} className="mt-6 text-slate-400 font-bold hover:text-slate-600">Cerrar</button>
           </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-in zoom-in-95 shadow-2xl">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-8 h-8" /></div>
              <h3 className="text-xl font-black mb-2 text-slate-900">¿Eliminar propiedad?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta acción quitará la propiedad de tu grupo de búsqueda permanentemente.</p>
              <div className="flex flex-col gap-3">
                <button onClick={onDelete} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Sí, eliminar</button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

import React, { useState, useEffect } from 'react';
import { Loader2, Check, Edit3, X, Link as LinkIcon, ExternalLink, Bed, Bath, Maximize } from 'lucide-react';

const PropertyVerifier = ({ url, onCancel, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    bedrooms: 0,
    bathrooms: 1,
    sqft: 0,
    sourceName: '',
    thumbnail: '',
    url: url
  });

  useEffect(() => {
    const analyzeWithIA = async () => {
      setLoading(true);
      try {
        // Aquí simulamos la extracción (Luego conectarás tu API de Gemini)
        const domain = new URL(url).hostname.replace('www.', '');
        const aiResponse = {
          title: "Cargando título...",
          price: "USD --",
          address: "Detectando dirección...",
          bedrooms: 1,
          bathrooms: 1,
          sqft: 0,
          sourceName: domain,
          thumbnail: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=500`, // Imagen base mientras carga
          url: url
        };
        
        await new Promise(res => setTimeout(res, 1200));
        setFormData(aiResponse);
      } catch (e) {
        console.error("Error analizando URL", e);
      } finally {
        setLoading(false);
      }
    };
    analyzeWithIA();
  }, [url]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/20">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">IA Analizando Link</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium truncate px-4">{url}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
        
        {/* Header con el Link de Referencia */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-indigo-50 p-2 rounded-xl">
              <LinkIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-black text-slate-900 leading-none mb-1">Verificar Propiedad</h3>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] text-indigo-500 font-bold flex items-center gap-1 hover:underline truncate"
              >
                Abrir fuente original <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* VISTA PREVIA (Referencia Visual) */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-inner group relative">
                <img src={formData.thumbnail} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-slate-700 shadow-sm border border-white/20">
                  PREVIEW IA
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Título Propuesto</label>
                <div className="relative">
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  <Edit3 className="absolute right-3 top-3.5 w-4 h-4 text-slate-300" />
                </div>
              </div>
            </div>

            {/* FORMULARIO TÉCNICO */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Dirección</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:border-indigo-500 transition-all"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Precio</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Superficie</label>
                  <div className="relative">
                    <input 
                      type="number"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all"
                      value={formData.sqft}
                      onChange={(e) => setFormData({...formData, sqft: parseInt(e.target.value) || 0})}
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-300 underline decoration-indigo-200">m²</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Dormitorios</label>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Bed className="w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      className="bg-transparent w-full font-bold text-slate-700 outline-none" 
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Baños</label>
                   <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Bath className="w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      className="bg-transparent w-full font-bold text-slate-700 outline-none" 
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button 
              onClick={() => onConfirm(formData)}
              className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> CONFIRMAR Y GUARDAR
            </button>
            <button 
              onClick={onCancel}
              className="px-8 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              DESCARTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerifier;

import React, { useState, useEffect } from 'react';
import { Loader2, Check, X, Bed, Bath, Maximize, Globe, AlertCircle } from 'lucide-react';

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
        // Simulación de extracción de IA
        await new Promise(res => setTimeout(res, 1500));
        setFormData({
          title: "Departamento sugerido",
          price: "Consultar",
          address: "Cargando dirección...",
          bedrooms: 2,
          bathrooms: 1,
          sqft: 60,
          sourceName: new URL(url).hostname.replace('www.', ''),
          thumbnail: '',
          url: url
        });
      } finally {
        setLoading(false);
      }
    };
    analyzeWithIA();
  }, [url]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Analizando fuente original...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col md:flex-row animate-in slide-in-from-bottom-4 duration-500">
      
      {/* LADO IZQUIERDO: EL PORTAL REAL (IFRAME) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-100 border-r border-slate-200 relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Vista en Vivo</span>
        </div>
        
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Property Preview"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
        
        {/* Aviso por si el portal bloquea el iframe */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
          <AlertCircle className="w-10 h-10 text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm font-medium">
            Si el portal bloquea la vista previa, puedes verificarlo en la pestaña original.
          </p>
        </div>
      </div>

      {/* LADO DERECHO: EDITOR DE DATOS */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-white flex flex-col">
        {/* Header del Editor */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none">Verificar Datos</h2>
            <p className="text-slate-400 text-xs mt-1 font-medium">Corrobora la información extraída por la IA</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-8 space-y-8 max-w-xl mx-auto w-full">
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Título de Propiedad</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-indigo-500 outline-none transition-all text-lg shadow-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Dirección Exacta</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none focus:border-indigo-500 transition-all shadow-sm"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Precio Final</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all shadow-sm"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Superficie (m²)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all shadow-sm"
                  value={formData.sqft}
                  onChange={(e) => setFormData({...formData, sqft: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Dormitorios</label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <Bed className="w-5 h-5 text-indigo-500" />
                  <input 
                    type="number" 
                    className="bg-transparent w-full font-black text-slate-700 outline-none text-xl" 
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Baños</label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <Bath className="w-5 h-5 text-indigo-500" />
                  <input 
                    type="number" 
                    className="bg-transparent w-full font-black text-slate-700 outline-none text-xl" 
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-3">
            <button 
              onClick={() => onConfirm(formData)}
              className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <Check className="w-6 h-6" /> Guardar en el Proyecto
            </button>
            <button 
              onClick={onCancel}
              className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
            >
              Descartar Análisis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVerifier;

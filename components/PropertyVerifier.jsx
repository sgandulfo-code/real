import React, { useState, useEffect } from 'react';
import { Loader2, Check, Edit3, X, Home, Bed, Bath, Maximize } from 'lucide-react';

const PropertyVerifier = ({ url, onCancel, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    sourceName: '',
    thumbnail: ''
  });

  useEffect(() => {
    const analyzeWithIA = async () => {
      setLoading(true);
      try {
        // Aquí simulamos que la IA extrae TODO
        const aiResponse = {
          title: "Departamento en Palermo",
          price: "USD 150.000",
          address: "Av. Santa Fe 2500",
          bedrooms: 2,
          bathrooms: 1,
          sqft: 65,
          sourceName: new URL(url).hostname.replace('www.', ''),
          thumbnail: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500`
        };
        
        await new Promise(res => setTimeout(res, 1500));
        setFormData(aiResponse);
      } catch (e) {
        onCancel();
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
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">IA Analizando...</h3>
          <p className="text-slate-500 text-sm mt-2">Estamos leyendo el link para ahorrarte trabajo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirmar Propiedad</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Imagen y Título */}
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
              <img src={formData.thumbnail} className="w-full h-full object-cover" alt="Preview" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Título</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
          </div>

          {/* Columna Derecha: Datos Técnicos */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Dirección</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-medium text-slate-600 focus:border-indigo-500 outline-none transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Precio</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-bold text-indigo-600 focus:border-indigo-500 outline-none transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Sup. (m²)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                  value={formData.sqft}
                  onChange={(e) => setFormData({...formData, sqft: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Bed className="w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  className="bg-transparent w-full font-bold text-slate-700 outline-none" 
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Bath className="w-5 h-5 text-slate-400" />
                <input 
                  type="number" 
                  className="bg-transparent w-full font-bold text-slate-700 outline-none" 
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onConfirm(formData)}
          className="w-full mt-8 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> CONFIRMAR Y GUARDAR
        </button>
      </div>
    </div>
  );
};

export default PropertyVerifier;

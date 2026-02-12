import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Check, Edit3, Link as LinkIcon } from 'lucide-react';

const PropertyVerifier = ({ onPropertyAdded, groupId }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedData, setSuggestedData] = useState(null);
  const [editableTitle, setEditableTitle] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      // Simulación de la respuesta de la IA (Aquí irá tu llamada a Gemini)
      // En una implementación real, aquí haces el fetch a tu endpoint de IA
      const mockData = {
        title: "Propiedad Sugerida por IA",
        price: "Consultar",
        location: "Ubicación detectada",
        thumbnail: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=500",
        lat: -34.6037,
        lng: -58.3816,
        description: "Análisis automático realizado con éxito."
      };

      // Simulamos un pequeño delay de la IA
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuggestedData(mockData);
      setEditableTitle(mockData.title);
    } catch (error) {
      console.error("Error verificando:", error);
      alert("No se pudo extraer la información del link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!groupId) {
      alert("Error: No hay un grupo de búsqueda seleccionado.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .insert([
          { 
            ...suggestedData, 
            title: editableTitle, 
            group_id: groupId,
            updated_at: new Date()
          }
        ]);

      if (error) throw error;

      alert("¡Propiedad guardada con éxito!");
      setSuggestedData(null);
      setUrl('');
      if (onPropertyAdded) onPropertyAdded();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8 animate-in fade-in duration-500">
      {!suggestedData ? (
        <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
            <input
              type="url"
              placeholder="Pega el link de la propiedad (Zillow, Idealista, etc.)"
              className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analizar Link'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
              <img 
                src={suggestedData.thumbnail} 
                className="w-full h-full object-cover" 
                alt="Preview"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
                  Confirmar o Editar Título
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-2 border-indigo-50 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-indigo-200 outline-none transition-all pr-10"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                  />
                  <Edit3 className="absolute right-3 top-3.5 w-4 h-4 text-slate-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Precio</p>
                  <p className="font-bold text-indigo-600">{suggestedData.price}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Ubicación</p>
                  <p className="font-bold text-slate-700 truncate">{suggestedData.location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Guardar en Proyecto</>}
            </button>
            <button
              onClick={() => setSuggestedData(null)}
              className="px-6 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// EXPORTACIÓN POR DEFECTO REQUERIDA POR APP.TSX
export default PropertyVerifier;

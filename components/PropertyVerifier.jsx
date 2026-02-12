import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Check, Edit3 } from 'lucide-react';

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
      // 1. Aquí llamamos a tu API de Gemini (o el proceso que ya tienes)
      // Simulamos la respuesta de la IA
      const response = await fetch('/api/verify-property', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      const data = await response.json();

      // 2. Cargamos los datos para validación
      setSuggestedData(data);
      setEditableTitle(data.title); // Seteamos el título propuesto en el estado editable
    } catch (error) {
      console.error("Error verificando:", error);
      alert("No se pudo extraer la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 3. Guardamos en Supabase usando el título editado
      const { data, error } = await supabase
        .from('properties')
        .insert([
          { 
            ...suggestedData, 
            title: editableTitle, // Usamos lo que el usuario escribió
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
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
      {!suggestedData ? (
        <form onSubmit={handleVerify} className="flex gap-4">
          <input
            type="url"
            placeholder="Pega el link de la propiedad aquí..."
            className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-8 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Analizar'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col md:flex-row gap-6">
            <img 
              src={suggestedData.thumbnail} 
              className="w-full md:w-48 h-32 object-cover rounded-2xl" 
              alt="Preview"
            />
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                  Título Sugerido por IA (Puedes editarlo)
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio</p>
                  <p className="font-bold text-indigo-600 text-lg">{suggestedData.price}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ubicación</p>
                  <p className="font-bold text-slate-700">{suggestedData.location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" /> Confirmar y Guardar
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

export default PropertyVerifier;

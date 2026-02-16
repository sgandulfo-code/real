import React, { useState } from 'react';
import { Search, Plus, Loader2, Link as LinkIcon, AlertCircle, LayoutGrid } from 'lucide-react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyVerifier from './PropertyVerifier';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

interface DashboardProps {
  groupName: string;
  activeGroupId: string;
  properties: Property[];
  onSelect: (id: string) => void;
  onUpdateGroup: () => void;
}

export default function Dashboard({ groupName, activeGroupId, properties, onSelect, onUpdateGroup }: DashboardProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVerifier, setShowVerifier] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  // 1. Inicia el proceso de análisis abriendo el Verificador
  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setPendingUrl(url);
    setShowVerifier(true);
  };

  // 2. Función que se ejecuta cuando el usuario confirma los datos en el Verificador
  const handleConfirmSave = async (finalData: any) => {
    try {
      setIsAnalyzing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('properties').insert([{
        group_id: activeGroupId,
        user_id: session.user.id,
        url: finalData.url,
        title: finalData.title,
        price: finalData.price,
        address: finalData.address,
        m2_covered: finalData.sqft,
        bedrooms: finalData.bedrooms,
        bathrooms: finalData.bathrooms,
        source_name: finalData.sourceName,
        thumbnail: finalData.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800'
      }]);

      if (error) throw error;

      // Limpiar y refrescar
      setShowVerifier(false);
      setUrl('');
      onUpdateGroup(); // Para que App.tsx recargue los datos de Supabase
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo guardar la propiedad");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* CAPA 0: VERIFICADOR (MODAL OVERLAY) */}
      {showVerifier && (
        <PropertyVerifier 
          url={pendingUrl} 
          onCancel={() => setShowVerifier(false)} 
          onConfirm={handleConfirmSave} 
        />
      )}

      {/* SECCIÓN 1: CAPTURA DE URL */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <LayoutGrid size={120} />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Plus size={14} /> Nueva Propiedad
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">¿Qué propiedad analizamos hoy?</h3>
          
          <form onSubmit={handleStartAnalysis} className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
              <LinkIcon size={22} />
            </div>
            <input 
              type="url" 
              placeholder="Pega el link de Zonaprop, Argenprop, Remax..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-16 pr-44 py-6 bg-slate-50 border-2 border-transparent focus:border-indigo-600/10 focus:bg-white rounded-[2.5rem] outline-none font-bold text-slate-700 transition-all shadow-inner text-lg"
              required
            />
            <button 
              type="submit"
              disabled={isAnalyzing}
              className="absolute right-3 top-3 bottom-3 px-10 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:bg-slate-200 flex items-center gap-2 shadow-xl"
            >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : 'Analizar'}
            </button>
          </form>
          <p className="text-slate-400 text-xs font-medium">
            La IA detectará automáticamente precio, ambientes y ubicación.
          </p>
        </div>
      </section>

      {/* SECCIÓN 2: GRILLA DE RESULTADOS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
            Propiedades en {groupName}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => onSelect(property.id)} 
              />
            ))
          ) : (
            <div className="col-span-full py-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-slate-400 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                <AlertCircle size={32} className="opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">No hay propiedades guardadas</p>
              <p className="text-xs font-medium mt-2 opacity-60">Pega un link arriba para comenzar el análisis.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

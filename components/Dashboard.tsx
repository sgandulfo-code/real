import React, { useState } from 'react';
import { Search, Plus, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Property } from '../types';

interface DashboardProps {
  groupName: string;
  properties: Property[];
  onSelect: (id: string) => void;
  onUpdateGroup: () => void;
}

export default function Dashboard({ groupName, properties, onSelect }: DashboardProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    try {
      // Aquí llama a tu API que me pasaste arriba
      console.log("Analizando URL:", url);
      // ... lógica para guardar en Supabase después de analizar
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setUrl('');
    }
  };

  return (
    <div className="space-y-10">
      
      {/* SECCIÓN 1: EL CAMPO DE URL (Lo que te estaba faltando) */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Plus size={14} /> Nueva Captura
          </div>
          <h3 className="text-2xl font-black text-slate-900">Analizar nueva propiedad</h3>
          
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <LinkIcon size={20} />
            </div>
            <input 
              type="url" 
              placeholder="Pega el link de Zonaprop, Argenprop, Remax..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-14 pr-40 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600/10 focus:bg-white rounded-[2rem] outline-none font-bold text-slate-700 transition-all shadow-inner"
              required
            />
            <button 
              type="submit"
              disabled={isAnalyzing}
              className="absolute right-2 top-2 bottom-2 px-8 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all disabled:bg-slate-200 flex items-center gap-2 shadow-lg"
            >
              {isAnalyzing ? (
                <> <Loader2 size={18} className="animate-spin" /> Analizando... </>
              ) : (
                'Analizar'
              )}
            </button>
          </form>
          <p className="text-slate-400 text-xs font-medium italic">
            Nuestra IA extraerá precio, metros y ubicación automáticamente.
          </p>
        </div>
      </section>

      {/* SECCIÓN 2: LISTA DE PROPIEDADES YA ANALIZADAS */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div 
                key={property.id}
                onClick={() => onSelect(property.id)}
                className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={property.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    {property.sourceName}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-black text-slate-800 mb-1 line-clamp-1">{property.title}</h4>
                  <p className="text-slate-400 text-xs font-bold mb-4">{property.address}</p>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-lg font-black text-indigo-600">{property.price}</span>
                    <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md uppercase text-slate-500">
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={40} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No hay propiedades en este proyecto</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

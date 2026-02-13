import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '../types';
import { 
  ArrowLeft, Heart, Share2, Trash2, ExternalLink, 
  MapPin, Star, MessageSquare, Phone, Calendar, 
  Zap, Check, Copy, TrendingUp, Target
} from 'lucide-react';

interface Props {
  property: Property;
  allProperties: Property[]; // Nueva prop para calcular el score comparativo
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, allProperties, onUpdate, onBack, onDelete }) => {
  const [localProp, setLocalProp] = useState<Property>(property);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => { setLocalProp(property); }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...localProp, [name]: value };
    setLocalProp(updated);
    onUpdate(updated);
  };

  // --- LÓGICA DE SCORE (Punto 3) ---
  const calculateScore = () => {
    if (!localProp.sqft || allProperties.length === 0) return 0;
    
    // Extraer número del precio (ej: "$250.000" -> 250000)
    const getPriceNum = (p: string) => Number(p.replace(/[^0-9.-]+/g, ""));
    const currentPrice = getPriceNum(localProp.price);
    const currentRatio = currentPrice / localProp.sqft;

    // Calcular promedio del mercado local (tus otras propiedades)
    const allRatios = allProperties
      .filter(p => p.sqft > 0)
      .map(p => getPriceNum(p.price) / p.sqft);
    
    const avgRatio = allRatios.reduce((a, b) => a + b, 0) / allRatios.length;

    // Score base 70. Si es más barato que el promedio, sube. Si es más caro, baja.
    let score = 75 * (avgRatio / currentRatio);
    if (localProp.isFavorite) score += 10;
    if (localProp.rating) score += (localProp.rating * 3);
    
    return Math.min(Math.round(score), 100);
  };

  const score = calculateScore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header simplificado */}
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold group transition-all">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setLocalProp({...localProp, isFavorite: !localProp.isFavorite})} className={`p-3 rounded-2xl ${localProp.isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-white text-slate-300'}`}>
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-3 bg-white text-slate-300 hover:text-indigo-600 rounded-2xl shadow-sm"><Share2 className="w-5 h-5" /></button>
          <button onClick={onDelete} className="p-3 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tarjeta Principal */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative">
              <img src={localProp.thumbnail} className="w-full h-full object-cover" alt="Property" />
              {/* --- COMPONENTE DE SCORE (Punto 3) --- */}
              <div className="absolute bottom-6 right-6">
                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${score > 70 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {score}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PropTrack Score</p>
                    <p className="text-white font-bold text-xs">{score > 70 ? 'Gran Oportunidad' : 'Precio de Mercado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div className="flex-1 space-y-2">
                  <input name="title" className="w-full text-4xl font-black text-slate-900 border-none p-0 outline-none" value={localProp.title} onChange={handleChange} />
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <input name="address" className="w-full border-none p-0 outline-none bg-transparent" value={localProp.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-[2rem] h-fit">
                  <input name="price" className="text-3xl font-black text-indigo-600 border-none p-0 outline-none bg-transparent w-40 text-right" value={localProp.price} onChange={handleChange} />
                </div>
              </div>

              {/* --- MAPA DINÁMICO (Punto 1) --- */}
              <div className="w-full h-64 rounded-[2rem] overflow-hidden border-4 border-slate-50 mb-8 grayscale hover:grayscale-0 transition-all duration-700 shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=TU_API_KEY_AQUI&q=${encodeURIComponent(localProp.address || localProp.title)}`}
                  // Nota: Si no tienes API Key, usa este modo gratuito de búsqueda:
                  // src={`https://maps.google.com/maps?q=${encodeURIComponent(localProp.address || localProp.title)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking

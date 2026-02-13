import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '../types';
import { 
  ArrowLeft, Heart, Share2, Trash2, ExternalLink, 
  MapPin, MessageSquare, Phone, Calendar, 
  Zap, Target, TrendingUp 
} from 'lucide-react';

interface Props {
  property: Property;
  allProperties: Property[];
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, allProperties, onUpdate, onBack, onDelete }) => {
  const [localProp, setLocalProp] = useState<Property>(property);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => { setLocalProp(property); }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...localProp, [name]: value };
    setLocalProp(updated);
    onUpdate(updated);
  };

  // Lógica de Score comparativo
  const calculateScore = () => {
    if (!localProp.sqft || allProperties.length === 0) return 0;
    const getPriceNum = (p: string) => Number(p.replace(/[^0-9.-]+/g, ""));
    const currentPrice = getPriceNum(localProp.price);
    const currentRatio = currentPrice / localProp.sqft;

    const allRatios = allProperties
      .filter(p => p.sqft > 0)
      .map(p => getPriceNum(p.price) / p.sqft);
    
    const avgRatio = allRatios.length > 0 ? allRatios.reduce((a, b) => a + b, 0) / allRatios.length : currentRatio;

    let score = 75 * (avgRatio / currentRatio);
    if (localProp.isFavorite) score += 10;
    return Math.min(Math.round(score), 100);
  };

  const score = calculateScore();
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(localProp.address || localProp.title)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between bg-white/50 p-4 rounded-3xl backdrop-blur-sm border border-white shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold group transition-all">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Volver
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdate({...localProp, isFavorite: !localProp.isFavorite})} className={`p-3 rounded-2xl ${localProp.isFavorite ? 'bg-pink-50 text-pink-500' : 'bg-white text-slate-300 shadow-sm'}`}>
            <Heart className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button onClick={() => setShowShareModal(true)} className="p-3 bg-white text-slate-300 hover:text-indigo-600 rounded-2xl shadow-sm transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-3 text-slate-300 hover:text-red-500 transition-all">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative">
              <img src={localProp.thumbnail} className="w-full h-full object-cover" alt="Property" />
              <div className="absolute bottom-6 right-6">
                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-4 text-white">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {score}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">PropTrack Score</p>
                    <p className="font-bold text-xs">{score > 70 ? 'Oportunidad' : 'Precio Mercado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                <div className="flex-1 space-y-2">
                  <input name="title" className="w-full text-4xl font-black text-slate-900 border-none p-0 outline-none bg-transparent" value={localProp.title} onChange={handleChange} />
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <input name="address" className="w-full border-none p-0 outline-none bg-transparent" value={localProp.address} onChange={handleChange} />
                  </div>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-[2rem] h-fit">
                  <input name="price" className="text-3xl font-black text-indigo-600 border-none p-0 outline-none bg-transparent w-44 text-right" value={localProp.price} onChange={handleChange} />
                </div>
              </div>

              {/* MAPA GRATUITO */}
              <div className="w-full h-72 rounded-[2rem] overflow-hidden border-4 border-slate-50 mb-8 shadow-inner">
                <iframe width="100%" height="100%" style={{ border: 0 }} src={mapUrl}></iframe>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                   <MessageSquare className="w-3 h-3" /> Notas y Observaciones
                </label>
                <textarea name="comments" rows={4} className="w-full bg-slate-50 border-none rounded-3xl p-6 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={localProp.comments || ''} onChange={handleChange} placeholder="¿Qué te pareció la propiedad?" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <h3 className="font-black text-slate-900 text-xl flex items-center gap-2"><Target className="w-5 h-5 text-indigo-600" /> Gestión</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado</label>
                <select name="status" className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none" value={localProp.status} onChange={handleChange}>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contacto Agente</label>
                <input name="contactPhone" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none" placeholder="WhatsApp / Tel" value={localProp.contactPhone || ''} onChange={handleChange} />
                <button className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

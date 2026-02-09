
import React, { useState, useEffect, useRef } from 'react';
import { Property, PropertyStatus } from '../types';
import StatusBadge from './StatusBadge';
import Rating from './Rating';
import MapView from './MapView';
import { suggestViewingQuestions, geocodeAddress } from '../services/geminiService';

interface Props {
  property: Property;
  onUpdate: (property: Property) => void;
  onBack: () => void;
  onDelete: () => void;
}

const PropertyDetails: React.FC<Props> = ({ property, onUpdate, onBack, onDelete }) => {
  const [localProp, setLocalProp] = useState<Property>(property);
  const [smartQuestions, setSmartQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      const questions = await suggestViewingQuestions(property.title, property.price);
      setSmartQuestions(questions);
      setLoadingQuestions(false);
    };
    fetchQuestions();
  }, [property.title, property.price]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...localProp, [name]: value };
    setLocalProp(updated);
    onUpdate(updated);

    if (name === 'address') {
      if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
      geocodeTimeout.current = setTimeout(async () => {
        const coords = await geocodeAddress(value);
        if (coords) {
          const withCoords = { ...updated, lat: coords.lat, lng: coords.lng };
          setLocalProp(withCoords);
          onUpdate(withCoords);
        }
      }, 1500);
    }
  };

  const handleRatingChange = (val: number) => {
    const updated = { ...localProp, rating: val };
    setLocalProp(updated);
    onUpdate(updated);
  };

  const toggleFavorite = () => {
    const updated = { ...localProp, isFavorite: !localProp.isFavorite };
    setLocalProp(updated);
    onUpdate(updated);
  };

  const openWhatsApp = () => {
    if (!localProp.contactPhone) return;
    const cleanPhone = localProp.contactPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const makeCall = () => {
    if (!localProp.contactPhone) return;
    window.location.href = `tel:${localProp.contactPhone}`;
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this property: ${localProp.title}`);
    const body = encodeURIComponent(`I found this property on PropTrack AI:\n\n${localProp.title}\nPrice: ${localProp.price}\nLink: ${localProp.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out this property: ${localProp.title} (${localProp.price})\n${localProp.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(localProp.url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to List
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-all duration-300 ${localProp.isFavorite ? 'bg-pink-50 text-pink-500 ring-1 ring-pink-100' : 'bg-slate-100 text-slate-400 hover:text-pink-400'}`}
              title={localProp.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg 
                className={`w-5 h-5 ${localProp.isFavorite ? 'fill-current' : 'fill-none'}`} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              title="Share property"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Core Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="aspect-video relative">
                <img src={localProp.thumbnail} className="w-full h-full object-cover" alt="Property" />
                <div className="absolute top-4 left-4 flex gap-2">
                   <div className="bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                      <img src={localProp.favicon} className="w-4 h-4" alt="Source" />
                      <span className="text-xs font-bold text-slate-700">{localProp.sourceName}</span>
                   </div>
                   <StatusBadge status={localProp.status} />
                </div>
              </div>
              <div className="p-8">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div className="flex-1">
                        <input 
                            name="title" 
                            className="w-full text-3xl font-extrabold text-slate-900 border-none p-0 focus:ring-0 outline-none placeholder:text-slate-300"
                            value={localProp.title}
                            onChange={handleChange}
                            placeholder="Add property title..."
                        />
                        <input 
                            name="address" 
                            className="w-full text-slate-500 mt-1 border-none p-0 focus:ring-0 outline-none text-lg mb-4"
                            value={localProp.address}
                            onChange={handleChange}
                            placeholder="Property address..."
                        />
                        
                        <div className="mt-2 mb-2">
                           <MapView lat={localProp.lat} lng={localProp.lng} address={localProp.address} />
                        </div>
                    </div>
                    <div className="text-right">
                        <input 
                            name="price" 
                            className="text-3xl font-black text-indigo-600 border-none p-0 focus:ring-0 outline-none text-right"
                            value={localProp.price}
                            onChange={handleChange}
                            placeholder="Price..."
                        />
                    </div>
                 </div>

                 <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-6">
                    <div className="flex-1">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">External Link</label>
                       <div className="flex items-center gap-2">
                          <input 
                            name="url"
                            className="flex-1 bg-slate-50 px-3 py-1.5 rounded text-sm text-indigo-600 hover:underline truncate border-none outline-none focus:ring-1 focus:ring-indigo-100"
                            value={localProp.url}
                            onChange={handleChange}
                          />
                          <button onClick={() => window.open(localProp.url, '_blank')} className="p-1.5 text-slate-400 hover:text-indigo-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </button>
                       </div>
                    </div>
                    <div className="px-4 border-l border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Rating</label>
                        <Rating value={localProp.rating} interactive onChange={handleRatingChange} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Personal Comments & Observations</label>
                       <textarea 
                          name="comments"
                          rows={4}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300"
                          placeholder="What did you like? Any noise? Neighborhood vibe? Renovation needs?"
                          value={localProp.comments}
                          onChange={handleChange}
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* AI Smart Suggestions */}
           <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-white/20 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                 </div>
                 <h3 className="text-xl font-bold">Visit Strategy (AI Generated)</h3>
              </div>
              <p className="text-indigo-100 text-sm mb-6 opacity-90 leading-relaxed">
                 Gemini analyzed the property details and suggests you ask these specific questions during your viewing:
              </p>
              <div className="space-y-3">
                 {loadingQuestions ? (
                    <div className="animate-pulse space-y-2">
                       <div className="h-10 bg-white/10 rounded-xl w-full"></div>
                       <div className="h-10 bg-white/10 rounded-xl w-3/4"></div>
                    </div>
                 ) : (
                    smartQuestions.map((q, i) => (
                       <div key={i} className="flex gap-4 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-default border border-white/5">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white text-indigo-700 rounded-full text-xs font-bold">{i+1}</span>
                          <p className="text-sm font-medium">{q}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Right Column - Management & Contact */}
        <div className="space-y-6">
           {/* Management Form Card */}
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                 Manage Prospect
              </h3>

              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Process Status</label>
                    <select 
                        name="status"
                        className="w-full bg-slate-100 border-none rounded-xl px-4 py-2.5 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={localProp.status}
                        onChange={handleChange}
                    >
                        {Object.values(PropertyStatus).map(s => (
                           <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Viewing Appointment</label>
                    <input 
                        name="nextVisit"
                        type="datetime-local"
                        className="w-full bg-slate-100 border-none rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={localProp.nextVisit || ''}
                        onChange={handleChange}
                    />
                 </div>
              </div>
           </div>

           {/* DEDICATED CONTACT SECTION */}
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                 Agent / Contact Info
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Contact Name</label>
                    <input 
                        name="contactName"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none"
                        placeholder="Real Estate Agent Name"
                        value={localProp.contactName}
                        onChange={handleChange}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Phone Number</label>
                    <input 
                        name="contactPhone"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none mb-3"
                        placeholder="Enter phone..."
                        value={localProp.contactPhone}
                        onChange={handleChange}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                           onClick={openWhatsApp}
                           disabled={!localProp.contactPhone}
                           className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl hover:bg-emerald-600 disabled:bg-slate-200 transition-all font-bold text-xs shadow-lg shadow-emerald-50"
                       >
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 445.2c-33.1 0-65.4-8.9-93.7-25.7l-6.7-4-69.6 18.3 18.6-67.9-4.4-7c-18.4-29.3-28.1-63-28.1-97.6 0-101.9 82.9-184.8 184.8-184.8 49.4 0 95.8 19.2 130.8 54.1 35 34.9 54.2 81.2 54.2 130.7 0 101.9-82.9 184.8-184.8 184.8zm101.5-138.7c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.7-30.7-38.2-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                           WhatsApp
                       </button>
                       <button 
                           onClick={makeCall}
                           disabled={!localProp.contactPhone}
                           className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-xl hover:bg-indigo-100 disabled:bg-slate-100 disabled:text-slate-300 transition-all font-bold text-xs"
                       >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                           Call Now
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Tips */}
           <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
              <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                 Personal Tip
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                 Don't forget to take photos of the electrical panel and water pressure in the showers during the visit. Sellers often hide these details.
              </p>
           </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-900">Share Property</h3>
                 <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>
              </div>
              
              <div className="space-y-3">
                 <button 
                  onClick={shareViaWhatsApp}
                  className="w-full flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-colors group"
                 >
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 445.2c-33.1 0-65.4-8.9-93.7-25.7l-6.7-4-69.6 18.3 18.6-67.9-4.4-7c-18.4-29.3-28.1-63-28.1-97.6 0-101.9 82.9-184.8 184.8-184.8 49.4 0 95.8 19.2 130.8 54.1 35 34.9 54.2 81.2 54.2 130.7 0 101.9-82.9 184.8-184.8 184.8zm101.5-138.7c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.7-30.7-38.2-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-slate-900">WhatsApp</p>
                       <p className="text-xs text-slate-500 font-medium">Send to a contact</p>
                    </div>
                 </button>

                 <button 
                  onClick={shareViaEmail}
                  className="w-full flex items-center gap-4 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-colors"
                 >
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-slate-900">Email</p>
                       <p className="text-xs text-slate-500 font-medium">Share via mail</p>
                    </div>
                 </button>

                 <div className="pt-2">
                    <button 
                     onClick={copyLink}
                     className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                          </div>
                          <div className="text-left">
                             <p className="font-bold text-slate-900">Copy Link</p>
                             <p className="text-xs text-slate-500 font-medium">Copy to clipboard</p>
                          </div>
                       </div>
                       {copyFeedback && <span className="text-[10px] font-black text-indigo-600 uppercase">COPIED!</span>}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Delete Listing?</h3>
              <p className="text-slate-500 mb-8 text-sm font-medium">
                This action is irreversible. You will lose all visit notes and agent information for this property.
              </p>
              
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={onDelete}
                  className="w-full bg-red-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
                 >
                    Delete Property
                 </button>
                 <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                 >
                    Keep Property
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;

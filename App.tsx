import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, Filter } from 'lucide-react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: g } = await supabase.from('search_groups').select('*').order('created_at', { ascending: false });
      const { data: p } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (p && g) {
        const props: Property[] = p.map(x => ({
          id: x.id, searchGroupId: x.group_id, url: x.url, title: x.title || 'Propiedad',
          price: x.price || 'Consultar', address: x.address || '', lat: x.lat || -34.6, lng: x.lng || -58.3,
          sourceName: x.source_name || 'Inmobiliaria', status: x.status || PropertyStatus.INTERESTED,
          thumbnail: x.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
          favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(x.url).hostname}`,
          m2Covered: x.m2_covered || 0, isFavorite: x.is_favorite || false, createdAt: new Date(x.created_at).getTime(),
          rating: x.rating || 0, bedrooms: x.bedrooms || 0, bathrooms: x.bathrooms || 0, sqft: x.m2_covered || 0, comments: x.comments || ''
        }));
        setAllProperties(props);
        setSearchGroups(g.map(group => ({ ...group, propertyCount: props.filter(pr => pr.searchGroupId === group.id).length })));
        if (g.length > 0 && !activeGroupId) setActiveGroupId(g[0].id);
      }
    } finally { setLoading(false); }
  };

  const handleUpdate = async (upd: Property) => {
    setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
    await supabase.from('properties').update({ 
      group_id: upd.searchGroupId, title: upd.title, price: upd.price, status: upd.status, 
      is_favorite: upd.isFavorite, m2_covered: upd.m2Covered, comments: upd.comments 
    }).eq('id', upd.id);
  };

  const activeGroup = useMemo(() => searchGroups.find(g => g.id === activeGroupId), [searchGroups, activeGroupId]);

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <h2 className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">PropTrack AI</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* NAVEGACIÓN */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-[1.2rem] text-white shadow-xl shadow-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter block leading-none">PropTrack AI</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tamara Edition</span>
            </div>
          </div>
          
          <SearchGroupsList 
            groups={searchGroups} 
            activeGroupId={activeGroupId} 
            onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} 
          />
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-[1600px] mx-auto">
        {selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={handleUpdate} onBack={() => setSelectedProperty(null)} onDelete={() => {}} />
        ) : (
          <div className="space-y-12">
            {/* BUSCADOR Y FILTROS */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                  {activeGroup?.name || 'Explorar'}
                </h1>
                <p className="text-slate-400 font-bold text-lg">{filtered.length} departamentos encontrados</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group flex-1 md:flex-none">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Buscar propiedad..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-14 pr-8 py-5 bg-slate-50 border-none rounded-3xl w-full md:w-80 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 placeholder:text-slate-300 transition-all" 
                  />
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 rounded-3xl px-6 py-2 border border-transparent hover:border-slate-200 transition-all">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    className="bg-transparent py-3 font-black text-slate-600 outline-none cursor-pointer appearance-none uppercase text-xs tracking-widest" 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">TODOS</option>
                    {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* DASHBOARD LISTA/MAPA */}
            {activeGroup && (
              <Dashboard 
                activeGroup={activeGroup} 
                properties={filtered} 
                onSelectProperty={setSelectedProperty} 
                onUpdateProperty={handleUpdate} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

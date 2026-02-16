import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search } from 'lucide-react';

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
          sourceName: x.source_name || 'Inmo', status: x.status || PropertyStatus.INTERESTED,
          favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(x.url).hostname}`,
          m2Covered: x.m2_covered || 0, isFavorite: x.is_favorite || false, createdAt: new Date(x.created_at).getTime(),
          rating: x.rating || 0, bedrooms: x.bedrooms || 0, bathrooms: x.bathrooms || 0, comments: x.comments || ''
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

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-400 font-black text-[10px] tracking-widest uppercase">Cargando PropTrack AI...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl tracking-tighter block leading-none">PropTrack AI</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tamara Edition</span>
            </div>
          </div>
          <SearchGroupsList groups={searchGroups} activeGroupId={activeGroupId} onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} />
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-[1600px] mx-auto">
        {selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={handleUpdate} onBack={() => setSelectedProperty(null)} onDelete={() => {}} />
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
                  {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                </h1>
                <p className="text-slate-400 font-semibold text-lg">Visualizando {filtered.length} propiedades.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] w-full md:w-72 outline-none focus:border-indigo-500 font-bold text-slate-600 shadow-sm transition-all" />
                </div>
                <select className="bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 font-bold text-slate-600 outline-none shadow-sm cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                  <option value="ALL">TODOS</option>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {filtered.length > 0 ? (
              <Dashboard activeGroup={searchGroups.find(g => g.id === activeGroupId)!} properties={filtered} onSelectProperty={setSelectedProperty} onUpdateProperty={handleUpdate} />
            ) : (
              <div className="bg-white rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-100">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-black text-slate-400">No hay departamentos en esta zona</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

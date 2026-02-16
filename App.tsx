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
          sourceName: x.source_name || 'Portal', status: x.status || PropertyStatus.INTERESTED,
          thumbnail: x.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
          favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(x.url || 'http://localhost').hostname}`,
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

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600">CARGANDO...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. HEADER FIJO CON LOS GRUPOS (CARPETAS) */}
      <header className="bg-white border-b border-slate-100 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 self-start">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="font-black text-xl leading-none">PropTrack AI</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tamara Edition</p>
              </div>
            </div>

            {/* Este componente renderiza las carpetas blancas que se ven en tu captura */}
            <div className="w-full md:w-auto overflow-x-auto">
              <SearchGroupsList 
                groups={searchGroups} 
                activeGroupId={activeGroupId} 
                onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL (PROPIEDADES) */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-10">
        {selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={handleUpdate} onBack={() => setSelectedProperty(null)} onDelete={() => {}} />
        ) : (
          <div className="space-y-8">
            {/* BARRA DE BÚSQUEDA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                    {filtered.length} Propiedades analizadas
                  </p>
               </div>
               
               <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="px-6 py-3 bg-slate-50 border-none rounded-2xl w-64 outline-none font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <select 
                    className="bg-slate-50 border-none rounded-2xl px-6 py-3 font-bold text-slate-600 outline-none"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">TODOS</option>
                    {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            {/* DASHBOARD CON LA GRILLA DE PROPIEDADES */}
            <div className="relative">
              {activeGroupId && (
                <Dashboard 
                  groupName={searchGroups.find(g => g.id === activeGroupId)?.name || ''}
                  properties={filtered} 
                  onSelect={(id) => setSelectedProperty(allProperties.find(p => p.id === id) || null)}
                  onUpdateGroup={() => {}} 
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

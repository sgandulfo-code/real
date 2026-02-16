import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, LogOut, User } from 'lucide-react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  // --- LÓGICA DE AUTENTICACIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 uppercase tracking-widest">Cargando...</div>;

  // --- VISTA DE LOGIN SI NO HAY SESIÓN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">PropTrack AI</h1>
          <p className="text-slate-400 font-bold mb-8">Tamara Edition</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/s2/favicons?sz=64&domain=google.com" className="w-5 h-5" alt="G" />
            Entrar con Google
          </button>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL CON USUARIO ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 z-50 sticky top-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Building2 size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-lg leading-none">PropTrack AI</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tamara Edition</p>
            </div>
          </div>

          <div className="flex-1 px-8 overflow-x-auto no-scrollbar">
            <SearchGroupsList 
              groups={searchGroups} 
              activeGroupId={activeGroupId} 
              onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} 
            />
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                {session.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="User" />
                ) : (
                  <User size={16} className="text-slate-400" />
                )}
              </div>
              <span className="text-xs font-black text-slate-700 hidden lg:block uppercase tracking-tighter">
                {session.user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-10">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onUpdate={(upd: any) => {
              setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
              supabase.from('properties').update({ title: upd.title, status: upd.status, comments: upd.comments }).eq('id', upd.id);
            }} 
            onBack={() => setSelectedProperty(null)} 
            onDelete={() => {}} 
          />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                    {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                  </h2>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-64 outline-none font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>
            </div>

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

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, LogOut, Mail, Lock, ArrowRight, LayoutGrid, MousePointer2 } from 'lucide-react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = isRegistering 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } finally { setAuthLoading(false); }
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
      }
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-center mb-8">PropTrack AI</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none" required />
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400 cursor-pointer text-sm font-bold" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      
      {/* 1. HEADER (Marca y Logout) */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveGroupId(null); setSelectedProperty(null); }}>
            <Building2 className="text-indigo-600" size={24} />
            <span className="font-black text-xl tracking-tighter">PropTrack AI</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-red-500 p-2">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* 2. CARPETAS (Remax Class, etc) - Ahora tienen su lugar sagrado */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-[1600px] mx-auto px-6">
           <SearchGroupsList 
             groups={searchGroups} 
             activeGroupId={activeGroupId} 
             onSelectGroup={(id) => { 
                setActiveGroupId(id); 
                setSelectedProperty(null); 
             }} 
           />
        </div>
      </div>

      {/* 3. ÁREA DE TRABAJO */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onBack={() => setSelectedProperty(null)} 
            onUpdate={(upd: any) => setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p))}
            onDelete={() => {}} 
          />
        ) : activeGroupId ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-3xl font-black text-slate-900">
                {searchGroups.find(g => g.id === activeGroupId)?.name}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar propiedad..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none w-full md:w-72 shadow-sm" />
              </div>
            </div>
            <Dashboard 
              groupName={searchGroups.find(g => g.id === activeGroupId)?.name || ''}
              properties={filtered} 
              onSelect={(id) => setSelectedProperty(allProperties.find(p => p.id === id) || null)}
              onUpdateGroup={() => {}} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 max-w-md">
               <LayoutGrid size={48} className="text-indigo-100 mx-auto mb-6" />
               <h2 className="text-2xl font-black text-slate-900">Bienvenida, Tamara</h2>
               <p className="text-slate-400 mt-3 font-medium">Haz clic en una de tus carpetas arriba para comenzar a gestionar propiedades.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

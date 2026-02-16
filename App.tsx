import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, LogOut, Mail, Lock, ArrowRight, LayoutGrid, MousePointer2 } from 'lucide-react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  // --- TUS ESTADOS ORIGINALES ---
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

  // --- TU LÓGICA DE SUPABASE ---
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
    } finally {
      setAuthLoading(false);
    }
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
        
        if (!activeGroupId) setActiveGroupId(null);
      }
    } finally { setLoading(false); }
  };

  // --- TU FILTRADO USEMEMO ---
  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  // --- VISTA DE CARGA ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  // --- VISTA LOGIN ---
  if (!session) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-100">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">PropTrack AI</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tamara Edition</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-600" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-600" required />
          <button type="submit" disabled={authLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            {authLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegistering ? 'Crear Cuenta' : 'Entrar')}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400 font-bold text-xs cursor-pointer hover:text-indigo-600" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  );

  // --- RENDER PRINCIPAL (CORREGIDO) ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      
      {/* HEADER: Solo Marca y Usuario */}
      <header className="bg-white border-b border-slate-100 w-full relative z-10">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveGroupId(null); setSelectedProperty(null); }}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tighter">PropTrack AI</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tamara Edition</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* FILA DE CARPETAS (GRUPOS) */}
        <div className="mb-8 overflow-x-auto no-scrollbar py-2">
           <SearchGroupsList 
             groups={searchGroups} 
             activeGroupId={activeGroupId} 
             onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} 
           />
        </div>

        {selectedProperty ? (
          /* DETALLES DE PROPIEDAD */
          <PropertyDetails 
            property={selectedProperty} 
            onUpdate={(upd: any) => {
              setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
              supabase.from('properties').update({ title: upd.title, status: upd.status }).eq('id', upd.id);
            }} 
            onBack={() => setSelectedProperty(null)} 
            onDelete={() => {}} 
          />
        ) : activeGroupId ? (
          /* DASHBOARD DEL GRUPO ACTIVO */
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveGroupId(null)} className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                    <ArrowRight size={18} className="rotate-180" />
                 </button>
                 <h2 className="text-3xl font-black tracking-tight">
                    {searchGroups.find(g => g.id === activeGroupId)?.name}
                 </h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-6 py-3 bg-slate-50 border-none rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600/10" />
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
          /* VISTA INICIAL */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-14 rounded-[3.5rem] shadow-xl border border-slate-50 max-w-md relative">
               <div className="bg-indigo-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                  <LayoutGrid size={32} />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-3">¡Hola de nuevo!</h2>
               <p className="text-slate-400 font-medium leading-relaxed">
                 Todo está actualizado. Por favor, selecciona una carpeta arriba para ver las propiedades.
               </p>
               <div className="mt-8 flex items-center justify-center gap-2 text-indigo-500 font-black text-[10px] tracking-[0.2em] animate-bounce">
                  <MousePointer2 size={14} /> ELIGE UNA CARPETA
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

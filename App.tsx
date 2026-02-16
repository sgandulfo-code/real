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

  // NUEVA FUNCIÓN: Para que el botón de "Nuevo Proyecto" funcione realmente
  const handleCreateGroup = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('search_groups')
        .insert([{ name, description, user_id: session.user.id }])
        .select();
      
      if (error) throw error;
      if (data) {
        loadData(); // Recargamos para que aparezca la nueva carpeta
      }
    } catch (error: any) {
      alert("Error al crear proyecto: " + error.message);
    }
  };

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white mb-4">
            <Building2 size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">PropTrack AI</h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" required />
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center mt-6 text-slate-400 font-bold text-sm cursor-pointer" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-x-hidden">
      
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100] w-full">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveGroupId(null); setSelectedProperty(null); }}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="font-black text-lg leading-none tracking-tighter">PropTrack AI</h1>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tamara Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-black uppercase">{session.user.email.split('@')[0]}</span>
               <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 relative">
        
        {!selectedProperty && (
          <div className="mb-12 relative z-10">
            <SearchGroupsList 
              groups={searchGroups} 
              allProperties={allProperties} // IMPORTANTE: Agregado para que funcione el contador
              onCreate={handleCreateGroup}  // IMPORTANTE: Agregado para crear carpetas
              activeGroupId={activeGroupId} 
              onSelectGroup={(id: string) => { // Coincide con el nombre de prop en el componente corregido
                setActiveGroupId(id);
                setSelectedProperty(null);
              }} 
            />
          </div>
        )}

        {selectedProperty ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PropertyDetails 
              property={selectedProperty} 
              onBack={() => setSelectedProperty(null)} 
              onUpdate={(upd: any) => setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p))}
              onDelete={() => {}} 
            />
          </div>
        ) : activeGroupId ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                 <button onClick={() => setActiveGroupId(null)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                    <ArrowRight size={20} className="rotate-180" />
                 </button>
                 <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    {searchGroups.find(g => g.id === activeGroupId)?.name}
                 </h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Buscar en este proyecto..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-600/10" 
                />
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
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-1000">
            <div className="bg-white p-14 rounded-[3.5rem] shadow-2xl border border-slate-50 max-w-lg relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-4 rounded-3xl shadow-xl">
                  <LayoutGrid size={32} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 mb-4 mt-4 tracking-tighter">
                 ¡Todo listo, {session.user.email.split('@')[0]}!
               </h2>
               <p className="text-slate-400 font-medium leading-relaxed text-lg">
                 Selecciona una de tus carpetas de búsqueda arriba para ver las propiedades analizadas.
               </p>
               <div className="mt-10 flex items-center justify-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.3em] animate-bounce">
                  <MousePointer2 size={16} /> ELIGE UN GRUPO
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

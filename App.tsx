import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, LogOut, User, Mail, Lock, ArrowRight } from 'lucide-react';

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
        if (g.length > 0 && !activeGroupId) setActiveGroupId(g[0].id);
      }
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <span className="font-black text-xs uppercase tracking-widest text-slate-400">Iniciando PropTrack AI...</span>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-100 mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bienvenido</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tamara Edition</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600" required />
          </div>
          <button type="submit" disabled={authLoading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            {authLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 z-50 sticky top-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-50">
              <Building2 size={24} />
            </div>
            <div className="hidden md:block">
              <h1 className="font-black text-lg leading-none">PropTrack AI</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tamara Edition</p>
            </div>
          </div>

          <div className="flex-1 px-8">
            <SearchGroupsList groups={searchGroups} activeGroupId={activeGroupId} onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} />
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{session.user.email.split('@')[0]}</span>
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-10">
        {selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={(upd: any) => {
            setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
            supabase.from('properties').update({ title: upd.title, status: upd.status }).eq('id', upd.id);
          }} onBack={() => setSelectedProperty(null)} onDelete={() => {}} />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
              </h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-64 outline-none font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" />
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

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search, LogOut, User, Filter } from 'lucide-react';

// --- CONFIGURACIÓN DE SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  // --- GESTIÓN DE SESIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadSupabaseData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadSupabaseData();
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- CARGA DE DATOS ---
  const loadSupabaseData = async () => {
    try {
      setLoading(true);
      
      const { data: groups, error: groupsError } = await supabase
        .from('search_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propsError) throw propsError;

      const formattedProps: Property[] = props.map(p => ({
        id: p.id,
        searchGroupId: p.group_id,
        url: p.url,
        title: p.title || 'Propiedad sin título',
        price: p.price || 'Consultar',
        address: p.address || '',
        lat: p.lat || -34.6037,
        lng: p.lng || -58.3816,
        sourceName: p.source_name || 'Inmobiliaria',
        status: (p.status as PropertyStatus) || PropertyStatus.INTERESTED,
        thumbnail: p.thumbnail || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(p.url || 'http://localhost').hostname}`,
        rating: p.rating || 0,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        sqft: p.m2_covered || 0,
        operationType: p.operation_type || 'Venta',
        propertyType: p.property_type || 'Departamento',
        floorNumber: p.floor_number || '',
        m2Covered: p.m2_covered || 0,
        m2Uncovered: p.m2_uncovered || 0,
        expenses: p.expenses || 0,
        contactName: p.contact_name || '',
        contactPhone: p.contact_phone || '',
        comments: p.comments || '',
        nextVisit: p.next_visit || '',
        isFavorite: p.is_favorite || false,
        createdAt: new Date(p.created_at).getTime()
      }));

      const formattedGroups: SearchGroup[] = groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        icon: g.icon || 'Home',
        color: g.color || '#4f46e5',
        propertyCount: formattedProps.filter(p => p.searchGroupId === g.id).length
      }));

      setAllProperties(formattedProps);
      setSearchGroups(formattedGroups);
      
      if (formattedGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(formattedGroups[0].id);
      }

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES ---
  const handleLogin = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  const handleLogout = () => supabase.auth.signOut();

  const handleUpdateProperty = async (updatedProp: Property) => {
    setAllProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    await supabase.from('properties').update({
      title: updatedProp.title,
      price: updatedProp.price,
      status: updatedProp.status,
      comments: updatedProp.comments,
      is_favorite: updatedProp.isFavorite,
      rating: updatedProp.rating
    }).eq('id', updatedProp.id);
  };

  // --- FILTRADO ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      const matchesGroup = p.searchGroupId === activeGroupId;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesGroup && matchesSearch && matchesStatus;
    });
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Cargando PropTrack...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 text-center">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-indigo-200 shadow-2xl">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">PropTrack AI</h1>
          <p className="text-slate-400 font-bold mb-10 uppercase text-xs tracking-widest">Tamara Edition</p>
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl"
          >
            <img src="https://www.google.com/s2/favicons?sz=64&domain=google.com" className="w-6 h-6" alt="" />
            Entrar con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 sticky top-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg">
              <Building2 size={24} />
            </div>
            <div className="hidden md:block">
              <h1 className="font-black text-xl tracking-tighter leading-none">PropTrack AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tamara Edition</p>
            </div>
          </div>

          <div className="flex-1 px-10">
            <SearchGroupsList 
              groups={searchGroups} 
              activeGroupId={activeGroupId} 
              onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} 
            />
          </div>

          <div className="flex items-center gap-5 pl-6 border-l border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-200">
                {session.user?.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-slate-400" /></div>
                )}
              </div>
              <span className="text-xs font-black text-slate-700 uppercase hidden lg:block">
                {session.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
              </span>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 md:p-12">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onUpdate={handleUpdateProperty} 
            onBack={() => setSelectedProperty(null)} 
            onDelete={async () => {
              await supabase.from('properties').delete().eq('id', selectedProperty.id);
              setAllProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
              setSelectedProperty(null);
            }} 
          />
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                  {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
                    {filteredProperties.length} Propiedades en este grupo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Filtrar por título..." 
                    className="pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] w-full md:w-80 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-600 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-[2rem] px-6 py-5 flex items-center gap-3 shadow-sm">
                  <Filter size={18} className="text-slate-300" />
                  <select 
                    className="bg-transparent font-black text-slate-600 outline-none cursor-pointer text-xs uppercase tracking-widest"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todos los estados</option>
                    {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="relative">
              {activeGroupId && (
                <Dashboard 
                  groupName={searchGroups.find(g => g.id === activeGroupId)?.name || ''}
                  properties={filteredProperties} 
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

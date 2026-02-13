import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Property, PropertyStatus } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import AddPropertyModal from './components/AddPropertyModal';
import { TrendingUp, Plus, User, Users, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProperties();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProperties();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setProperties(data);
  }

  const handleUpdateProperty = async (updated: Property) => {
    const { error } = await supabase.from('properties').update(updated).eq('id', updated.id);
    if (!error) setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="font-black italic text-slate-400 uppercase tracking-widest text-xs">Sincronizando Portfolio...</p>
    </div>
  );

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-slate-100">
          <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
            <TrendingUp className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">PropTrack</h1>
          <p className="text-slate-500 font-bold mb-8">Accede a tu panel de inversión y grupos estratégicos.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all"
          >
            <User size={20} /> ENTRAR CON GOOGLE
          </button>
        </div>
      </div>
    );
  }

  const selectedProperty = properties.find(p => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100"><TrendingUp className="text-white w-5 h-5" /></div>
            <span className="font-black text-xl tracking-tighter italic uppercase">PropTrack</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l pl-8">
            <button className="flex items-center gap-2 text-indigo-600 border-b-2 border-indigo-600 pb-1"><Users size={14}/> Mis Grupos</button>
            <button className="hover:text-slate-900 transition-colors">Análisis Mercado</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={14} /> Nueva Captación
          </button>
          <button onClick={() => supabase.auth.signOut()} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty}
            onUpdate={handleUpdateProperty}
            onBack={() => setSelectedId(null)}
            onDelete={async () => {
              await supabase.from('properties').delete().eq('id', selectedProperty.id);
              setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelectedId(p.id)} onUpdate={handleUpdateProperty} />
            ))}
          </div>
        )}
      </main>

      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={async (newProp: any) => {
          const { data } = await supabase.from('properties').insert([{ ...newProp, user_id: session.user.id }]).select();
          if (data) setProperties([data[0], ...properties]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default App;

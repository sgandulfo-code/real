import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // Tu archivo de conexión
import { Property, PropertyStatus } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import { TrendingUp, Plus, User, LogOut, Users, X } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Para el formulario
  const [loading, setLoading] = useState(true);

  // FORMULARIO LOCAL (Lo que el usuario edita)
  const [newProp, setNewProp] = useState({
    title: '', price: '', address: '', sqft: 80, bedrooms: 2,
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    // 1. Recuperar Sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProperties();
      setLoading(false);
    });

    // 2. Escuchar cambios de usuario (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProperties();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProperties() {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (data) setProperties(data);
  }

  const handleSaveProperty = async () => {
    const { data, error } = await supabase.from('properties').insert([
      { ...newProp, user_id: session?.user?.id, status: PropertyStatus.WATCHLIST }
    ]).select();
    
    if (!error && data) {
      setProperties([data[0], ...properties]);
      setShowForm(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black">CARGANDO...</div>;

  // SI NO HAY SESIÓN, MOSTRAR LOGIN
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl"
        >
          ENTRAR CON GOOGLE
        </button>
      </div>
    );
  }

  const selectedProperty = properties.find(p => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* NAVBAR ORIGINAL */}
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl"><TrendingUp className="text-white w-5 h-5" /></div>
            <span className="font-black text-xl italic uppercase">PropTrack</span>
          </div>
          <div className="text-indigo-600 font-bold text-xs border-l pl-6 flex items-center gap-2">
            <Users size={16}/> MI GRUPO
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2"
          >
            <Plus size={16} /> AÑADIR
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-400"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty}
            onUpdate={async (upd) => {
              await supabase.from('properties').update(upd).eq('id', upd.id);
              setProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
            }}
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
              <PropertyCard key={p.id} property={p} onClick={() => setSelectedId(p.id)} />
            ))}
          </div>
        )}
      </main>

      {/* EL FORMULARIO QUE BUSCABAS (Ahora integrado aquí) */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl italic uppercase">Nueva Propiedad</h2>
              <button onClick={() => setShowForm(false)}><X /></button>
            </div>
            <div className="space-y-4">
              <input 
                placeholder="Título" 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" 
                onChange={e => setNewProp({...newProp, title: e.target.value})}
              />
              <input 
                placeholder="Precio (€)" 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" 
                onChange={e => setNewProp({...newProp, price: e.target.value})}
              />
              <button 
                onClick={handleSaveProperty}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100"
              >
                GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

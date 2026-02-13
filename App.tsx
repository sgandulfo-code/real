import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // Tu archivo de conexión
import { Property } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import { TrendingUp, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setProperties(data);
    setLoading(false);
  }

  const handleUpdate = async (updated: Property) => {
    const { error } = await supabase
      .from('properties')
      .update(updated)
      .eq('id', updated.id);

    if (!error) {
      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  const selectedProperty = properties.find(p => p.id === selectedId);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="font-black italic text-slate-400 uppercase tracking-tighter">Sincronizando con Supabase...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter italic uppercase">PropTrack</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty}
            onUpdate={handleUpdate}
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
              <PropertyCard 
                key={p.id} 
                property={p} 
                onClick={() => setSelectedId(p.id)} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

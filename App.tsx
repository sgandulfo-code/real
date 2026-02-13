import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import { TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('proptrack_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('proptrack_data', JSON.stringify(properties));
  }, [properties]);

  const selectedProperty = properties.find(p => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">PropTrack</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onBack={() => setSelectedId(null)}
            onUpdate={(updated) => setProperties(prev => prev.map(p => p.id === updated.id ? updated : p))}
            onDelete={() => {
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
                onUpdate={(upd) => setProperties(prev => prev.map(item => item.id === upd.id ? upd : item))} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

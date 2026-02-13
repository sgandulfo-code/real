import React, { useState, useEffect } from 'react';
import { Property } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import { Plus, Search } from 'lucide-react';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('proptrack_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('proptrack_data', JSON.stringify(properties));
  }, [properties]);

  const handleUpdateProperty = (updated: Property) => {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const selectedProperty = properties.find(p => p.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b p-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-black text-xl tracking-tighter italic">PROP<span className="text-indigo-600">TRACK</span></span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onBack={() => setSelectedId(null)}
            onUpdate={handleUpdateProperty}
            onDelete={() => {
              setProperties(prev => prev.filter(p => p.id !== selectedProperty.id));
              setSelectedId(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => setSelectedId(p.id)} onUpdate={handleUpdateProperty} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

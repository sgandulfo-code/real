import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus } from './types';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import { Plus, LayoutGrid, Search, TrendingUp } from 'lucide-react';

// Datos iniciales de ejemplo para que el Score tenga contra qué comparar
const INITIAL_DATA: Property[] = [
  {
    id: '1',
    title: 'Ático Duplex en Chamberí',
    address: 'Calle de Almagro, Madrid',
    price: '€850.000',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 120,
    thumbnail: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=800&q=80',
    status: PropertyStatus.VISITING,
    isFavorite: true,
    comments: 'Excelente terraza, pero necesita reforma en cocina.'
  },
  {
    id: '2',
    title: 'Loft Moderno Malasaña',
    address: 'Calle del Pez, Madrid',
    price: '€420.000',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 65,
    thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    status: PropertyStatus.WATCHLIST,
    isFavorite: false
  }
];

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('proptrack_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('proptrack_data', JSON.stringify(properties));
  }, [properties]);

  const handleUpdateProperty = (updated: Property) => {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    setSelectedId(null);
  };

  const selectedProperty = properties.find(p => p.id === selectedId);

  // --- LÓGICA GLOBAL DE SCORE PARA EL DASHBOARD ---
  const averageRatio = properties.reduce((acc, curr) => {
    const price = Number(curr.price.replace(/[^0-9.-]+/g, ""));
    return acc + (price / (curr.sqft || 1));
  }, 0) / (properties.length || 1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter">PROP<span className="text-indigo-600">TRACK</span></span>
          </div>
          
          {!selectedId && (
            <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-2xl w-1/3">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por zona o nombre..." 
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty}
            allProperties={properties} // <--- REQUERIDO PARA EL PUNTO 3
            onUpdate={handleUpdateProperty}
            onBack={() => setSelectedId(null)}
            onDelete={() => handleDeleteProperty(selectedProperty.id)}
          />
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-slate-900">Tu Portfolio</h1>
                <p className="text-slate-500 font-medium">Tienes {properties.length} propiedades en análisis</p>
              </div>
              <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100">
                <Plus className="w-5 h-5" /> Nueva Propiedad
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties
                .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={() => setSelectedId(property.id)}
                  onUpdate={handleUpdateProperty}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

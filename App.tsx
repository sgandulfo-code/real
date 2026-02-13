import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import Navbar from './components/Navbar';
import { Building2, Loader2, Search } from 'lucide-react';

// Credenciales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  // --- ESTADOS PRINCIPALES ---
  const [loading, setLoading] = useState(true);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // --- ESTADOS DE UI (Filtros y Búsqueda) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  // --- 1. CARGA INICIAL DE DATOS ---
  useEffect(() => {
    loadSupabaseData();
  }, []);

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
        searchGroupId: p.group_id, // Mapeo correcto desde la DB
        url: p.url,
        title: p.title || 'Propiedad sin título',
        price: p.price || 'Consultar',
        address: p.address || '',
        lat: p.lat || -34.6037,
        lng: p.lng || -58.3816,
        sourceName: p.source_name || 'Inmobiliaria',
        status: (p.status as PropertyStatus) || PropertyStatus.INTERESTED,
        thumbnail: p.thumbnail,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(p.url).hostname}`,
        rating: p.rating || 0,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        sqft: p.sqft || 0,
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

      setSearchGroups(formattedGroups);
      setAllProperties(formattedProps);
      
      if (formattedGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(formattedGroups[0].id);
      }

    } catch (err) {
      console.error("Error crítico en carga:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. LÓGICA DE ACTUALIZACIÓN CORREGIDA ---
  const handleUpdateProperty = async (updatedProp: Property) => {
    // Sincronización local inmediata
    setAllProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    
    // Persistencia en Supabase
    const { error } = await supabase
      .from('properties')
      .update({
        group_id: updatedProp.searchGroupId, // <-- CORRECCIÓN: Asegura el ID del grupo
        title: updatedProp.title,
        price: updatedProp.price,
        address: updatedProp.address,
        comments: updatedProp.comments,
        rating: updatedProp.rating,
        status: updatedProp.status,
        contact_name: updatedProp.contactName,
        contact_phone: updatedProp.contactPhone,
        next_visit: updatedProp.nextVisit,
        is_favorite: updatedProp.isFavorite,
        operation_type: updatedProp.operationType,
        property_type: updatedProp.propertyType,
        floor_number: updatedProp.floorNumber,
        m2_covered: updatedProp.m2Covered,
        m2_uncovered: updatedProp.m2Uncovered,
        expenses: updatedProp.expenses
      })
      .eq('id', updatedProp.id);

    if (error) {
      console.error("Error al sincronizar con Supabase:", error.message);
      // Opcional: Recargar datos si hay error para revertir cambios locales
      // loadSupabaseData(); 
    }
  };

  // --- 3. ELIMINACIÓN ---
  const handleDeleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) {
      setAllProperties(prev => prev.filter(p => p.id !== id));
      setSelectedProperty(null);
    }
  };

  // --- 4. FILTRADO DINÁMICO ---
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      const matchesGroup = p.searchGroupId === activeGroupId;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesGroup && matchesSearch && matchesStatus;
    });
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Navbar 
        groups={searchGroups}
        activeGroupId={activeGroupId}
        onGroupSelect={(id) => {
          setActiveGroupId(id);
          setSelectedProperty(null);
        }}
      />

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty}
            onUpdate={handleUpdateProperty}
            onBack={() => setSelectedProperty(null)}
            onDelete={() => handleDeleteProperty(selectedProperty.id)}
          />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">
                  {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                </h1>
                <p className="text-slate-500 font-medium">Tienes {filteredProperties.length} propiedades filtradas.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar por título o dirección..."
                    className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-600 outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="ALL">Todos los estados</option>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <Dashboard 
                activeGroup={searchGroups.find(g => g.id === activeGroupId)!}
                properties={filteredProperties}
                onSelectProperty={setSelectedProperty}
                onUpdateProperty={handleUpdateProperty}
              />
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
                <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No se encontraron propiedades</h3>
                <p className="text-slate-300">Intenta cambiar los filtros o la búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

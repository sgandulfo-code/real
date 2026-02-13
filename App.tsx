import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
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
        searchGroupId: p.group_id,
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

  // --- 2. LÓGICA DE ACTUALIZACIÓN ---
  const handleUpdateProperty = async (updatedProp: Property) => {
    setAllProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    
    const { error } = await supabase
      .from('properties')
      .update({
        group_id: updatedProp.searchGroupId, 
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

    if (error) console.error("Error al sincronizar con Supabase:", error.message);
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
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin

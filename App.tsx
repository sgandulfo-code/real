import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus, User, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import Login from './components/Login';
import SearchGroupsList from './components/SearchGroupsList';
import PropertyVerifier from './components/PropertyVerifier';
import { supabase } from './lib/supabase';

const STORAGE_KEY_USER = 'proptrack_current_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [verifyingUrl, setVerifyingUrl] = useState<string | null>(null);

  // 1. Cargar Usuario inicial
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // 2. Cargar datos desde Supabase
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!currentUser) return;

      try {
        // Cargar Grupos
        const { data: groups, error: gError } = await supabase
          .from('search_groups')
          .select('*')
          .eq('user_id', currentUser.id);

        if (gError) throw gError;
        if (groups) setSearchGroups(groups);

        // Cargar Propiedades
        const { data: props, error: pError } = await supabase
          .from('properties')
          .select('*');

        if (pError) throw pError;

        if (props) {
          const formattedProps: Property[] = props.map(p => ({
            id: p.id,
            searchGroupId: p.group_id,
            url: p.url,
            title: p.title || 'Propiedad Nueva',
            price: p.price || 'Consultar',
            address: p.address || '',
            // SOLUCIÓN AL ERROR NON-FINITE:
            lat: (p.lat && isFinite(p.lat)) ? Number(p.lat) : -34.6037,
            lng: (p.lng && isFinite(p.lng)) ? Number(p.lng) : -58.3816,
            sourceName: p.source_name || 'Inmobiliaria',
            status: (p.status as PropertyStatus) || PropertyStatus.INTERESTED,
            thumbnail: `https://picsum.photos/seed/${p.id}/600/400`,
            favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(p.url).hostname}`,
            rating: 0,
            contactName: '',
            contactPhone: '',
            comments: '',
            createdAt: new Date(p.created_at).getTime()
          }));
          setAllProperties(formattedProps);
        }
      } catch (err: any) {
        console.error("Error cargando de Supabase:", err.message);
      }
    };

    loadSupabaseData();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setSelectedGroupId(null);
    setSelectedPropertyId(null);
  };

  const createSearchGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('search_groups')
      .insert([{ user_id: currentUser.id, name, description }])
      .select();

    if (error) {
      alert("Error al crear grupo: " + error.message);
    } else if (data) {
      setSearchGroups(prev => [data[0], ...prev]);
    }
  };

  const onConfirmProperty = async (verifiedData: any) => {
    if (!selectedGroupId) return;

    const { data, error } = await supabase
      .from('properties')
      .insert([{
        group_id: selectedGroupId,
        url: verifiedData.url || verifyingUrl,
        title: verifiedData.title,
        price: verifiedData.price,
        address: verifiedData.address,
        lat: isFinite(verifiedData.lat) ? verifiedData.lat : -34.6037,
        lng: isFinite(verifiedData.lng) ? verifiedData.lng : -58.3816,
        source_name: verifiedData.sourceName || 'Inmobiliaria'
      }])
      .select();

    if (error) {
      alert("Error al guardar propiedad: " + error.message);
    } else {
      window.location.reload(); 
    }
  };

  const deleteSearchGroup = async (groupId: string) => {
    const { error } = await supabase.from('search_groups').delete().eq('id', groupId);
    if (!error) {
      setSearchGroups(prev => prev.filter(g => g.id !== groupId));
      setSelectedGroupId(null);
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const userGroups = searchGroups.filter(g => g.user_id === currentUser.id);
  const activeGroup = searchGroups.find(g => g.id === selectedGroupId);
  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer"
              onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2

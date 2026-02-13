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

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    // LÓGICA DE COMPARTIR: Detectar proyecto en la URL al cargar
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) setSelectedGroupId(projectId);
  }, []);

  useEffect(() => {
    const loadSupabaseData = async () => {
      // Cargamos grupos si hay usuario (tu flujo actual)
      if (currentUser) {
        const { data: groups } = await supabase
          .from('search_groups')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (groups) setSearchGroups(groups);
      }

      // Cargamos propiedades (incluye lógica para que invitados vean lo compartido)
      const { data: props } = await supabase.from('properties').select('*');
      if (props) {
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
          contactName: p.contact_name || '',
          contactPhone: p.contact_phone || '',
          comments: p.comments || '',
          createdAt: new Date(p.created_at).getTime()
        }));
        setAllProperties(formattedProps);
        
        // Si Tamara entra por link, buscamos el nombre del grupo compartido aunque no esté logueada
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('project');
        if (projectId && !currentUser) {
          const { data: sharedGroup } = await supabase
            .from('search_groups')
            .select('*')
            .eq('id', projectId)
            .single();
          if (sharedGroup) setSearchGroups([sharedGroup]);
        }
      }
    };
    loadSupabaseData();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    window.location.reload();
  };

  const createSearchGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('search_groups')
      .insert([{ user_id: currentUser.id, name, description }])
      .select();
    if (data) setSearchGroups(prev => [data[0], ...prev]);
  };

  const updateGroupName = async (newName: string) => {
    if (!selectedGroupId) return;
    const { error } = await supabase
      .from('search_groups')
      .update({ name: newName })
      .eq('id', selectedGroupId);

    if (!error) {
      setSearchGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, name: newName } : g));
    }
  };

  const onConfirmProperty = async (verifiedData: any) => {
    if (!selectedGroupId || !verifyingUrl) return;

    const aiGeneratedThumb = `https://images.unsplash.com/photo-1580587767526-cf3873950645?q=80&w=800&auto=format&fit=crop`;
    const finalThumbnail = verifiedData.thumbnail || aiGeneratedThumb;

    const { error } = await supabase
      .from('properties')
      .insert([{
        group_id: selectedGroupId,
        url: verifyingUrl,
        title: verifiedData.title,
        price: verifiedData.price,
        address: verifiedData.address,
        bedrooms: verifiedData.bedrooms,
        bathrooms: verifiedData.bathrooms,
        sqft: verifiedData.sqft,
        lat: verifiedData.lat,
        lng: verifiedData.lng,
        source_name: verifiedData.sourceName,
        thumbnail: finalThumbnail,
        status: PropertyStatus.INTERESTED
      }]);

    if (!error) {
      setVerifyingUrl(null);
      setNewUrl('');
      const { data: newProps } = await supabase.from('properties').select('*');
      if (newProps) window.location.reload(); 
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  // --- LÓGICA DE RENDERIZADO ---
  const params = new URLSearchParams(window.location.search);
  const isSharedView = params.get('project');

  // Si no hay usuario Y no es una vista compartida, mostrar Login
  if (!currentUser && !isSharedView) return <Login onLogin={handleLogin} />;

  const selectedGroup = searchGroups.find(g => g.id === selectedGroupId);
  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="h-16 border-b bg-white/80 backdrop-blur-

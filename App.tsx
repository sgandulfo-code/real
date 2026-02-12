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

  // 1. Persistencia de Sesión
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // 2. Carga de Datos desde Supabase
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!currentUser) return;
      
      // Cargar Grupos
      const { data: groups } = await supabase
        .from('search_groups')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (groups) setSearchGroups(groups);

      // Cargar Propiedades
      const { data: props } = await supabase.from('properties').select('*');
      if (props) {
        const formattedProps: Property[] = props.map(p => ({
          id: p.id,
          searchGroupId: p.group_id,
          url: p.url,
          title: p.title || 'Nueva Propiedad',
          price: p.price || 'Consultar',
          address: p.address || '',
          lat: (typeof p.lat === 'number' && isFinite(p.lat)) ? p.lat : -34.6037,
          lng: (typeof p.lng === 'number' && isFinite(p.lng)) ? p.lng : -58.3816,
          sourceName: p.source_name || 'Inmobiliaria',
          status: (p.status as PropertyStatus) || PropertyStatus.INTERESTED,
          thumbnail: p.thumbnail || `https://picsum.photos/seed/${p.id}/600/400`,
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
      }
    };
    loadSupabaseData();
  }, [currentUser]);

  // 3. Manejadores de Autenticación
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    window.location.reload();
  };

  // 4. Lógica de Grupos
  const createSearchGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('search_groups')
      .insert

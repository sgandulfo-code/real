import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus, User, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import Login from './components/Login';
import SearchGroupsList from './components/SearchGroupsList';
import PropertyVerifier from './components/PropertyVerifier';
import { supabase } from './lib/supabase'; // Conexión a Supabase

const STORAGE_KEY_USER = 'proptrack_current_user';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [verifyingUrl, setVerifyingUrl] = useState<string | null>(null);

  // 1. Cargar Usuario inicial (LocalStorage para la sesión)
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // 2. Cargar DATOS DESDE SUPABASE cuando el usuario está logueado
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!currentUser) return;

      // Cargar Grupos
      const { data: groups, error: gError } = await supabase
        .from('search_groups')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (groups) setSearchGroups(groups);

      // Cargar Propiedades
      const { data: props, error: pError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (props) {
        // Adaptamos el formato de la DB al formato de tu App
        const formattedProps: Property[] = props.map(p => ({
          id: p.id,
          searchGroupId: p.group_id,
          url: p.url,
          title: p.title,
          price: p.price,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          sourceName: p.source_name,
          status: p.status as PropertyStatus,
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

  // 3. Crear Grupo en Supabase
  const createSearchGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    
    const { data, error } = await supabase
      .from('search_groups')
      .insert([{ user_id: currentUser.id, name, description }])
      .select();

    if (data) {
      setSearchGroups(prev => [data[0], ...prev]);
    }
  };

  const deleteSearchGroup = async (groupId: string) => {
    const { error } = await supabase.from('search_groups').delete().eq('id', groupId);
    if (!error) {
      setSearchGroups(prev => prev.filter(g => g.id !== groupId));
      setAllProperties(prev => prev.filter(p => p.searchGroupId !== groupId));
      setSelectedGroupId(null);
    }
  };

  const handleAddProperty = () => {
    if (!newUrl || !selectedGroupId) return;
    setVerifyingUrl(newUrl);
  };

  // 4. Guardar Propiedad en Supabase (Confirmación de IA)
  const onConfirmProperty = async (verifiedData: any) => {
    if (!selectedGroupId) return;

    const { data, error } = await supabase
      .from('properties')
      .insert([{
        group_id: selectedGroupId,
        url: verifiedData.url || verifyingUrl,
        title: verifiedData.title || 'Propiedad Nueva',
        price: verifiedData.price,
        address: verifiedData.address,
        lat: verifiedData.lat,
        lng: verifiedData.lng,
        source_name: verifiedData.sourceName || 'Inmobiliaria'
      }])
      .select();

    if (error) {
      alert("Error al guardar en Supabase");
    } else if (data) {
      // Recargar localmente para mostrar el nuevo pin
      window.location.reload(); // Forma rápida de refrescar todo desde la DB
    }
  };

  const updateProperty = async (updated: Property) => {
    await supabase.from('properties').update({
      title: updated.title,
      price: updated.price,
      status: updated.status
    }).eq('id', updated.id);
    
    setAllProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProperty = async (id: string) => {
    await supabase.from('properties').delete().eq('id', id);
    setAllProperties(prev => prev.filter(p => p.id !== id));
    setSelectedPropertyId(null);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const userGroups = searchGroups.filter(g => g.user_id === currentUser.id);
  const activeGroup = searchGroups.find(g => g.id === selectedGroupId);
  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer"
              onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <nav className="hidden sm:flex items-center text-sm font-medium">
               <span className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}>Búsquedas</span>
               {activeGroup && (
                 <>
                   <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   <span className="text-slate-900">{activeGroup.name}</span>
                 </>
               )}
            </nav>
          </div>

          <div className="flex-1 max-w-md px-8 hidden md:block">
            {selectedGroupId && !selectedPropertyId && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Pegar link de propiedad..."
                  className="w-full pl-4 pr-32 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full text-sm outline-none"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProperty()}
                />
                <button onClick={handleAddProperty} className="absolute right-1 top-1 bottom-1 px-4 bg-indigo-600 text-white text-xs font-bold rounded-full">AGREGAR</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <button onClick={handleLogout} className="text-[10px] font-bold text-slate-400 uppercase hover:text-red-500">Salir</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {!selectedGroupId ? (
          <SearchGroupsList groups={userGroups} onCreate={createSearchGroup} onSelect={setSelectedGroupId} onDelete={deleteSearchGroup} />
        ) : selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={updateProperty} onBack={() => setSelectedPropertyId(null)} onDelete={() => deleteProperty(selectedProperty.id)} />
        ) : (
          <Dashboard properties={projectProperties} onSelect={setSelectedPropertyId} />
        )}
      </main>

      {verifyingUrl && (
        <PropertyVerifier

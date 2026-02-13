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

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId) setSelectedGroupId(projectId);
  }, []);

  useEffect(() => {
    const loadSupabaseData = async () => {
      if (currentUser) {
        const { data: groups } = await supabase
          .from('search_groups')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (groups) setSearchGroups(groups);
      }

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

  // --- FUNCIÓN MEJORADA CON GEOCODIFICACIÓN ---
  const onConfirmProperty = async (verifiedData: any) => {
    if (!selectedGroupId || !verifyingUrl) return;

    let finalLat = verifiedData.lat;
    let finalLng = verifiedData.lng;

    // Si no tenemos coordenadas reales (usamos el default de BA como señal de que faltan)
    if (verifiedData.address && (finalLat === -34.6037 || !finalLat)) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(verifiedData.address + ", Buenos Aires")}&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      } catch (error) {
        console.error("Error buscando coordenadas:", error);
      }
    }

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
        lat: finalLat,
        lng: finalLng,
        source_name: verifiedData.sourceName,
        thumbnail: finalThumbnail,
        status: PropertyStatus.INTERESTED
      }]);

    if (!error) {
      setVerifyingUrl(null);
      setNewUrl('');
      window.location.reload(); 
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const isSharedView = params.get('project');

  if (!currentUser && !isSharedView) return <Login onLogin={handleLogin} />;

  const selectedGroup = searchGroups.find(g => g.id === selectedGroupId);
  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all" 
            onClick={() => { 
              window.history.pushState({}, '', window.location.pathname);
              setSelectedGroupId(null); 
              setSelectedPropertyId(null); 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="font-bold text-slate-800 text-xl tracking-tight">PropTrack AI</h1>
        </div>
        
        {currentUser && selectedGroupId && !selectedPropertyId && (
          <div className="flex-1 max-w-xl px-10">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Pegar link de propiedad..." 
                className="w-full pl-5 pr-36 py-2.5 bg-slate-100 border-transparent rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" 
                value={newUrl} 
                onChange={(e) => setNewUrl(e.target.value)} 
              />
              <button 
                onClick={() => setVerifyingUrl(newUrl)} 
                className="absolute right-1 top-1 bottom-1 px-6 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-md"
              >
                AGREGAR
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
                <button onClick={handleLogout} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500">Cerrar Sesión</button>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} alt="Avatar" />
              </div>
            </>
          ) : (
            <div className="bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modo Lectura</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {!selectedGroupId ? (
          <SearchGroupsList 
            groups={searchGroups} 
            allProperties={allProperties}
            onCreate={createSearchGroup} 
            onSelect={setSelectedGroupId} 
            onDelete={(id: string) => supabase.from('search_groups').delete().eq('id', id).then(() => window.location.reload())} 
          />
        ) : selectedProperty ? (
          <PropertyDetails 
            property={selectedProperty} 
            onUpdate={() => window.location.reload()} 
            onBack={() => setSelectedPropertyId(null)} 
            onDelete={() => supabase.from('properties').delete().eq('id', selectedProperty.id).then(() => window.location.reload())} 
          />
        ) : (
          <Dashboard 
            properties={projectProperties} 
            onSelect={setSelectedPropertyId}
            groupName={selectedGroup?.name || 'Cargando...'}
            onUpdateGroup={updateGroupName}
          />
        )}
      </main>

      {verifyingUrl && (
        <PropertyVerifier 
          url={verifyingUrl} 
          onCancel={() => setVerifyingUrl(null)} 
          onConfirm={onConfirmProperty} 
        />
      )}
    </div>
  );
};

export default App;

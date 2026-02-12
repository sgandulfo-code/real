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
  }, []);

  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!currentUser) return;
      
      const { data: groups } = await supabase
        .from('search_groups')
        .select('*')
        .eq('user_id', currentUser.id);
      if (groups) setSearchGroups(groups);

      const { data: props } = await supabase.from('properties').select('*');
      if (props) {
        const formattedProps: Property[] = props.map(p => ({
          id: p.id,
          searchGroupId: p.group_id,
          url: p.url,
          title: p.title || 'Propiedad Nueva',
          price: p.price || 'Consultar',
          address: p.address || '',
          lat: (typeof p.lat === 'number' && isFinite(p.lat)) ? p.lat : -34.6037,
          lng: (typeof p.lng === 'number' && isFinite(p.lng)) ? p.lng : -58.3816,
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
    };
    loadSupabaseData();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const createSearchGroup = async (name: string, description: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('search_groups')
      .insert([{ user_id: currentUser.id, name, description }])
      .select();
    if (data) setSearchGroups(prev => [data[0], ...prev]);
  };

  const onConfirmProperty = async (verifiedData: any) => {
    if (!selectedGroupId) return;
    const { error } = await supabase
      .from('properties')
      .insert([{
        group_id: selectedGroupId,
        url: verifiedData.url || verifyingUrl,
        title: verifiedData.title,
        price: verifiedData.price,
        address: verifiedData.address,
        lat: isFinite(verifiedData.lat) ? verifiedData.lat : -34.6037,
        lng: isFinite(verifiedData.lng) ? verifiedData.lng : -58.3816,
        source_name: verifiedData.sourceName
      }]);

    if (!error) window.location.reload();
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-lg shadow-indigo-100" onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <h1 className="font-bold text-slate-800 text-xl tracking-tight">PropTrack AI</h1>
        </div>
        
        {selectedGroupId && !selectedPropertyId && (
          <div className="flex-1 max-w-xl px-10">
            <div className="relative group">
              <input type="text" placeholder="Pegar link de propiedad..." className="w-full pl-5 pr-36 py-2.5 bg-slate-100 border-transparent rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              <button onClick={() => setVerifyingUrl(newUrl)} className="absolute right-1 top-1 bottom-1 px-6 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-md">AGREGAR</button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
            <button onClick={() => {localStorage.removeItem(STORAGE_KEY_USER); window.location.reload();}} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cerrar Sesión</button>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} alt="Avatar" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {!selectedGroupId ? (
          <SearchGroupsList groups={searchGroups} onCreate={createSearchGroup} onSelect={setSelectedGroupId} onDelete={(id) => supabase.from('search_groups').delete().eq('id', id).then(() => window.location.reload())} />
        ) : selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={() => {}} onBack={() => setSelectedPropertyId(null)} onDelete={() => supabase.from('properties').delete().eq('id', selectedProperty.id).then(() => window.location.reload())} />
        ) : (
          <Dashboard properties={projectProperties} onSelect={setSelectedPropertyId} />
        )}
      </main>

      {verifyingUrl && <PropertyVerifier url={verifyingUrl} onCancel={() => setVerifyingUrl(null)} onConfirm={onConfirmProperty} />}
    </div>
  );
};

export default App;

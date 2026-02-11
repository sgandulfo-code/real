import React, { useState, useEffect } from 'react';
import { Property, PropertyStatus, User, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import Login from './components/Login';
import SearchGroupsList from './components/SearchGroupsList';
import PropertyVerifier from './components/PropertyVerifier';

const STORAGE_KEY_PROPS = 'proptrack_properties';
const STORAGE_KEY_GROUPS = 'proptrack_groups';
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
    const savedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (savedGroups) setSearchGroups(JSON.parse(savedGroups));
    const savedProps = localStorage.getItem(STORAGE_KEY_PROPS);
    if (savedProps) setAllProperties(JSON.parse(savedProps));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(searchGroups));
    localStorage.setItem(STORAGE_KEY_PROPS, JSON.stringify(allProperties));
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [searchGroups, allProperties, currentUser]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedGroupId(null);
    setSelectedPropertyId(null);
  };

  const createSearchGroup = (name: string, description: string) => {
    if (!currentUser) return;
    const newGroup: SearchGroup = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      name,
      description,
      createdAt: Date.now(),
    };
    setSearchGroups(prev => [newGroup, ...prev]);
  };

  const deleteSearchGroup = (groupId: string) => {
    setSearchGroups(prev => prev.filter(g => g.id !== groupId));
    setAllProperties(prev => prev.filter(p => p.searchGroupId !== groupId));
    setSelectedGroupId(null);
  };

  const handleAddProperty = () => {
    if (!newUrl || !selectedGroupId) return;
    setVerifyingUrl(newUrl);
  };

  const onConfirmProperty = (verifiedData: any) => {
    if (!selectedGroupId) return;
    const newProp: Property = {
      id: Math.random().toString(36).substr(2, 9),
      searchGroupId: selectedGroupId,
      url: verifiedData.url || verifyingUrl || '',
      title: verifiedData.title || 'Propiedad Nueva',
      price: verifiedData.price || 'Consultar',
      address: verifiedData.address || 'Dirección pendiente',
      lat: verifiedData.lat || -34.6037,
      lng: verifiedData.lng || -58.3816,
      thumbnail: `https://picsum.photos/seed/${Math.random()}/600/400`,
      sourceName: verifiedData.sourceName || 'Inmobiliaria',
      favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(verifyingUrl || '').hostname}`,
      rating: 0,
      status: PropertyStatus.INTERESTED,
      contactName: '',
      contactPhone: '',
      comments: '',
      createdAt: Date.now(),
    };
    setAllProperties(prev => [newProp, ...prev]);
    setNewUrl('');
    setVerifyingUrl(null);
    setSelectedPropertyId(newProp.id);
  };

  const updateProperty = (updated: Property) => {
    setAllProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProperty = (id: string) => {
    setAllProperties(prev => prev.filter(p => p.id !== id));
    setSelectedPropertyId(null);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const userGroups = searchGroups.filter(g => g.userId === currentUser.id);
  const activeGroup = searchGroups.find(g => g.id === selectedGroupId);
  const projectProperties = allProperties.filter(p => p.searchGroupId === selectedGroupId);
  const selectedProperty = allProperties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-lg shadow-indigo-100"
              onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="hidden sm:block">
               <nav className="flex items-center text-sm font-medium">
                  <span className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => { setSelectedGroupId(null); setSelectedPropertyId(null); }}>My Searches</span>
                  {activeGroup && (
                    <>
                      <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className={`${selectedProperty ? 'text-slate-400 hover:text-slate-600 cursor-pointer' : 'text-slate-900'}`} onClick={() => setSelectedPropertyId(null)}>{activeGroup.name}</span>
                    </>
                  )}
               </nav>
            </div>
          </div>

          <div className="flex-1 max-w-md px-8 hidden md:block">
            {selectedGroupId && !selectedPropertyId && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Paste property URL here..."
                  className="w-full pl-4 pr-32 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full transition-all text-sm outline-none"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProperty()}
                />
                <button onClick={handleAddProperty} disabled={!newUrl} className="absolute right-1 top-1 bottom-1 px-4 bg-indigo-600 text-white text-xs font-bold rounded-full disabled:bg-slate-300">ADD</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <button onClick={handleLogout} className="text-[10px] font-bold text-slate-400 uppercase hover:text-red-500">Log out</button>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} alt="Avatar" />
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
          url={verifyingUrl} 
          onCancel={() => setVerifyingUrl(null)} 
          onConfirm={onConfirmProperty} 
        />
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import { Property, PropertyStatus, SearchGroup } from './types';
import Dashboard from './components/Dashboard';
import PropertyDetails from './components/PropertyDetails';
import SearchGroupsList from './components/SearchGroupsList'; 
import { Building2, Loader2, Search } from 'lucide-react';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: g } = await supabase.from('search_groups').select('*').order('created_at', { ascending: false });
      const { data: p } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (p && g) {
        const props: Property[] = p.map(x => ({
          id: x.id, searchGroupId: x.group_id, url: x.url, title: x.title || 'Propiedad',
          price: x.price || 'Consultar', address: x.address || '', lat: x.lat || -34.6, lng: x.lng || -58.3,
          sourceName: x.source_name || 'Inmo', status: x.status || PropertyStatus.INTERESTED,
          favicon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(x.url).hostname}`,
          m2Covered: x.m2_covered || 0, isFavorite: x.is_favorite || false, createdAt: new Date(x.created_at).getTime(),
          rating: x.rating || 0, bedrooms: x.bedrooms || 0, bathrooms: x.bathrooms || 0, comments: x.comments || ''
        }));
        setAllProperties(props);
        setSearchGroups(g.map(group => ({ ...group, propertyCount: props.filter(pr => pr.searchGroupId === group.id).length })));
        if (g.length > 0 && !activeGroupId) setActiveGroupId(g[0].id);
      }
    } finally { setLoading(false); }
  };

  const handleUpdate = async (upd: Property) => {
    setAllProperties(prev => prev.map(p => p.id === upd.id ? upd : p));
    await supabase.from('properties').update({ 
      group_id: upd.searchGroupId, title: upd.title, price: upd.price, status: upd.status, 
      is_favorite: upd.isFavorite, m2_covered: upd.m2Covered, comments: upd.comments 
    }).eq('id', upd.id);
  };

  const filtered = useMemo(() => {
    return allProperties.filter(p => p.searchGroupId === activeGroupId && 
      (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase())) && 
      (statusFilter === 'ALL' || p.status === statusFilter));
  }, [allProperties, activeGroupId, searchTerm, statusFilter]);

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', backgroundColor:'#f8fafc', fontFamily:'sans-serif'}}>
      <Loader2 style={{width:'40px', height:'40px', color:'#4f46e5', animation:'spin 1s linear infinite'}} />
      <p style={{marginTop:'16px', color:'#94a3b8', fontWeight:'900', fontSize:'10px', letterSpacing:'0.1em'}}>CARGANDO PROPTRACK AI...</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', backgroundColor:'#F8FAFC', color:'#0f172a', fontFamily:'sans-serif'}}>
      <header style={{backgroundColor:'white', borderBottom:'1px solid #f1f5f9', position:'sticky', top:0, zIndex:50, padding:'0 24px'}}>
        <div style={{maxWidth:'1600px', margin:'0 auto', height:'80px', display:'flex', alignItems:'center', justifyContent:'between'}}>
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div style={{backgroundColor:'#4f46e5', padding:'10px', borderRadius:'16px', color:'white'}}>
              <Building2 size={24} />
            </div>
            <div>
              <span style={{fontWeight:900, fontSize:'20px', letterSpacing:'-0.05em', display:'block'}}>PropTrack AI</span>
              <span style={{fontSize:'9px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase'}}>Tamara Edition</span>
            </div>
          </div>
          <div style={{marginLeft:'auto'}}>
            <SearchGroupsList groups={searchGroups} activeGroupId={activeGroupId} onSelectGroup={(id) => { setActiveGroupId(id); setSelectedProperty(null); }} />
          </div>
        </div>
      </header>

      <main style={{padding:'40px 24px', maxWidth:'1600px', margin:'0 auto'}}>
        {selectedProperty ? (
          <PropertyDetails property={selectedProperty} onUpdate={handleUpdate} onBack={() => setSelectedProperty(null)} onDelete={() => {}} />
        ) : (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'40px', flexWrap:'wrap', gap:'20px'}}>
              <div>
                <h1 style={{fontSize:'48px', fontWeight:900, letterSpacing:'-0.05em', margin:0}}>
                  {searchGroups.find(g => g.id === activeGroupId)?.name || 'Dashboard'}
                </h1>
                <p style={{color:'#94a3b8', fontWeight:600, fontSize:'18px', margin:'8px 0 0 0'}}>Tienes {filtered.length} propiedades.</p>
              </div>

              <div style={{display:'flex', gap:'12px'}}>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{padding:'16px 24px', borderRadius:'24px', border:'1px solid #e2e8f0', width:'280px', fontWeight:700, outline:'none'}} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                  style={{padding:'16px 24px', borderRadius:'24px', border:'1px solid #e2e8f0', backgroundColor:'white', fontWeight:700, cursor:'pointer'}}>
                  <option value="ALL">TODOS</option>
                  {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{marginTop:'20px'}}>
              {filtered.length > 0 ? (
                <Dashboard activeGroup={searchGroups.find(g => g.id === activeGroupId)!} properties={filtered} onSelectProperty={setSelectedProperty} onUpdateProperty={handleUpdate} />
              ) : (
                <div style={{backgroundColor:'white', borderRadius:'48px', padding:'100px', textAlign:'center', border:'2px dashed #f1f5f9'}}>
                   <h3 style={{color:'#94a3b8', fontWeight:900}}>Sin resultados en esta zona</h3>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

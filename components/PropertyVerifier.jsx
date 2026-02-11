import React, { useState, useEffect } from 'react';

export default function PropertyVerifier({ url, onConfirm, onCancel }) {
  const [data, setData] = useState({ title: '', price: '', address: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/extract?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, [url]);

  const handleLocalConfirm = async () => {
    // Esto busca la dirección en el mapa automáticamente
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address + ", Buenos Aires")}`);
    const geoData = await geoRes.json();
    
    if (geoData.length > 0) {
      onConfirm({
        ...data,
        lat: parseFloat(geoData[0].lat),
        lng: parseFloat(geoData[0].lon)
      });
    } else {
      alert("No encuentro esa dirección. Por favor, escríbela mejor (Calle y Altura).");
    }
  };

  if (loading) return <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]">Analizando...</div>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg flex max-w-5xl w-full h-[80vh] overflow-hidden shadow-2xl">
        <iframe src={url} className="w-2/3 h-full border-none hidden md:block" title="web" />
        <div className="w-full md:w-1/3 p-6 flex flex-col bg-white">
          <h2 className="font-bold text-xl mb-4">Confirmar Datos</h2>
          <p className="text-sm text-gray-500 mb-4">Mira la web y completa lo que falte:</p>
          
          <label className="text-xs font-bold text-gray-400">PRECIO</label>
          <input className="border p-2 rounded mb-4 w-full bg-yellow-50" value={data.price} onChange={e => setData({...data, price: e.target.value})} placeholder="Ej: USD 150.000" />
          
          <label className="text-xs font-bold text-gray-400">DIRECCIÓN</label>
          <input className="border p-2 rounded mb-4 w-full bg-yellow-50" value={data.address} onChange={e => setData({...data, address: e.target.value})} placeholder="Ej: Av. Las Heras 2300" />
          
          <div className="mt-auto flex gap-2">
            <button onClick={onCancel} className="flex-1 p-2 text-gray-400">Cancelar</button>
            <button onClick={handleLocalConfirm} className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Ubicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

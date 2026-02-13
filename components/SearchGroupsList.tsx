import React from 'react';
import { Folder, Calendar, MoreVertical, Plus, ArrowRight, Building2, Trash2 } from 'lucide-react';

// Recibimos 'groups' (que es lo que manda App.tsx)
export default function SearchGroupsList({ groups, onCreate, onSelect, onDelete }: any) {

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Reciente'; 
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (e) { return 'Fecha desc.'; }
  };

  const handleCreateNew = () => {
    const name = prompt("Nombre del nuevo proyecto:");
    const desc = prompt("Descripción corta:");
    if (name) onCreate(name, desc || "");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Mis Proyectos</h2>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-1">Gestión de carteras inmobiliarias</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups && groups.length > 0 ? (
          groups.map((group: any) => (
            <div 
              key={group.id}
              onClick={() => onSelect(group.id)} 
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Folder className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(confirm('¿Borrar este proyecto?')) onDelete(group.id); 
                  }} 
                  className="text-slate-200 hover:text-red-500 p-2 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mb-8 space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate uppercase italic">
                  {group.name}
                </h3>
                <p className="text-sm font-bold text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {group.description || "Búsqueda activa de propiedades"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 uppercase">
                    <Building2 size={12} className="text-indigo-400" />
                    Proyecto
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase">
                    <Calendar size={12} />
                    {formatDate(group.created_at)}
                  </span>
                </div>
                <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
             <Folder className="w-16 h-16 text-slate-100 mx-auto mb-4" />
             <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Cargando tus proyectos...</p>
          </div>
        )}
      </div>
    </div>
  );
}

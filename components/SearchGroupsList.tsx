import React from 'react';
import { Folder, ChevronRight, Plus, Building2, Home, Share2 } from 'lucide-react';

// Cambiamos el nombre de la prop a onSelectGroup para que coincida con App.tsx
export default function SearchGroupsList({ groups, allProperties, onCreate, onSelectGroup }: any) {

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Reciente';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (e) { return 'Reciente'; }
  };

  const getPropertyCount = (groupId: string) => {
    // Verificación de seguridad para evitar errores si allProperties es undefined
    if (!allProperties) return 0;
    return allProperties.filter((p: any) => p.searchGroupId === groupId).length;
  };

  const handleCreateNew = () => {
    const name = prompt("Nombre del proyecto:");
    // Verificamos que onCreate exista antes de llamarlo
    if (name && onCreate) onCreate(name, "");
  };

  const shareByWhatsApp = (e: React.MouseEvent, group: any) => {
    e.stopPropagation(); 
    const baseUrl = window.location.origin; // Más seguro que usar la URL fija de Vercel
    const shareUrl = `${baseUrl}/?project=${group.id}`;
    const message = `¡Hola! Te comparto el acceso al proyecto de propiedades "${group.name}" en PropTrack AI: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative z-10">
      
      {/* Header Proyectos */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Workspace Activo
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Mis Proyectos
          </h2>
          <p className="text-slate-400 font-medium flex items-center gap-2 pt-1">
            <Home className="w-4 h-4 text-slate-300" />
            <span className="font-bold text-slate-500">{groups?.length || 0}</span> grupos de búsqueda
          </p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 self-start md:self-end"
        >
          <Plus size={20} /> Nuevo Proyecto
        </button>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups && groups.map((group: any) => {
          const count = getPropertyCount(group.id);
          
          return (
            <div 
              key={group.id}
              // USAMOS onSelectGroup que es la prop que viene de App.tsx
              onClick={() => onSelectGroup(group.id)} 
              className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer hover:-translate-y-2 relative flex flex-col"
            >
              {/* Icono y Compartir */}
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500 shadow-sm">
                  <Folder className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => shareByWhatsApp(e, group)}
                    className="bg-green-50 text-green-600 p-2.5 rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 border border-green-100 flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    <span className="text-[10px] font-extrabold uppercase pr-1">Compartir</span>
                  </button>
                  
                  <div className="bg-slate-900/5 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100">
                    {formatDate(group.created_at)}
                  </div>
                </div>
              </div>

              {/* Info del Proyecto */}
              <div className="p-8 pt-2 flex-1">
                <h3 className="font-black text-slate-800 text-2xl mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors tracking-tight uppercase">
                  {group.name}
                </h3>
                <p className="text-slate-400 font-medium text-sm line-clamp-2">
                  {group.description || "Explorando nuevas oportunidades..."}
                </p>
              </div>

              {/* Footer: Métricas */}
              <div className="p-7 pt-0">
                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">Contenido</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-black text-slate-700 text-sm">{count} <span className="text-[10px] text-slate-400">Props</span></span>
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Folder, Calendar, MoreVertical, Plus, ArrowRight, Building2 } from 'lucide-react';

// Eliminamos los MOCK_PROJECTS para que no interfieran con tus datos reales
export default function SearchGroupsList({ projects, onNewProject, onSelectProject }: any) {

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha pendiente'; 
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return 'Fecha desc.'; }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Search Projects</h2>
          <p className="text-slate-500 font-medium">Organize your property hunting by criteria or city</p>
        </div>
        <button 
          onClick={onNewProject}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Usamos directamente la prop 'projects' que viene de tu base de datos */}
        {projects && projects.length > 0 ? (
          projects.map((project: any) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project.id)} 
              className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 transition-colors">
                  <Folder className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); }} 
                  className="text-slate-300 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full transition-all"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-sm font-bold text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {project.description || "Sin descripción"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wide">
                    <Building2 size={12} className="text-indigo-500" />
                    {/* Aquí podrías mostrar el conteo si tu query de Supabase lo trae */}
                    Ver detalles
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    <Calendar size={12} />
                    {formatDate(project.created_at)}
                  </span>
                </div>
                <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Mensaje por si realmente no hay proyectos en la base de datos */
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No se encontraron proyectos activos</p>
          </div>
        )}
      </div>
    </div>
  );
}

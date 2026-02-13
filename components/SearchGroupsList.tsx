import React from 'react';
import { Folder, Calendar, MoreVertical, Plus, ArrowRight, Building2 } from 'lucide-react';

// Definimos la estructura de tus datos (adaptada a lo que se ve en tu pantalla)
interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string; // La fecha que viene de la base de datos
  property_count?: number; // Opcional por si aún no lo tienes conectado
}

// Datos de ejemplo para que veas el diseño YA MISMO (luego conectaremos con tu Supabase)
const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'Melina', description: 'Barrientos', created_at: '2024-02-10T10:00:00', property_count: 12 },
  { id: '2', name: 'Prueba', description: 'Todo bien', created_at: '2024-02-11T15:30:00', property_count: 3 },
  { id: '3', name: 'Tamara', description: 'Muchos metros', created_at: '2024-02-12T09:20:00', property_count: 0 },
  { id: '4', name: 'Remax Class', description: 'Tiene que tener mucha luz', created_at: '2024-02-13T11:00:00', property_count: 5 },
];

export default function SearchGroupsList({ projects = MOCK_PROJECTS, onNewProject }: any) {

  // Función robusta para arreglar el "INVALID DATE"
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      // Si la fecha no es válida, devolvemos un texto seguro en lugar de romper la app
      if (isNaN(date.getTime())) return 'Fecha pendiente'; 
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Fecha desc.';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera de la sección */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Search Projects</h2>
          <p className="text-slate-500 font-medium">Organiza tus búsquedas por cliente o zona</p>
        </div>
        <button 
          onClick={onNewProject}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={18} /> Nuevo Proyecto
        </button>
      </div>

      {/* Grid de Tarjetas Renovadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <div 
            key={project.id}
            className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Cabecera de la tarjeta: Icono y Menú */}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl transition-colors ${project.property_count ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Folder className="w-6 h-6" />
              </div>
              <button className="text-slate-300 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full transition-all">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="mb-6 space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm font-bold text-slate-400 line-clamp-2 min-h-[2.5rem]">
                {project.description || "Sin descripción"}
              </p>
            </div>

            {/* Footer con Métricas y Fecha */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-wide">
                  <Building2 size={12} className={project.property_count ? "text-indigo-500" : "text-slate-400"} />
                  {project.property_count || 0} Props
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  <Calendar size={12} />
                  {formatDate(project.created_at)}
                </span>
              </div>
              
              {/* Flecha interactiva */}
              <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        ))}

        {/* Tarjeta fantasma para "Crear Nuevo" (Visual) */}
        <button 
          onClick={onNewProject}
          className="border-3 border-dashed border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all group min-h-[200px]"
        >
          <div className="p-4 bg-slate-50 rounded-full group-hover:bg-white transition-colors group-hover:shadow-md">
            <Plus size={24} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Crear Carpeta</span>
        </button>
      </div>
    </div>
  );
}

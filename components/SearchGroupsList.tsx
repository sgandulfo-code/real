
import React, { useState } from 'react';
import { SearchGroup } from '../types';

interface Props {
  groups: SearchGroup[];
  onSelect: (id: string) => void;
  onCreate: (name: string, description: string) => void;
  onDelete: (id: string) => void;
}

const SearchGroupsList: React.FC<Props> = ({ groups, onSelect, onCreate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (name) {
      onCreate(name, desc);
      setName('');
      setDesc('');
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Search Projects</h2>
           <p className="text-slate-500 font-medium">Organize your property hunting by criteria or city</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          New Project
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
           </div>
           <h3 className="text-xl font-bold text-slate-800">No search projects yet</h3>
           <p className="text-slate-500 mt-1 mb-6">Create your first search folder to start adding properties</p>
           <button onClick={() => setShowModal(true)} className="text-indigo-600 font-bold hover:underline">Create folder now &rarr;</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div 
              key={group.id}
              className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => onSelect(group.id)}
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                 </div>
                 <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('Delete folder and all properties?')) onDelete(group.id); }}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                 </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{group.name}</h3>
              <p className="text-sm text-slate-500 font-medium flex-1 mb-6 line-clamp-2">{group.description || 'No description added yet.'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(group.createdAt).toLocaleDateString()}
                 </span>
                 <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold">
                    View Project
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Create New Project</h3>
              <p className="text-slate-500 mb-8 font-medium">Name your search group to stay organized.</p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Project Name</label>
                    <input 
                      autoFocus
                      className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="e.g. Dream House 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Short Description</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-slate-100 border-none rounded-2xl px-5 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Any specific area or must-haves?"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex gap-3 mt-10">
                 <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                  onClick={handleCreate}
                  disabled={!name}
                  className="flex-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50"
                 >
                    Create Project
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchGroupsList;

import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase'; // Importamos la conexión real

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Nueva contraseña
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // PROCESO DE REGISTRO REAL
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegistering(false);
      } else {
        // PROCESO DE LOGIN REAL
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          onLogin({
            id: data.user.id, // ID REAL de Supabase
            name: data.user.email?.split('@')[0] || 'Usuario', // Nombre derivado del email
            email: data.user.email || email
          });
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">PropTrack AI</h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isRegistering ? 'Crea tu cuenta profesional' : 'Personal Real Estate Manager'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
            <input 
              required
              type="email"
              placeholder="name@email.com"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
            <input 
              required
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-700 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Start Searching')}
          </button>
        </form>

        <div className="pt-4 text-center">
           <button 
             onClick={() => setIsRegistering(!isRegistering)}
             className="text-xs text-indigo-600 font-bold uppercase tracking-widest hover:text-indigo-800 transition-colors"
           >
             {isRegistering ? 'Already have an account? Login' : 'No account? Register here'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

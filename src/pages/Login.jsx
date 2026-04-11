import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Activity, ArrowRight, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido Lic. Roman!');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error('Acceso denegado. Verifica tus credenciales.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-3xl kinetic-gradient flex items-center justify-center shadow-2xl shadow-primary/30">
            <Activity className="text-white w-8 h-8" strokeWidth={3} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-manrope font-extrabold tracking-tight text-slate-900">MR Kinesiología</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sistema de Gestión Clínica</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Profesional</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type="email" 
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all duration-200 outline-none"
                  placeholder="ejemplo@kinesio.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all duration-200 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full kinetic-gradient text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-bold text-slate-300 uppercase tracking-widest">
          MR Kinesiología © 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

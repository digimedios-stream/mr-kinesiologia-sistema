import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  ArrowLeft, 
  User, 
  Shield, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const MissingOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchMissingOrders();
  }, []);

  const fetchMissingOrders = async () => {
    try {
      setLoading(true);
      // We want patients who have any session with entrego_orden = false
      const { data, error } = await supabase
        .from('sesiones_pagos')
        .select(`
          paciente_id,
          pacientes (
            id,
            nombre,
            apellido,
            dni,
            obras_sociales (nombre)
          )
        `)
        .eq('entrego_orden', false);

      if (error) throw error;

      // Unify by patient (a patient might have multiple sessions without order)
      const uniquePatients = [];
      const seenIds = new Set();

      data?.forEach(s => {
        if (s.pacientes && !seenIds.has(s.pacientes.id)) {
          uniquePatients.push(s.pacientes);
          seenIds.add(s.pacientes.id);
        }
      });

      setPatients(uniquePatients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={12} strokeWidth={3} /> PANEL DE CONTROL
          </button>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Pendientes de Orden</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Pacientes que aún no han presentado su orden de práctica</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obra Social</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {patients.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.nombre} {p.apellido}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">{p.dni || '---'}</td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">{p.obras_sociales?.nombre || 'Particular'}</td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => navigate(`/pacientes/${p.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        VER FICHA <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-[32px] flex items-center justify-center text-emerald-500 mx-auto mb-6">
              <ClipboardList size={40} />
            </div>
            <h3 className="text-xl font-manrope font-black text-slate-900 dark:text-white">¡Todo al día!</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay pacientes con órdenes pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingOrders;

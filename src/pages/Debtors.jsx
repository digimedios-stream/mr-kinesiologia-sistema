import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Wallet,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Debtors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [debtors, setDebtors] = useState([]);

  useEffect(() => {
    fetchDebtors();
  }, []);

  const fetchDebtors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sesiones_pagos')
        .select(`
          saldo_pendiente,
          paciente_id,
          pacientes (
            id,
            nombre,
            apellido,
            dni,
            obras_sociales (nombre)
          )
        `)
        .gt('saldo_pendiente', 0);

      if (error) throw error;

      // Group by patient and sum debts
      const grouped = data?.reduce((acc, curr) => {
        if (!curr.pacientes) return acc;
        const pid = curr.paciente_id;
        if (!acc[pid]) {
          acc[pid] = {
            ...curr.pacientes,
            totalDebt: 0
          };
        }
        acc[pid].totalDebt += (curr.saldo_pendiente || 0);
        return acc;
      }, {});

      setDebtors(Object.values(grouped || {}).sort((a, b) => b.totalDebt - a.totalDebt));
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
            onClick={() => navigate('/sesiones')}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors mb-2"
          >
            <ArrowLeft size={12} strokeWidth={3} /> CONTROL DE SESIONES
          </button>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Saldos Pendientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Listado de pacientes con deuda activa</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-rose-500/30" /></div>
        ) : debtors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obra Social</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Deuda Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {debtors.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.nombre} {p.apellido}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">DNI: {p.dni || '---'}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">{p.obras_sociales?.nombre || 'Particular'}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black text-rose-500">${p.totalDebt.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => navigate(`/pacientes/${p.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        COBRAR <ChevronRight size={14} />
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
              <Wallet size={40} />
            </div>
            <h3 className="text-xl font-manrope font-black text-slate-900 dark:text-white">¡Sin Deudores!</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Todos los saldos están al día</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Debtors;

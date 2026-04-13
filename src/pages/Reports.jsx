import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users,
  Activity,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Reports = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSessions: 0,
    totalIncome: 0,
    monthlyIncome: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { count: pCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
    
    // Fetch sessions from correct table
    const { data: sData } = await supabase
      .from('sesiones_pagos')
      .select('monto_abonado');
    
    if (sData) {
      const income = sData.reduce((acc, s) => acc + (s.monto_abonado || 0), 0);
      
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const monthlyIncome = sData
        .filter(s => new Date(s.fecha_sesion).getTime() >= firstDayOfMonth)
        .reduce((acc, s) => acc + (s.monto_abonado || 0), 0);

      const pendingCount = sData.filter(s => (s.monto_abonado || 0) <= 0).length;
      
      setStats({
        totalPatients: pCount || 0,
        totalSessions: sData.length,
        totalIncome: income,
        monthlyIncome: monthlyIncome,
        pendingPayments: pendingCount
      });
    }
  };

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm space-y-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-manrope font-extrabold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 leading-tight">Informes y Métricas</h1>
          <p className="text-sm text-slate-500 font-medium">Análisis de rendimiento y finanzas clínicas</p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={TrendingUp} label="Ingresos del Mes" value={`$${stats.monthlyIncome.toLocaleString()}`} color="kinetic-gradient" />
        <MetricCard icon={DollarSign} label="Ingresos Totales" value={`$${stats.totalIncome.toLocaleString()}`} color="bg-slate-900" />
        <MetricCard icon={Activity} label="Sesiones Realizadas" value={stats.totalSessions} color="bg-secondary" />
        <MetricCard icon={PieChart} label="Sesiones Sin Pago" value={stats.pendingPayments} color="bg-rose-500" />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-manrope font-extrabold text-slate-900">Evolución de Sesiones</h3>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[45, 60, 40, 80, 50, 90, 70, 85, 95, 60, 40, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-50 rounded-full h-full relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-primary/20 rounded-full transition-all group-hover:bg-primary/40" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-widest">
                  {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

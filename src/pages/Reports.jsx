import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Users,
  Activity,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

const Reports = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalSessions: 0,
    totalIncome: 0,
    monthlyIncome: 0,
    pendingPayments: 0,
    dailyIncome: 0,
    dailySessions: 0,
    incomeCash: 0,
    incomeElectronic: 0,
    monthlyHistory: [],
    dailyHistory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { count: pCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true });
      
      // Fetch sessions and payments
      const [{ data: sData }, { data: pData }, { data: aData }] = await Promise.all([
        supabase.from('sesiones_pagos').select('id, monto_abonado, fecha_sesion, total_estimado, saldo_pendiente, medio_pago'),
        supabase.from('pagos').select('monto, fecha, sesion_id, medio_pago'),
        supabase.from('asistencias_sesiones').select('id, fecha_asistencia')
      ]);

      if (!sData) return;

      // Create a unified list of financial transactions
      const allPayments = [...(pData || [])];

      // Calculate how much is already accounted for in the 'pagos' table per session
      const paidInTableBySession = {};
      (pData || []).forEach(p => {
        paidInTableBySession[p.sesion_id] = (paidInTableBySession[p.sesion_id] || 0) + (p.monto || 0);
      });

      // Check each session to see if there's an upfront payment not yet in the 'pagos' table
      sData.forEach(session => {
        const totalAbonado = session.monto_abonado || 0;
        const yaEnTabla = paidInTableBySession[session.id] || 0;
        const faltante = totalAbonado - yaEnTabla;

        // If there's a difference, it's an upfront/legacy payment that needs a virtual record
        if (faltante > 0) {
          allPayments.push({
            monto: faltante,
            fecha: session.fecha_sesion,
            sesion_id: session.id,
            medio_pago: session.medio_pago
          });
        }
      });

      const income = allPayments.reduce((acc, p) => acc + (p.monto || 0), 0);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      
      const monthlyIncome = allPayments
        .filter(p => {
          if (!p.fecha) return false;
          const pDate = new Date(p.fecha.includes('T') ? p.fecha : p.fecha + 'T12:00:00');
          return pDate.getTime() >= firstDayOfMonth;
        })
        .reduce((acc, p) => acc + (p.monto || 0), 0);

      // Pending payments: sessions where saldo_pendiente > 0
      const pendingCount = sData.filter(s => (s.saldo_pendiente || 0) > 0).length;

      const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const dailyIncome = allPayments
        .filter(p => {
          if (!p.fecha) return false;
          const pDateStr = p.fecha.includes('T') ? p.fecha.split('T')[0] : p.fecha;
          return pDateStr === todayStr;
        })
        .reduce((acc, p) => acc + (p.monto || 0), 0);
        
      const dailySessions = aData ? aData.filter(a => {
        if (!a.fecha_asistencia) return false;
        const aDateStr = a.fecha_asistencia.split('T')[0];
        return aDateStr === todayStr;
      }).length : 0;
      
      // Monthly History (last 12 months)
      const monthlyHistoryMap = {};
      const dailyHistoryMap = {};
      
      allPayments.forEach(p => {
        if (!p.fecha) return;
        const pDateStr = p.fecha.includes('T') ? p.fecha.split('T')[0] : p.fecha;
        const date = new Date(pDateStr + 'T12:00:00');
        if (isNaN(date.getTime())) return;
        
        const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const dKey = pDateStr;
        
        monthlyHistoryMap[mKey] = (monthlyHistoryMap[mKey] || 0) + (p.monto || 0);
        dailyHistoryMap[dKey] = (dailyHistoryMap[dKey] || 0) + (p.monto || 0);
      });

      const monthlyHistory = Object.entries(monthlyHistoryMap)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 12)
        .map(([month, amount]) => ({ month, amount }));

      const dailyHistory = Object.entries(dailyHistoryMap)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7)
        .map(([date, amount]) => ({ date, amount }));

      setStats({
        totalPatients: pCount || 0,
        totalSessions: aData ? aData.length : 0,
        totalIncome: income,
        monthlyIncome: monthlyIncome,
        monthlySessions: aData ? aData.filter(a => {
          if (!a.fecha_asistencia) return false;
          const aDate = new Date(a.fecha_asistencia);
          return aDate.getTime() >= firstDayOfMonth;
        }).length : 0,
        pendingPayments: pendingCount,
        dailyIncome: dailyIncome,
        dailySessions: dailySessions,
        incomeCash: allPayments.filter(p => !p.medio_pago || p.medio_pago === 'Efectivo').reduce((acc, p) => acc + (p.monto || 0), 0),
        incomeElectronic: allPayments.filter(p => p.medio_pago === 'Electrónico' || p.medio_pago === 'Transferencia').reduce((acc, p) => acc + (p.monto || 0), 0),
        monthlyHistory,
        dailyHistory
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('es-AR');
    
    // Add Branding
    doc.setFontSize(22);
    doc.setTextColor(0, 105, 114); // Primary color
    doc.text('MR Kinesiologia', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Informe generado el: ${today}`, 20, 28);
    
    doc.setDrawColor(230);
    doc.line(20, 32, 190, 32);
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text('Métricas y Resultados Clínicos', 20, 45);
    
    // Grid-like layout for metrics
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    const startY = 60;
    const col1 = 20;
    const col2 = 110;
    
    // Metric 1
    doc.setFont(undefined, 'bold');
    doc.text('Ingresos del Mes:', col1, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`$${stats.monthlyIncome.toLocaleString()}`, col1 + 45, startY);
    
    // Metric 2
    doc.setFont(undefined, 'bold');
    doc.text('Ingresos Totales:', col2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`$${stats.totalIncome.toLocaleString()}`, col2 + 45, startY);
    
    // Metric 3
    doc.setFont(undefined, 'bold');
    doc.text('Sesiones Realizadas:', col1, startY + 15);
    doc.setFont(undefined, 'normal');
    doc.text(`${stats.totalSessions}`, col1 + 45, startY + 15);

    // DAILY STATS
    doc.setFont(undefined, 'bold');
    doc.text('Ingresos de Hoy:', col1, startY + 30);
    doc.setFont(undefined, 'normal');
    doc.text(`$${stats.dailyIncome.toLocaleString()}`, col1 + 45, startY + 30);

    doc.setFont(undefined, 'bold');
    doc.text('Sesiones de Hoy:', col2, startY + 30);
    doc.setFont(undefined, 'normal');
    doc.text(`${stats.dailySessions}`, col2 + 45, startY + 30);
    
    // Metric 4
    doc.setFont(undefined, 'bold');
    doc.text('Pacientes Registrados:', col2, startY + 15);
    doc.setFont(undefined, 'normal');
    doc.text(`${stats.totalPatients}`, col2 + 45, startY + 15);
    
    doc.setDrawColor(240);
    doc.line(20, startY + 45, 190, startY + 45);
    
    // Status
    doc.setFontSize(12);
    doc.setTextColor(220, 53, 69); // Rose color
    doc.text(`Pacientes con sesiones pendientes de pago: ${stats.pendingPayments}`, 20, startY + 60);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Este documento es un resumen financiero automático para uso administrativo.', 20, 280);
    
    doc.save(`Informe_Clinico_MR_${today.replace(/\//g, '-')}.pdf`);
  };

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-50 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="animate-pulse text-primary/20" size={60} />
        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Informes y Métricas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Análisis de rendimiento y finanzas clínicas</p>
        </div>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
        >
          <Download size={16} />
          Exportar PDF
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={TrendingUp} label="Ingresos del Mes" value={`$${stats.monthlyIncome.toLocaleString()}`} color="kinetic-gradient" />
        <MetricCard icon={DollarSign} label="Efectivo (Total)" value={`$${stats.incomeCash.toLocaleString()}`} color="bg-emerald-500" />
        <MetricCard icon={Activity} label="Electrónico (Total)" value={`$${stats.incomeElectronic.toLocaleString()}`} color="bg-primary" />
        <MetricCard icon={PieChart} label="Sesiones Sin Pago" value={stats.pendingPayments} color="bg-rose-500" />
      </div>

      <div>
        <h2 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Clock size={20} className="text-emerald-500" /> Métricas de Hoy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/20 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest">Ingresos de Hoy</p>
              <h3 className="text-3xl font-manrope font-extrabold text-emerald-700 dark:text-white mt-1">${stats.dailyIncome.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Sesiones de Hoy</p>
              <h3 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white mt-1">{stats.dailySessions}</h3>
            </div>
          </div>

          <div className="hidden lg:flex bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700 items-center justify-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sincronizado en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white">Evolución de Sesiones</h3>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4">
            {/* Last 12 months chart */}
            {(() => {
              const monthsLabels = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
              const currentYear = new Date().getFullYear();
              const yearData = Array(12).fill(0);
              
              stats.monthlyHistory.forEach(h => {
                const [y, m] = h.month.split('-');
                if (parseInt(y) === currentYear) {
                  yearData[parseInt(m) - 1] = h.amount;
                }
              });

              const maxAmount = Math.max(...yearData, 1);

              return yearData.map((amount, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-full h-full relative overflow-hidden flex flex-col justify-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(amount / maxAmount) * 100}%` }}
                      className="w-full bg-primary/40 rounded-full transition-all group-hover:bg-primary/60" 
                      title={`$${amount.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-widest">
                    {monthsLabels[i]}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Daily History Table */}
        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white mb-6">Últimos 7 Días</h3>
          <div className="space-y-4">
            {stats.dailyHistory.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' })}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(d.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-500">${d.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {stats.dailyHistory.length === 0 && (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

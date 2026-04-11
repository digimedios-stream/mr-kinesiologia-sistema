import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  TrendingUp,
  Clock,
  ChevronRight,
  PlusCircle,
  FileEdit,
  CalendarDays
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activePatients: 0,
    sessionsToday: 0,
    estimatedIncome: 0,
    productivity: 78
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Patients Count
      const { count: patientsCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true });

      // Fetch Today's Sessions (Turnos)
      const today = new Date().toISOString().split('T')[0];
      const { data: turnsToday } = await supabase
        .from('turnos')
        .select('*, pacientes(nombre, apellido)')
        .eq('fecha', today)
        .order('hora', { ascending: true });

      // Fetch Monthly Income
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: incomeData } = await supabase
        .from('sesiones_pagos')
        .select('monto_abonado')
        .gte('fecha_sesion', firstDayOfMonth);

      const monthlyIncome = incomeData?.reduce((acc, curr) => acc + (curr.monto_abonado || 0), 0) || 0;

      setStats(prev => ({
        ...prev,
        activePatients: patientsCount || 0,
        sessionsToday: turnsToday?.length || 0,
        estimatedIncome: monthlyIncome
      }));
      setAppointments(turnsToday || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity dark:text-white`}>
        <Icon size={80} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white transition-colors">{value}</h3>
          {trend && <span className="text-emerald-500 text-[10px] font-bold">{trend}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Panel de Control</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestiona tu clínica con precisión</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase letter-spacing-widest">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Pacientes Activos" value={stats.activePatients} trend="+3 este mes" />
        <StatCard icon={CalendarCheck} label="Sesiones Hoy" value={stats.sessionsToday} trend="Turnos Prog." />
        <StatCard icon={DollarSign} label="Ingresos Mes" value={`$${stats.estimatedIncome.toLocaleString()}`} trend="Cobrado real" />
        <StatCard icon={TrendingUp} label="Productividad" value={`${stats.productivity}%`} />
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-8">
        {/* Agenda Table */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-manrope font-extrabold text-slate-900 dark:text-white">Agenda de Hoy</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Turnos Programados</p>
            </div>
            <button 
              onClick={() => navigate('/calendario')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container dark:bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary-container/80 transition-colors"
            >
              <PlusCircle size={16} />
              GESTIONAR AGENDA
            </button>
          </div>

          <div className="space-y-3">
            {appointments.length > 0 ? appointments.map((appointment) => (
              <div key={appointment.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:border-primary/20 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 pr-4">
                    <span className="text-sm font-bold text-primary">{appointment.hora?.substring(0,5)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{appointment.pacientes?.nombre} {appointment.pacientes?.apellido}</p>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{appointment.motivo || 'Sesión de Kinesiología'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${appointment.estado === 'confirmado' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    {appointment.estado}
                  </span>
                  <button 
                    onClick={() => navigate('/sesiones')}
                    className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic">No hay turnos para hoy.</div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-manrope font-extrabold text-slate-900 dark:text-white mb-2">Acciones Rápidas</h2>
            
            <button 
              onClick={() => navigate('/nuevo-paciente')}
              className="group kinetic-gradient p-5 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="bg-white/20 p-2 rounded-xl">
                  <PlusCircle size={20} />
                </div>
                <span className="font-bold">Nuevo Paciente</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/sesiones')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl flex items-center justify-between text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-primary">
                  <FileEdit size={20} />
                </div>
                <span className="font-bold">Registrar Sesión</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-slate-200 dark:text-slate-700" />
            </button>

            <button 
              onClick={() => navigate('/calendario')}
              className="group bg-white dark:bg-slate-900 p-5 rounded-2xl flex items-center justify-between text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 shadow-sm transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-secondary">
                  <CalendarDays size={20} />
                </div>
                <span className="font-bold">Ver Calendario</span>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-slate-200 dark:text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

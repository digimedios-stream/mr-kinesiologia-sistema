import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { supabase } from '../lib/supabase';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Filter,
  X,
  User,
  Activity,
  Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessionalCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Appointment States
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchPatients();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('turnos')
        .select('*, pacientes(nombre, apellido)');
      
      if (error) throw error;
      
      const calendarEvents = data.map(t => ({
        id: t.id,
        title: `${t.pacientes?.nombre} ${t.pacientes?.apellido} - ${t.motivo || 'Sesión'}`,
        start: `${t.fecha}T${t.hora}`,
        extendedProps: { ...t }
      }));
      
      setEvents(calendarEvents);
    } catch (err) {
      toast.error('Error al cargar calendario');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('pacientes').select('id, nombre, apellido').order('apellido');
    if (data) setPatients(data);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !date || !time) return toast.error('Completa los campos obligatorios');

    setSubmitting(true);
    try {
      const { error } = await supabase.from('turnos').insert([{
        paciente_id: selectedPatient,
        fecha: date,
        hora: time,
        motivo: reason,
        estado: 'pendiente'
      }]);

      if (error) throw error;
      toast.success('Turno programado correctamente');
      setShowModal(false);
      // Clean form
      setSelectedPatient('');
      setDate('');
      setTime('');
      setReason('');
      fetchEvents();
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateClick = (arg) => {
    setDate(arg.dateStr.split('T')[0]);
    if (arg.dateStr.includes('T')) {
      setTime(arg.dateStr.split('T')[1].substring(0, 5));
    }
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    toast(`Paciente: ${info.event.title}`, { icon: '👤' });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Agenda Médica</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión de turnos y disponibilidad horaria</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 transition-all"
          >
            <Plus size={16} strokeWidth={3} />
            NUEVO TURNO
          </button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-slate-50 dark:border-slate-800">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          locale={esLocale}
          firstDay={1}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          height="auto"
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          themeSystem="standard"
          eventClassNames="p-1 rounded-lg border-none shadow-sm text-xs font-bold bg-primary text-white hover:opacity-90 transition-opacity"
          dayHeaderClassNames="p-4 uppercase text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest bg-slate-50/50 dark:bg-slate-800/50 border-none first:rounded-tl-2xl last:rounded-tr-2xl"
          slotLabelClassNames="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase pr-4"
          nowIndicator={true}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
        />
      </div>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl kinetic-gradient flex items-center justify-center text-white">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white">Programar Turno</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Agendar nueva cita</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                  <select 
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  >
                    <option value="">Buscar paciente...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Hora</label>
                    <input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Motivo / Tratamiento</label>
                  <input 
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej. Rehabilitación de hombro"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-2xl px-5 py-4 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 kinetic-gradient text-white rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'AGENDAR TURNO'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .fc {
          --fc-border-color: #cbd5e1 !important; /* Más fuerte */
          --fc-today-bg-color: #f0f9fa;
          --fc-button-bg-color: #ffffff;
          --fc-button-border-color: #cbd5e1 !important;
          --fc-button-text-color: #64748b;
          --fc-button-active-bg-color: #006972;
          --fc-button-active-border-color: #006972;
          --fc-button-active-text-color: #ffffff;
          --fc-button-hover-bg-color: #f8fafc;
          --fc-button-hover-border-color: #cbd5e1 !important;
          --fc-button-hover-text-color: #006972;
        }
        .dark .fc {
          --fc-border-color: #334155 !important;
          --fc-today-bg-color: #0f172a;
          --fc-button-bg-color: #1e293b;
          --fc-button-border-color: #334155 !important;
          --fc-button-text-color: #94a3b8;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid #cbd5e1 !important;
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
          border: 1px solid #334155 !important;
        }
        .fc-toolbar-title {
          font-family: 'Manrope', sans-serif !important;
          font-weight: 800 !important;
          font-size: 1.25rem !important;
          color: #0f172a !important;
        }
        .dark .fc-toolbar-title {
          color: #ffffff !important;
        }
        .fc .fc-button-primary {
          border-radius: 12px !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 8px 16px !important;
          transition: all 0.2s !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        .fc-timegrid-slot {
          height: 48px !important;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalCalendar;

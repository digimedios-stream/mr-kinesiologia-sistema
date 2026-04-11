import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Plus, Loader2, Calendar as CalendarIcon, X, User, Clock, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessionalCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  
  const [newTurn, setNewTurn] = useState({
    paciente_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchPatients();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('*, pacientes(nombre, apellido)');
      
      if (error) throw error;
      
      const formattedEvents = data.map(turn => ({
        id: turn.id,
        title: `${turn.pacientes?.nombre} ${turn.pacientes?.apellido}`,
        start: `${turn.fecha}T${turn.hora}`,
        extendedProps: { motivo: turn.motivo },
        backgroundColor: '#0ea5e9',
        borderColor: '#0ea5e9',
      }));
      
      setEvents(formattedEvents);
    } catch (err) {
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('pacientes').select('*').order('apellido');
    if (data) setPatients(data);
  };

  const handleDateSelect = (selectInfo) => {
    const date = selectInfo.startStr.split('T')[0];
    const time = selectInfo.startStr.split('T')[1]?.substring(0, 5) || '10:00';
    setNewTurn({ ...newTurn, fecha: date, hora: time });
    setShowModal(true);
  };

  const handleCreateTurn = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('turnos').insert([newTurn]);
      if (error) throw error;
      toast.success('Turno agendado');
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error('Error al agendar');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-12 lg:mt-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Agenda Médica</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión de turnos y disponibilidad horaria</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          NUEVO TURNO
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800 p-4 md:p-8">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek'}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: window.innerWidth < 768 ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locales={[esLocale]}
              locale="es"
              events={events}
              selectable={true}
              select={handleDateSelect}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              eventClassNames="rounded-lg shadow-sm border-none font-bold text-[10px] md:text-xs p-1"
              nowIndicator={true}
            />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fc { 
          --fc-button-bg-color: transparent;
          --fc-button-border-color: #e2e8f0;
          --fc-button-hover-bg-color: #f8fafc;
          --fc-button-active-bg-color: #0ea5e9;
          --fc-button-active-border-color: #0ea5e9;
          --fc-border-color: #f1f5f9;
          font-family: 'Manrope', sans-serif;
        }
        .dark .fc {
          --fc-border-color: #1e293b;
          --fc-button-border-color: #334155;
          --fc-button-hover-bg-color: #1e293b;
          --fc-page-bg-color: #0f172a;
          color: white;
        }
        .fc .fc-toolbar-title {
          font-size: 1.1rem !important;
          font-weight: 800;
          text-transform: capitalize;
        }
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 1rem;
          }
          .fc .fc-toolbar-title {
            font-size: 0.9rem !important;
          }
          .fc .fc-button {
            padding: 0.4rem 0.6rem !important;
            font-size: 0.7rem !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
          }
          .fc-list-event-title {
            font-weight: 800 !important;
            color: #0ea5e9 !important;
          }
          .fc-list-day-side-text {
            font-weight: 900 !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
          }
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active, 
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #0ea5e9 !important;
          color: white !important;
        }
        .fc .fc-button-primary {
          color: #64748b;
          border-radius: 12px !important;
          transition: all 0.2s;
        }
        .dark .fc .fc-button-primary {
          color: #94a3b8;
        }
      `}} />

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-[40px] shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Agendar Turno</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><X /></button>
              </div>

              <form onSubmit={handleCreateTurn} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                  <select 
                    value={newTurn.paciente_id}
                    onChange={(e) => setNewTurn({ ...newTurn, paciente_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white transition-all outline-none"
                    required
                  >
                    <option value="">Elegir paciente...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                    <input 
                      type="date" 
                      value={newTurn.fecha}
                      onChange={(e) => setNewTurn({ ...newTurn, fecha: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white outline-none" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                    <input 
                      type="time" 
                      value={newTurn.hora}
                      onChange={(e) => setNewTurn({ ...newTurn, hora: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white outline-none" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo (Opcional)</label>
                  <input 
                    type="text" 
                    value={newTurn.motivo}
                    onChange={(e) => setNewTurn({ ...newTurn, motivo: e.target.value })}
                    placeholder="Ej: Evaluación inicial" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white outline-none transition-all" 
                  />
                </div>

                <button type="submit" className="w-full py-5 kinetic-gradient text-white rounded-[24px] font-bold uppercase text-xs shadow-xl active:scale-95 transition-all mt-4">Confirmar Turno</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalCalendar;

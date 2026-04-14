import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { Plus, Loader2, X, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessionalCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [newTurn, setNewTurn] = useState({
    paciente_id: '',
    fecha: '',
    hora: '',
    motivo: '',
    id: null
  });

  useEffect(() => {
    fetchEvents();
    fetchPatients();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        extendedProps: { 
          motivo: turn.motivo,
          paciente_id: turn.paciente_id
        },
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
    setIsEditMode(false);
    setSelectedEvent(null);
    setNewTurn({ paciente_id: '', fecha: date, hora: time, motivo: '', id: null });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    console.log("Event properties:", event.extendedProps);
    setIsEditMode(true);
    setSelectedEvent(event);
    setNewTurn({
      id: event.id,
      paciente_id: event.extendedProps.paciente_id,
      fecha: event.startStr.split('T')[0],
      hora: event.startStr.split('T')[1]?.substring(0, 5),
      motivo: event.extendedProps.motivo || ''
    });
    setShowModal(true);
  };

  const handleSaveTurn = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('turnos')
          .update({
            paciente_id: newTurn.paciente_id,
            fecha: newTurn.fecha,
            hora: newTurn.hora,
            motivo: newTurn.motivo
          })
          .eq('id', newTurn.id);
        if (error) throw error;
        toast.success('Turno actualizado');
      } else {
        const { error } = await supabase.from('turnos').insert([
          {
            paciente_id: newTurn.paciente_id,
            fecha: newTurn.fecha,
            hora: newTurn.hora,
            motivo: newTurn.motivo
          }
        ]);
        if (error) throw error;
        toast.success('Turno agendado');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(isEditMode ? 'Error al actualizar' : 'Error al agendar');
    }
  };

  const handleDeleteTurn = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este turno?')) return;
    
    try {
      const { error } = await supabase
        .from('turnos')
        .delete()
        .eq('id', newTurn.id);
      
      if (error) throw error;
      toast.success('Turno eliminado');
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error('Error al eliminar el turno');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-20 lg:mt-0">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Agenda Médica</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestión de turnos y disponibilidad</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          NUEVO TURNO
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[30px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-800 p-3 md:p-8 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>
        ) : (
          <div className="calendar-container">
            <FullCalendar
              key={isMobile ? 'mobile' : 'desktop'}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={isMobile ? 'listWeek' : 'timeGridWeek'}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek'
              }}
              locales={[esLocale]}
              locale="es"
              events={events}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
              eventClassNames="rounded-lg shadow-sm border-none font-bold text-[10px] md:text-xs p-1 cursor-pointer"
              nowIndicator={true}
            />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fc { 
          --fc-button-bg-color: #f8fafc;
          --fc-button-border-color: #e2e8f0;
          --fc-button-hover-bg-color: #f1f5f9;
          --fc-button-active-bg-color: #0ea5e9;
          --fc-button-text-color: #475569;
          --fc-button-hover-text-color: #0f172a;
          --fc-border-color: #f1f5f9;
        }
        .dark .fc {
          --fc-border-color: #1e293b;
          --fc-button-bg-color: #1e293b;
          --fc-button-border-color: #334155;
          --fc-button-hover-bg-color: #334155;
          --fc-button-text-color: #f1f5f9;
          color: white;
        }
        .dark .fc-col-header-cell-cushion {
          color: white !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1rem !important;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 768px) {
          .fc .fc-toolbar {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .fc .fc-toolbar-chunk:nth-child(2) {
            order: -1;
            width: 100%;
            text-align: center;
          }
          .fc .fc-toolbar-title {
            font-size: 1.2rem !important;
            margin-bottom: 5px;
          }
          .fc .fc-button {
            padding: 8px 12px !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            font-weight: 900 !important;
          }
          .fc-list-event-title {
            font-weight: 800 !important;
          }
        }
        .fc .fc-button-primary {
          border-radius: 12px !important;
          font-weight: 700;
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
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {isEditMode ? 'Gestionar Turno' : 'Agendar Turno'}
                </h2>
                <div className="flex gap-2">
                  {isEditMode && (
                    <button 
                      type="button"
                      onClick={handleDeleteTurn}
                      className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Eliminar Turno"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><X /></button>
                </div>
              </div>

              <form onSubmit={handleSaveTurn} className="space-y-6">
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

                <button type="submit" className="w-full py-5 kinetic-gradient text-white rounded-[24px] font-bold uppercase text-xs shadow-xl active:scale-95 transition-all mt-4">
                  {isEditMode ? 'Guardar Cambios' : 'Confirmar Turno'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfessionalCalendar;

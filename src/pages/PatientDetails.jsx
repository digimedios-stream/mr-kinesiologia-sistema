import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  Activity, 
  Shield,
  Loader2,
  Phone,
  CreditCard,
  DollarSign,
  AlertCircle,
  TrendingUp,
  History,
  Plus,
  Minus,
  CalendarDays,
  Wallet,
  X,
  Trash2,
  Edit2,
  FileText,
  Save,
  PlusCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sessionToPay, setSessionToPay] = useState(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');

  // Turno Modal States
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [turnoForm, setTurnoForm] = useState({ fecha: '', hora: '', motivo: '' });

  // Treatment History States
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [newTreatmentText, setNewTreatmentText] = useState('');
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);
  const [editingTreatmentText, setEditingTreatmentText] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: pData } = await supabase
        .from('pacientes')
        .select('*, obras_sociales(nombre)')
        .eq('id', id)
        .single();
      
      setPatient(pData);

      const { data: sData } = await supabase
        .from('sesiones_pagos')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha_sesion', { ascending: false });
      
      setSessions(sData || []);

      const { data: tData } = await supabase
        .from('turnos')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha', { ascending: false });
      
      setAppointments(tData || []);

      const { data: hData } = await supabase
        .from('historial_tratamientos')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha', { ascending: false });
      
      setTreatmentHistory(hData || []);

      const { data: payData } = await supabase
        .from('pagos')
        .select('*')
        .eq('paciente_id', id)
        .order('fecha', { ascending: false });
      
      setPayments(payData || []);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (sessionId, current, total, type) => {
    let newVal = current;
    if (type === 'add' && current < total) newVal++;
    if (type === 'sub' && current > 0) newVal--;
    
    if (newVal === current) return;

    try {
      const { error } = await supabase
        .from('sesiones_pagos')
        .update({ sesiones_asistidas: newVal })
        .eq('id', sessionId);
      
      if (error) throw error;
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar asistencias');
    }
  };

  const handleApplyPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(newPaymentAmount) || 0;
    if (amount <= 0) return toast.error('Ingresa un monto válido');

    const newMontoAbonado = (sessionToPay.monto_abonado || 0) + amount;
    const newSaldoPendiente = (sessionToPay.total_estimado || 0) - newMontoAbonado;

    try {
      const { error } = await supabase
        .from('sesiones_pagos')
        .update({
          monto_abonado: newMontoAbonado,
          saldo_pendiente: newSaldoPendiente
        })
        .eq('id', sessionToPay.id);
      
      if (error) throw error;

      // Register payment in history
      const { error: pError } = await supabase
        .from('pagos')
        .insert([{
          sesion_id: sessionToPay.id,
          paciente_id: id,
          monto: amount
        }]);
      
      if (pError) console.error('Error saving payment record:', pError);

      toast.success('Pago registrado correctamente');
      setShowPaymentModal(false);
      setNewPaymentAmount('');
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar pago');
    }
  };

  const handleDeleteTurno = async (turnoId) => {
    if (!window.confirm('¿Deseas eliminar este turno?')) return;
    try {
      const { error } = await supabase.from('turnos').delete().eq('id', turnoId);
      if (error) throw error;
      toast.success('Turno eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const handleOpenEditTurno = (turno) => {
    setSelectedTurno(turno);
    setTurnoForm({ fecha: turno.fecha, hora: turno.hora?.substring(0, 5), motivo: turno.motivo });
    setShowTurnoModal(true);
  };

  const handleUpdateTurno = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('turnos')
        .update(turnoForm)
        .eq('id', selectedTurno.id);
      if (error) throw error;
      toast.success('Turno actualizado');
      setShowTurnoModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan de sesiones? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await supabase.from('sesiones_pagos').delete().eq('id', sessionId);
      if (error) throw error;
      toast.success('Sesión eliminada correctamente');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar la sesión');
    }
  };

  // Treatment History CRUD
  const handleAddTreatment = async () => {
    if (!newTreatmentText.trim()) return toast.error('Escribí una descripción');
    try {
      const { error } = await supabase.from('historial_tratamientos').insert([{
        paciente_id: id,
        descripcion: newTreatmentText.trim()
      }]);
      if (error) throw error;
      toast.success('Registro agregado al historial');
      setNewTreatmentText('');
      fetchData();
    } catch (err) {
      toast.error('Error al agregar: ' + err.message);
    }
  };

  const handleUpdateTreatment = async (treatmentId) => {
    if (!editingTreatmentText.trim()) return;
    try {
      const { error } = await supabase
        .from('historial_tratamientos')
        .update({ descripcion: editingTreatmentText.trim() })
        .eq('id', treatmentId);
      if (error) throw error;
      toast.success('Registro actualizado');
      setEditingTreatmentId(null);
      setEditingTreatmentText('');
      fetchData();
    } catch (err) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteTreatment = async (treatmentId) => {
    if (!window.confirm('¿Eliminar este registro del historial?')) return;
    try {
      const { error } = await supabase.from('historial_tratamientos').delete().eq('id', treatmentId);
      if (error) throw error;
      toast.success('Registro eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const stats = sessions.reduce((acc, curr) => {
    acc.totalQty += (curr.cantidad_sesiones || 0);
    acc.totalAssisted += (curr.sesiones_asistidas || 0);
    acc.totalPaid += (curr.monto_abonado || 0);
    acc.totalDebt += (curr.saldo_pendiente || 0);
    return acc;
  }, { totalQty: 0, totalAssisted: 0, totalPaid: 0, totalDebt: 0 });

  if (loading) return <div className="p-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/pacientes')}
          className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          Directorio
        </button>
        <button 
          onClick={() => navigate('/calendario')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10"
        >
          <CalendarDays size={16} />
          Agendar Turno
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 p-4 opacity-5 dark:opacity-10 dark:text-white group-hover:scale-110 transition-transform"><Activity size={80} /></div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sesiones Asistidas</p>
          <p className="text-3xl font-manrope font-black text-slate-900 dark:text-white">
            {stats.totalAssisted} <span className="text-sm text-slate-400">/ {stats.totalQty}</span>
          </p>
          <div className="mt-2 text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
            <TrendingUp size={10} /> {stats.totalQty - stats.totalAssisted} pendientes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 p-4 opacity-5 dark:opacity-10 dark:text-white group-hover:scale-110 transition-transform"><DollarSign size={80} /></div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Monto Abonado</p>
          <p className="text-3xl font-manrope font-black text-slate-900 dark:text-white">${stats.totalPaid.toLocaleString()}</p>
        </div>

        <div className={`p-8 rounded-[40px] shadow-sm border relative overflow-hidden group ${stats.totalDebt > 0 ? 'bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-900/30' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800'}`}>
          <div className={`absolute right-0 bottom-0 p-4 opacity-5 dark:opacity-10 ${stats.totalDebt > 0 ? 'text-rose-500' : 'text-slate-400 dark:text-white'} group-hover:scale-110 transition-transform`}><AlertCircle size={80} /></div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Saldo Adeudado</p>
          <p className={`text-3xl font-manrope font-black ${stats.totalDebt > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            ${stats.totalDebt.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Info Area */}
        <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-50 dark:border-slate-800">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-24 h-24 rounded-3xl kinetic-gradient shadow-xl flex items-center justify-center text-white text-4xl font-black mb-4">
              {patient?.nombre?.[0]}{patient?.apellido?.[0]}
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-manrope font-black text-slate-900 dark:text-white leading-tight">
                {patient?.nombre} {patient?.apellido}
              </h2>
              <button 
                onClick={() => navigate(`/pacientes/${id}/editar`)}
                className="p-2 text-slate-300 hover:text-primary transition-colors"
                title="Editar Paciente"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><CreditCard size={18} /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI</p><p className="text-sm font-bold dark:text-white">{patient?.dni || '---'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</p><p className="text-sm font-bold dark:text-white">{patient?.telefono || '---'}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400"><Shield size={18} /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obra Social</p><p className="text-sm font-bold dark:text-white">{patient?.obras_sociales?.nombre || 'Particular'}</p></div>
            </div>
          </div>
        </div>

        {/* Treatment & Appointments Area */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-50 dark:border-slate-800">
          
          {/* Turnos Section */}
          <div className="mb-12">
            <h3 className="text-xl font-manrope font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <CalendarDays size={24} className="text-primary" /> Próximos Turnos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.filter(a => new Date(a.fecha) >= new Date(new Date().setHours(0,0,0,0))).map(a => (
                <div key={a.id} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/20 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {formatLocalDate(a.fecha)}
                      </p>
                      <p className="text-sm font-bold text-slate-500">{a.hora?.substring(0, 5)} hs</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEditTurno(a)} className="p-2 text-slate-400 hover:text-primary transition-colors"><Calendar size={16} /></button>
                    <button onClick={() => handleDeleteTurno(a.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
                  </div>
                </div>
              ))}
              {appointments.filter(a => new Date(a.fecha) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay turnos agendados</p>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-manrope font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <History size={24} className="text-primary" /> Historial de Tratamientos
          </h3>
          <div className="space-y-6">
            {sessions.map(s => (
              <div key={s.id} className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{new Date(s.fecha_sesion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                       {s.entrego_orden ? (
                         <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded">Orden Recibida</span>
                       ) : (
                         <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase rounded">Falta Orden</span>
                       )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Plan de {s.cantidad_sesiones} sesiones</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Attendance Tracker */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                      <button onClick={() => handleUpdateAttendance(s.id, s.sesiones_asistidas || 0, s.cantidad_sesiones, 'sub')} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><Minus size={14} /></button>
                      <div className="text-center px-2">
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{s.sesiones_asistidas || 0}</p>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Usadas</span>
                      </div>
                      <button onClick={() => handleUpdateAttendance(s.id, s.sesiones_asistidas || 0, s.cantidad_sesiones, 'add')} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors"><Plus size={14} /></button>
                    </div>

                    {/* Delete Session Button */}
                    <button 
                      onClick={() => handleDeleteSession(s.id)}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                      title="Eliminar sesión"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t dark:border-slate-800 pt-4 mt-2">
                  <div className="flex-1 mr-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">"{s.evolucion || 'Sin evolución registrada'}"</p>
                    
                    {/* Payments Mini-History */}
                    {payments.filter(p => p.sesion_id === s.id).length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <History size={10} /> Entregas / Abonos
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {payments.filter(p => p.sesion_id === s.id).map(p => (
                            <div key={p.id} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                              <span className="text-[10px] font-black text-emerald-500">${p.monto.toLocaleString()}</span>
                              <div className="w-[1px] h-3 bg-slate-100 dark:bg-slate-800" />
                              <span className="text-[9px] font-bold text-slate-400">
                                {new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                {' '}
                                {new Date(p.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white">${s.total_estimado}</p>
                      <span className={`text-[9px] font-black uppercase ${s.saldo_pendiente <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {s.saldo_pendiente <= 0 ? 'Pagado' : `Debe $${s.saldo_pendiente}`}
                      </span>
                    </div>
                    {s.saldo_pendiente > 0 && (
                      <button 
                        onClick={() => { setSessionToPay(s); setShowPaymentModal(true); }}
                        className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Wallet size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Editable Treatment History Section */}
          <div className="mt-12 pt-8 border-t dark:border-slate-800">
            <h3 className="text-xl font-manrope font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={24} className="text-primary" /> Notas del Historial Clínico
            </h3>

            {/* Add New Entry */}
            <div className="flex gap-3 mb-8">
              <textarea
                value={newTreatmentText}
                onChange={(e) => setNewTreatmentText(e.target.value)}
                placeholder="Agregar nueva nota al historial (ej: diagnóstico, evolución, cambio de tratamiento...)"
                rows="2"
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-primary outline-none transition-all resize-none"
              />
              <button
                onClick={handleAddTreatment}
                className="px-5 self-end py-3 kinetic-gradient text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all shrink-0"
              >
                <PlusCircle size={16} /> Agregar
              </button>
            </div>

            {/* History Timeline */}
            <div className="space-y-4">
              {treatmentHistory.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin notas en el historial clínico</p>
                </div>
              )}
              {treatmentHistory.map((entry) => (
                <div key={entry.id} className="group p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest shrink-0">
                      {new Date(entry.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {new Date(entry.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setEditingTreatmentId(entry.id); setEditingTreatmentText(entry.descripcion); }}
                        className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                      ><Edit2 size={14} /></button>
                      <button
                        onClick={() => handleDeleteTreatment(entry.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      ><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {editingTreatmentId === entry.id ? (
                    <div className="flex gap-2 mt-2">
                      <textarea
                        value={editingTreatmentText}
                        onChange={(e) => setEditingTreatmentText(e.target.value)}
                        rows="2"
                        autoFocus
                        className="flex-1 bg-white dark:bg-slate-900 border-2 border-primary rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none"
                      />
                      <div className="flex flex-col gap-1 self-end">
                        <button onClick={() => handleUpdateTreatment(entry.id)} className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"><Save size={14} /></button>
                        <button onClick={() => setEditingTreatmentId(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{entry.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-[40px] shadow-2xl p-10"
            >
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Registrar Pago del Paciente</h2>
              <form onSubmit={handleApplyPayment} className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl mb-4 text-xs font-bold text-slate-500 space-y-2">
                  <div className="flex justify-between text-slate-400"><span>Deuda de este plan:</span><span className="text-rose-500 font-black">${sessionToPay?.saldo_pendiente}</span></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto a abonar ahora</label>
                  <input type="number" value={newPaymentAmount} onChange={(e) => setNewPaymentAmount(e.target.value)} autoFocus className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500 rounded-2xl p-5 text-2xl font-black text-slate-900 dark:text-white outline-none" placeholder="0" />
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-bold uppercase text-xs shadow-xl active:scale-95 transition-all">Confirmar Abono</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Turno Modal */}
      <AnimatePresence>
        {showTurnoModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowTurnoModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-[40px] shadow-2xl p-10"
            >
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Reprogramar Turno</h2>
              <form onSubmit={handleUpdateTurno} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
                    <input type="date" value={turnoForm.fecha} onChange={(e) => setTurnoForm({...turnoForm, fecha: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</label>
                    <input type="time" value={turnoForm.hora} onChange={(e) => setTurnoForm({...turnoForm, hora: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl p-4 text-sm font-bold dark:text-white outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 kinetic-gradient text-white rounded-2xl font-bold uppercase text-xs shadow-xl active:scale-95 transition-all">Guardar Cambios</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDetails;

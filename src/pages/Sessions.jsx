import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Plus, 
  ChevronRight, 
  DollarSign, 
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Shield,
  Trash2,
  X,
  PlusCircle,
  ClipboardList,
  Eye,
  UserCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Sessions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [evolution, setEvolution] = useState('');
  
  const [qty, setQty] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [plusMonto, setPlusMonto] = useState('');
  const [hasOrder, setHasOrder] = useState(false);
  const [paid, setPaid] = useState('');
  const [billingCode, setBillingCode] = useState('');
  const [billingDesc, setBillingDesc] = useState('');

  const total = useMemo(() => {
    const q = parseFloat(qty) || 0;
    const u = parseFloat(unitCost) || 0;
    const p = parseFloat(plusMonto) || 0;
    return q * (u + p);
  }, [qty, unitCost, plusMonto]);

  const pending = useMemo(() => total - (parseFloat(paid) || 0), [total, paid]);

  useEffect(() => {
    fetchSessions();
    fetchPatients();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sesiones_pagos')
        .select('*, pacientes(nombre, apellido, obras_sociales(nombre))')
        .order('fecha_sesion', { ascending: false });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      toast.error('Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from('pacientes').select('*, obras_sociales(nombre, plus_cost)').order('apellido');
    if (data) setPatients(data);
  };

  const handlePatientChange = (e) => {
    const id = e.target.value;
    const p = patients.find(item => item.id === id);
    setSelectedPatientData(p || null);
    if (p && p.obras_sociales) {
      setBillingDesc(`Cobertura por ${p.obras_sociales.nombre}`);
      setPlusMonto(p.obras_sociales.plus_cost || 0);
    } else {
      setBillingDesc('');
      setPlusMonto(0);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedPatientData || !evolution) return toast.error('Completa los campos obligatorios');

    try {
      const { error } = await supabase.from('sesiones_pagos').insert([{
        paciente_id: selectedPatientData.id,
        evolucion: evolution,
        cantidad_sesiones: parseInt(qty) || 1,
        costo_unitario: parseFloat(unitCost) || 0,
        plus_monto: parseFloat(plusMonto) || 0,
        entrego_orden: hasOrder,
        total_estimado: total,
        monto_abonado: parseFloat(paid) || 0,
        saldo_pendiente: pending,
        codigo_prestacion: billingCode,
        descripcion_nomenclador: billingDesc,
        fecha_sesion: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;
      toast.success('Sesión registrada');
      setShowModal(false);
      resetForm();
      fetchSessions();
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('¿Eliminar definitivamente?')) return;
    try {
      const { error } = await supabase.from('sesiones_pagos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Eliminado');
      fetchSessions();
    } catch (err) {
      toast.error('Error al borrar');
    }
  };

  const resetForm = () => {
    setSelectedPatientData(null);
    setEvolution('');
    setQty('1');
    setUnitCost('');
    setPlusMonto('');
    setHasOrder(false);
    setPaid('');
    setBillingCode('');
    setBillingDesc('');
  };

  const filteredSessions = sessions.filter(s => 
    `${s.pacientes?.nombre} ${s.pacientes?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Control de Sesiones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Historial médico y contable</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          REGISTRAR SESIÓN
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text">Paciente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evolución</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{session.pacientes?.nombre} {session.pacientes?.apellido}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{session.pacientes?.obras_sociales?.nombre || 'Particular'}</span>
                          {session.entrego_orden ? (
                            <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase rounded">Orden OK</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase rounded">Falta Orden</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs text-xs text-slate-600 dark:text-slate-400 italic">
                      {session.evolucion}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">${session.total_estimado}</p>
                      <span className={`text-[9px] font-black uppercase ${session.saldo_pendiente <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {session.saldo_pendiente <= 0 ? 'Liquidado' : `Debe $${session.saldo_pendiente}`}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/pacientes/${session.paciente_id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          title="Ver Ficha Completa"
                        >
                          <UserCircle2 size={18} />
                          FICHA
                        </button>
                        <button 
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          title="Borrar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-slate-950 w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-manrope">Nueva Evolución / Tratamiento</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><X /></button>
              </div>

              <form onSubmit={handleCreateSession} className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-7 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Elegir Paciente</label>
                    <div className="relative">
                      <select 
                        onChange={handlePatientChange}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:border-primary appearance-none transition-all"
                      >
                        <option value="">Buscar paciente...</option>
                        {patients.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>
                    {selectedPatientData && (
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <div className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-widest">
                          COBERTURA: {selectedPatientData.obras_sociales?.nombre || 'PARTICULAR'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evolución / Descripción Médica</label>
                    <textarea value={evolution} onChange={(e) => setEvolution(e.target.value)} rows="6" placeholder="¿Qué se realizó en la sesión hoy?" className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm dark:text-white outline-none focus:border-primary transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Prestación</label>
                      <input type="text" value={billingCode} onChange={(e) => setBillingCode(e.target.value)} placeholder="Ej. 25.01" className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm dark:text-white outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomenclador</label>
                      <input type="text" value={billingDesc} onChange={(e) => setBillingDesc(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm dark:text-white outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[32px] space-y-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800 pb-3">Liquidación Financiera</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Cantidad Sesiones</span>
                      <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-20 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-xl p-2 text-center dark:text-white font-black transition-all" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Costo Unitario ($)</span>
                      <input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0" className="w-32 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-xl p-3 text-right dark:text-white font-black transition-all" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Cobro Plus ($)</span>
                      <input type="number" value={plusMonto} onChange={(e) => setPlusMonto(e.target.value)} placeholder="0" className="w-20 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-xl p-2 text-center text-primary font-black transition-all" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-t dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-500">¿Entregó Orden?</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={hasOrder} onChange={(e) => setHasOrder(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-slate-900 dark:text-white">Monto Total</span>
                      <span className="text-2xl font-black text-primary">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-500/5 p-8 rounded-[32px] space-y-4 border-2 border-emerald-100 dark:border-emerald-900/10">
                    <label className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Monto Abonado Hoy</label>
                    <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="0" className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xl font-black text-emerald-600 outline-none" />
                    <div className="flex justify-between text-[10px] font-black uppercase text-rose-500">
                      {pending > 0 && `Saldo pendiente: $${pending}`}
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 kinetic-gradient text-white rounded-[24px] font-bold uppercase text-xs shadow-xl active:scale-95 transition-all">Confirmar Registro</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sessions;

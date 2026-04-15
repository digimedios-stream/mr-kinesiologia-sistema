import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserPlus, 
  ArrowRight,
  Loader2,
  Trash2,
  Edit3,
  Phone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*, obras_sociales(nombre)')
        .order('apellido', { ascending: true });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      toast.error('Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer y borrará también sus turnos y sesiones.`)) {
      try {
        const { error } = await supabase
          .from('pacientes')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Paciente eliminado correctamente');
        fetchPatients();
      } catch (err) {
        toast.error('Error al eliminar: ' + err.message);
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni?.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Directorio de Pacientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Gestiona la ficha técnica de tus pacientes</p>
        </div>
        <button 
          onClick={() => navigate('/nuevo-paciente')}
          className="flex items-center gap-2 px-6 py-3 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 transition-all"
        >
          <UserPlus size={16} strokeWidth={3} />
          NUEVO PACIENTE
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-50 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
            <Loader2 size={40} className="animate-spin text-primary/30" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Sincronizando...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Paciente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">DNI</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Obra Social</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {p.nombre[0]}{p.apellido[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{p.apellido}, {p.nombre}</p>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">ID: {p.id.substring(0,8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">{p.dni || '---'}</span>
                    </td>
                    <td className="px-6 py-5">
                      {p.obras_sociales ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{p.obras_sociales.nombre}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{p.plan_obra_social || 'Base'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600 font-bold italic">Particular</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/pacientes/${p.id}`)}
                          className="flex items-center gap-2 pl-4 pr-3 py-2 bg-primary-container dark:bg-primary/20 text-primary dark:text-primary-light rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-container/80 transition-colors"
                        >
                          Ficha
                          <ArrowRight size={12} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => navigate(`/pacientes/${p.id}/editar`)}
                          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(p.id, `${p.nombre} ${p.apellido}`)}
                          className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-300 hover:text-red-500 transition-colors"
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
        ) : (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-bold italic">No se encontraron pacientes registrados.</div>
        )}
      </div>
    </div>
  );
};

export default Patients;

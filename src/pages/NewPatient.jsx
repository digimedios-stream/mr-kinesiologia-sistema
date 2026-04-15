import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserPlus, 
  ArrowLeft, 
  Save, 
  User, 
  CreditCard, 
  Phone, 
  Shield, 
  ClipboardList,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Componente InputGroup movido FUERA para evitar pérdida de foco en cada re-render
const InputGroup = ({ icon: Icon, label, name, value, onChange, type = "text", placeholder, options = null }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-[14px] text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 focus:bg-white dark:focus:bg-slate-800 focus:border-primary transition-all duration-200 outline-none appearance-none"
        >
          <option value="">Seleccionar...</option>
          {options.map(opt => <option key={opt.id} value={opt.id}>{opt.nombre}</option>)}
        </select>
      ) : (
        <input 
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 focus:bg-white dark:focus:bg-slate-800 focus:border-primary transition-all duration-200 outline-none"
        />
      )}
    </div>
  </div>
);

const NewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [insurances, setInsurances] = useState([]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    obra_social_id: '',
    plan_obra_social: '',
    indicaciones: ''
  });

  useEffect(() => {
    fetchInsurances();
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchInsurances = async () => {
    const { data } = await supabase.from('obras_sociales').select('id, nombre').order('nombre');
    if (data) setInsurances(data);
  };

  const fetchPatient = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          dni: data.dni || '',
          telefono: data.telefono || '',
          obra_social_id: data.obra_social_id || '',
          plan_obra_social: data.plan_obra_social || '',
          indicaciones: data.indicaciones || ''
        });
      }
    } catch (err) {
      toast.error('Error al cargar datos del paciente');
      navigate('/pacientes');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido) {
      return toast.error('El nombre y el apellido son requeridos');
    }

    setLoading(true);
    try {
      // Clean data: convert empty strings to null for optional fields
      const cleanedData = { ...formData };
      ['dni', 'telefono', 'obra_social_id', 'plan_obra_social', 'indicaciones'].forEach(field => {
        if (cleanedData[field] === '') cleanedData[field] = null;
      });

      if (id) {
        const { error } = await supabase
          .from('pacientes')
          .update(cleanedData)
          .eq('id', id);
        if (error) throw error;
        toast.success('¡Paciente actualizado con éxito!');
      } else {
        const { error } = await supabase.from('pacientes').insert([cleanedData]);
        if (error) throw error;
        toast.success('¡Paciente registrado con éxito!');
      }
      
      setTimeout(() => navigate('/pacientes'), 1500);
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
        <Loader2 size={40} className="animate-spin text-primary/30" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Regresar
          </button>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">
            {id ? 'Editar Paciente' : 'Registro de Paciente'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {id ? 'Actualiza la información del paciente' : 'Completa la ficha técnica para iniciar el tratamiento'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800 relative overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup icon={User} label="Nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Macarena" />
                <InputGroup icon={User} label="Apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Ej. Román" />
                <InputGroup icon={CreditCard} label="DNI / Documento" name="dni" value={formData.dni} onChange={handleInputChange} placeholder="Sin puntos ni espacios" />
                <InputGroup icon={Phone} label="Teléfono / WhatsApp" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="+54 9 11..." />
                <InputGroup icon={Shield} label="Obra Social" name="obra_social_id" value={formData.obra_social_id} onChange={handleInputChange} options={insurances} />
                <InputGroup icon={Shield} label="Plan" name="plan_obra_social" value={formData.plan_obra_social} onChange={handleInputChange} placeholder="Ej. 210, Cartilla, etc" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Indicaciones Médicas / Observaciones</label>
                <div className="relative group">
                  <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary transition-colors">
                    <ClipboardList size={18} strokeWidth={2.5} />
                  </div>
                  <textarea 
                    name="indicaciones"
                    value={formData.indicaciones}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Detalles sobre el diagnóstico o precauciones..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 focus:bg-white dark:focus:bg-slate-800 focus:border-primary transition-all duration-200 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="px-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="kinetic-gradient px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-3 shadow-xl shadow-primary/20 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{id ? 'Guardar Cambios' : 'Guardar Paciente'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 dark:opacity-5 group-hover:scale-110 transition-transform dark:text-white">
              <UserPlus size={160} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white">
                  {id ? 'Actualización de datos' : 'Ayuda al registro'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {id 
                    ? 'Modifica los campos necesarios y guarda los cambios para actualizar la ficha.' 
                    : 'Solo Nombre y Apellido son obligatorios. DNI y teléfono son opcionales.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPatient;

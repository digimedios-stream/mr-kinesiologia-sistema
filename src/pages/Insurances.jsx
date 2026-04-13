import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Phone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X,
  CreditCard,
  PlusCircle,
  Hash,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Insurances = () => {
  const [loading, setLoading] = useState(true);
  const [insurances, setInsurances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    descripcion_nomenclador: '',
    plus_cost: 0,
    planes: []
  });

  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    fetchInsurances();
  }, []);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('obras_sociales')
        .select('*, planes:obras_sociales_planes(*)');
      
      if (error) throw error;
      setInsurances(data || []);
    } catch (err) {
      toast.error('Error al cargar obras sociales');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return toast.error('El nombre es obligatorio');

    try {
      let entityId = editingEntity?.id;

      if (editingEntity) {
        const { error } = await supabase
          .from('obras_sociales')
          .update({
            nombre: formData.nombre,
            telefono: formData.telefono,
            descripcion_nomenclador: formData.descripcion_nomenclador,
            plus_cost: parseFloat(formData.plus_cost) || 0
          })
          .eq('id', entityId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('obras_sociales')
          .insert([{
            nombre: formData.nombre,
            telefono: formData.telefono,
            descripcion_nomenclador: formData.descripcion_nomenclador,
            plus_cost: parseFloat(formData.plus_cost) || 0
          }])
          .select()
          .single();
        if (error) throw error;
        entityId = data.id;
      }

      // Sync planes
      if (editingEntity) {
        await supabase.from('obras_sociales_planes').delete().eq('obra_social_id', entityId);
      }
      
      if (formData.planes.length > 0) {
        const planesToInsert = formData.planes.map(p => ({
          obra_social_id: entityId,
          nombre_plan: p.nombre_plan
        }));
        await supabase.from('obras_sociales_planes').insert(planesToInsert);
      }

      toast.success('Cambios guardados');
      setShowEditor(false);
      resetForm();
      fetchInsurances();
    } catch (err) {
      toast.error('Error al guardar: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', telefono: '', descripcion_nomenclador: '', plus_cost: 0, planes: [] });
    setEditingEntity(null);
  };

  const addPlan = () => {
    if (!newPlanName) return;
    setFormData({
      ...formData,
      planes: [...formData.planes, { nombre_plan: newPlanName }]
    });
    setNewPlanName('');
  };

  const removePlan = (index) => {
    const newPlanes = formData.planes.filter((_, i) => i !== index);
    setFormData({ ...formData, planes: newPlanes });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white leading-tight">Obras Sociales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configuración de entidades y planes de cobertura</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowEditor(true); }}
          className="flex items-center gap-2 px-6 py-3 kinetic-gradient text-white text-xs font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          NUEVA ENTIDAD
        </button>
      </div>

      <div className="relative group max-w-xl">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar obra social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 size={40} className="animate-spin text-primary/30" /></div>
        ) : insurances.map((os) => (
          <motion.div 
            layout
            key={os.id}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group relative border-b-4 border-b-primary/20"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                <Shield size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingEntity(os); setFormData({ ...os, planes: os.planes || [] }); setShowEditor(true); }}
                  className="p-2 text-slate-300 hover:text-primary transition-colors"
                ><Edit2 size={16} /></button>
                <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>

            <h3 className="text-xl font-manrope font-extrabold text-slate-900 dark:text-white mb-2">{os.nombre}</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Phone size={14} className="text-primary" /> {os.telefono || 'Sin teléfono'}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <DollarSign size={14} /> Plus: ${os.plus_cost || 0}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {os.planes?.map((p, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase rounded-lg border border-slate-100 dark:border-slate-700">
                  {p.nombre_plan}
                </span>
              ))}
              {(!os.planes || os.planes.length === 0) && <span className="text-[10px] font-bold text-slate-300 italic">Sin planes configurados</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Slide-out Editor Panel */}
      <AnimatePresence>
        {showEditor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowEditor(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-slate-950 z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b dark:border-slate-900 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-manrope font-black text-slate-900 dark:text-white">{editingEntity ? 'Editar Entidad' : 'Nueva Entidad'}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detalles de Facturación</p>
                </div>
                <button onClick={() => setShowEditor(false)} className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-2xl"><X /></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input 
                      type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej. OSDE" className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input 
                      type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Nomenclador</label>
                    <textarea 
                      value={formData.descripcion_nomenclador} onChange={(e) => setFormData({ ...formData, descripcion_nomenclador: e.target.value })}
                      placeholder="Detalles sobre normativas de facturación..."
                      rows="4" className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Costo Plus Adicional ($)</label>
                    <input 
                      type="number" value={formData.plus_cost} onChange={(e) => setFormData({ ...formData, plus_cost: e.target.value })}
                      placeholder="0" className="w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl px-5 py-4 text-sm font-semibold dark:text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t dark:border-slate-900">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Planes de la Entidad</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)}
                        placeholder="Nombre plan..." className="bg-slate-50 dark:bg-slate-900 text-[10px] p-2 rounded-lg outline-none border border-transparent focus:border-primary dark:text-white"
                      />
                      <button type="button" onClick={addPlan} className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"><Plus size={14} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {formData.planes.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] font-bold dark:text-white">{p.nombre_plan}</span>
                        <button type="button" onClick={() => removePlan(i)} className="text-rose-400 hover:text-rose-600"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-5 kinetic-gradient text-white rounded-3xl font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Guardar Cambios
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Insurances;

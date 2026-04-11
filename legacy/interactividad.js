/* 
 * JavaScript para Interactividad
 * MR Kinesiología - Sistema de Gestión
 */

function initMRKInteractivity() {
    console.log("Iniciando interactividad de MR Kinesiología...");

    if (!window.sbClient) {
        console.error("Supabase Client no encontrado.");
        return;
    }

    // 1. Manejo del Formulario de Nuevo Paciente
    const patientForm = document.getElementById('nuevoPacienteForm');
    if (patientForm && !patientForm.hasAttribute('data-bound')) {
        patientForm.setAttribute('data-bound', 'true');
        patientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btnSave = patientForm.querySelector('button[type="submit"]');
            const messageDiv = document.getElementById('formMessage');
            
            const originalBtnHtml = btnSave.innerHTML;
            btnSave.disabled = true;
            btnSave.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">sync</span> Guardando...';
            
            const formData = {
                nombre: document.getElementById('firstName').value,
                apellido: document.getElementById('lastName').value,
                dni: document.getElementById('dni').value,
                telefono: document.getElementById('phone').value,
                obra_social_id: document.getElementById('healthInsurance').value !== 'other' ? document.getElementById('healthInsurance').value : null,
                plan_obra_social: document.getElementById('healthInsurance').value === 'other' ? document.getElementById('otherInsurance').value : null,
                indicaciones: document.getElementById('observations').value,
                created_at: new Date().toISOString()
            };

            try {
                const { error } = await window.sbClient.from('pacientes').insert([formData]);
                if (error) throw error;
                
                if (messageDiv) messageDiv.innerHTML = '<div class="p-4 bg-teal-50 text-teal-700 rounded-lg font-bold text-center text-sm">¡Paciente guardado con éxito!</div>';
                setTimeout(() => { if (window.showView) window.showView('pacientes'); }, 1500);
            } catch (err) {
                console.error("Error al guardar paciente:", err);
                if (messageDiv) messageDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg font-bold text-center text-sm">Error: ${err.message}</div>`;
                btnSave.disabled = false;
                btnSave.innerHTML = originalBtnHtml;
            }
        });
    }

    // 2. Selects dinámicos
    const insuranceSelect = document.getElementById('healthInsurance');
    if (insuranceSelect) {
        insuranceSelect.onchange = () => {
            const otherField = document.getElementById('otherInsuranceField');
            if (otherField) otherField.classList.toggle('hidden', insuranceSelect.value !== 'other');
        };
    }

    // 3. Carga automática de tablas
    if (document.getElementById('pacientesTableBody')) window.loadPacientes();
    if (document.getElementById('obrasSocialesTableBody')) window.loadObrasSociales();
    
    // 4. Calendario
    if (document.getElementById('calendar')) {
        setTimeout(() => {
            window.initCalendar();
            window.loadPatientsForAppointments();
            window.initMiniCalendar();
        }, 100);
    }

    // 5. Botones Globales con protección de doble binding
    const btnConfirmApp = document.getElementById('btnConfirmAppointment');
    if (btnConfirmApp && !btnConfirmApp.hasAttribute('data-bound')) {
        btnConfirmApp.setAttribute('data-bound', 'true');
        btnConfirmApp.onclick = () => window.saveAppointment();
    }

    const btnSaveRec = document.getElementById('btnSaveSessionRecord');
    if (btnSaveRec && !btnSaveRec.hasAttribute('data-bound')) {
        btnSaveRec.setAttribute('data-bound', 'true');
        btnSaveRec.onclick = () => window.saveSessionRecord();
    }
}

// --- FUNCIONES DE CARGA ---

window.loadPacientes = async function() {
    const tableBody = document.getElementById('pacientesTableBody');
    if (!tableBody) return;

    try {
        const { data: pacientes, error } = await window.sbClient
            .from('pacientes')
            .select(`
                *,
                obras_sociales (nombre)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!pacientes || pacientes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-10 text-center text-slate-400">No hay pacientes registrados aún.</td></tr>';
            return;
        }

        tableBody.innerHTML = pacientes.map(p => `
            <tr class="hover:bg-slate-50 transition-colors group cursor-pointer" onclick="window.showPatientSessions('${p.id}')">
                <td class="px-6 py-4 font-bold text-on-surface">${p.nombre} ${p.apellido}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${p.obras_sociales?.nombre || p.plan_obra_social || 'Particular'}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${p.dni || '-'}</td>
                <td class="px-6 py-4 text-sm text-slate-500 font-medium">Sin turnos</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-extrabold uppercase">Activo</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                </td>
            </tr>
        `).join('');

        const countEl = document.getElementById('totalPacientesCargados');
        if (countEl) countEl.textContent = pacientes.length;

    } catch (err) {
        console.error("Error al cargar pacientes:", err);
        tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500 font-bold">Error de conexión: ${err.message}</td></tr>`;
    }
};

window.loadObrasSociales = async function() {
    const tableBody = document.getElementById('obrasSocialesTableBody');
    if (!tableBody) return;

    try {
        const { data: osData, error } = await window.sbClient
            .from('obras_sociales')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw error;

        if (!osData || osData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-400">Sin obras sociales registradas.</td></tr>';
            return;
        }

        tableBody.innerHTML = osData.map((os, idx) => `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 text-xs font-bold text-slate-400">#${idx + 1}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center font-bold text-[10px] text-teal-600">${os.nombre.substring(0,2).toUpperCase()}</div>
                        <span class="font-bold text-sm text-on-surface">${os.nombre}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-slate-600">${os.codigo || '-'}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${os.telefono || '-'}</td>
                <td class="px-6 py-4 text-sm text-slate-500">${os.email || '-'}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter">? pac.</span></td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><span class="material-symbols-outlined text-lg">visibility</span></button>
                        <button class="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"><span class="material-symbols-outlined text-lg">edit</span></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error al cargar Obras Sociales:", err);
        tableBody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-red-500">Error: ${err.message}</td></tr>`;
    }
};

window.saveObraSocial = async function() {
    const btn = document.querySelector('#newAssuranceModal button[onclick*="saveObraSocial"]');
    const formData = {
        nombre: document.getElementById('os-nombre').value,
        codigo: document.getElementById('os-codigo').value,
        telefono: document.getElementById('os-telefono').value,
        email: document.getElementById('os-email').value,
        estado: 'activa'
    };

    if (!formData.nombre) return alert("Se requiere el nombre.");

    const originalHtml = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = 'Guardando...';

    try {
        const { error } = await window.sbClient.from('obras_sociales').insert([formData]);
        if (error) throw error;
        
        document.getElementById('newAssuranceModal').classList.add('hidden');
        window.loadObrasSociales();
    } catch (err) { alert("Error al guardar: " + err.message); }
    finally { btn.disabled = false; btn.innerHTML = originalHtml; }
};

// --- SESIONES Y FINANZAS ---

window.showPatientSessions = function(patientId) {
    if (typeof showView === 'function') {
        window.currentViewContext = patientId;
        showView('sesiones');
    }
};

window.loadPatientProfile = async function(patientId) {
    if (!patientId) return;
    try {
        const { data: patient, error } = await window.sbClient
            .from('pacientes')
            .select('*, obras_sociales(nombre)')
            .eq('id', patientId)
            .single();

        if (error) throw error;

        if (document.getElementById('sp-patient-name')) document.getElementById('sp-patient-name').textContent = `${patient.nombre} ${patient.apellido}`;
        if (document.getElementById('sp-patient-dni')) document.getElementById('sp-patient-dni').textContent = patient.dni || '-';
        if (document.getElementById('sp-patient-phone')) document.getElementById('sp-patient-phone').textContent = patient.telefono || '-';
        if (document.getElementById('sp-patient-os')) document.getElementById('sp-patient-os').textContent = patient.obras_sociales?.nombre || patient.plan_obra_social || 'Particular';

        window.updatePatientFinances(patientId);
        window.loadPatientSessions(patientId);
    } catch (err) { console.error(err); }
};

window.updatePatientFinances = async function(patientId) {
    try {
        const { data: pagos, error } = await window.sbClient.from('sesiones_pagos').select('monto_abonado').eq('paciente_id', patientId);
        if (error) throw error;

        const totalAbonado = pagos.reduce((sum, p) => sum + (Number(p.monto_abonado) || 0), 0);
        const totalTratamiento = 30000;
        const saldoPendiente = totalTratamiento - totalAbonado;
        const porcentaje = Math.min(100, Math.round((totalAbonado / totalTratamiento) * 100));

        const updateEl = (id, text) => { if (document.getElementById(id)) document.getElementById(id).textContent = text; };
        updateEl('sp-saldo-card-value', `$${saldoPendiente.toLocaleString()}`);
        updateEl('sp-saldo-card-text', `Avance de pagos: ${porcentaje}%`);
        if (document.getElementById('sp-saldo-card-progress')) document.getElementById('sp-saldo-card-progress').style.width = `${porcentaje}%`;
        
        updateEl('sp-desglose-total', `$${totalTratamiento.toLocaleString()}`);
        updateEl('sp-desglose-abonado', `$${totalAbonado.toLocaleString()}`);
        updateEl('sp-desglose-resto', `$${saldoPendiente.toLocaleString()}`);
    } catch (err) { console.error(err); }
};

window.loadPatientSessions = async function(patientId) {
    const container = document.getElementById('sesiones-list-container');
    if (!container) return;
    try {
        const { data: sesiones, error } = await window.sbClient.from('sesiones_pagos').select('*').eq('paciente_id', patientId).order('fecha_sesion', { ascending: false });
        if (error) throw error;

        if (!sesiones || sesiones.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-slate-400">Sin sesiones o pagos aún.</div>';
            return;
        }

        container.innerHTML = sesiones.map(s => `
            <div class="p-4 sm:p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">${s.numero_sesion || '?'}</div>
                <div class="flex-grow">
                    <div class="text-sm font-bold">${new Date(s.fecha_sesion + 'T12:00:00').toLocaleDateString()}</div>
                    <div class="flex gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">Registro Ok</span>
                        ${s.monto_abonado > 0 ? `<span class="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">Abonó $${Number(s.monto_abonado).toLocaleString()}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
};

window.saveSessionRecord = async function() {
    if (!window.currentViewContext) return;
    const btn = document.getElementById('btnSaveSessionRecord');
    const formData = {
        paciente_id: window.currentViewContext,
        fecha_sesion: document.getElementById('in-fecha-atencion').value || new Date().toISOString().split('T')[0],
        numero_sesion: Number(document.getElementById('in-num-sesion').value) || null,
        evolucion: document.getElementById('ta-evolucion').value,
        monto_abonado: Number(document.getElementById('in-monto').value) || 0,
        medio_pago: document.getElementById('sel-medio-pago').value
    };

    const originalHtml = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = 'Guardando...';

    try {
        const { error } = await window.sbClient.from('sesiones_pagos').insert([formData]);
        if (error) throw error;
        document.getElementById('newSessionModal').classList.add('hidden');
        window.loadPatientProfile(window.currentViewContext);
    } catch (err) { alert(err.message); }
    finally { btn.disabled = false; btn.innerHTML = originalHtml; }
};

// --- CALENDARIO ---

window.initCalendar = function() {
    const el = document.getElementById('calendar');
    if (!el || !window.FullCalendar) return;
    
    // Si ya existe instancia, solo renderizar
    if (window.mrkCalendar) {
        window.mrkCalendar.render();
        window.mrkCalendar.updateSize();
        return;
    }

    window.mrkCalendar = new FullCalendar.Calendar(el, {
        initialView: 'timeGridWeek',
        locale: 'es',
        firstDay: 1,
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridDay,timeGridWeek' },
        events: async function(info, success, failure) {
            try {
                const { data, error } = await window.sbClient.from('turnos').select('*, pacientes(nombre, apellido)');
                if (error) throw error;
                success(data.map(t => ({
                    id: t.id,
                    title: `${t.pacientes?.nombre} ${t.pacientes?.apellido} - ${t.motivo || 'Sesión'}`,
                    start: `${t.fecha}T${t.hora}`,
                    allDay: false
                })));
            } catch (err) { failure(err); }
        }
    });
    window.mrkCalendar.render();
};

window.saveAppointment = async function() {
    const btn = document.getElementById('btnConfirmAppointment');
    if (!btn) return;
    const formData = {
        paciente_id: document.getElementById('sel-turno-paciente').value,
        fecha: document.getElementById('in-turno-fecha').value,
        hora: document.getElementById('in-turno-hora').value,
        sala: document.getElementById('sel-turno-sala').value,
        motivo: document.getElementById('in-turno-motivo').value,
        estado: 'pendiente'
    };

    if (!formData.paciente_id || !formData.fecha) return alert("Completa los campos.");

    const original = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = 'Agendando...';

    try {
        const { error } = await window.sbClient.from('turnos').insert([formData]);
        if (error) throw error;
        document.getElementById('newAppointmentModal').classList.add('hidden');
        if (window.mrkCalendar) window.mrkCalendar.refetchEvents();
    } catch (err) { alert(err.message); }
    finally { btn.disabled = false; btn.innerHTML = original; }
};

window.loadPatientsForAppointments = async function() {
    const select = document.getElementById('sel-turno-paciente');
    if (!select) return;
    const { data } = await window.sbClient.from('pacientes').select('id, nombre, apellido').order('apellido');
    if (data) select.innerHTML = data.map(p => `<option value="${p.id}">${p.apellido}, ${p.nombre}</option>`).join('');
};

window.miniCalState = { currentDate: new Date() };

window.initMiniCalendar = function() {
    const grid = document.getElementById('mini-days-grid');
    if (!grid) return;
    const now = window.miniCalState.currentDate;
    const year = now.getFullYear();
    const month = now.getMonth();
    const names = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    if (document.getElementById('mini-month-name')) document.getElementById('mini-month-name').textContent = `${names[month]} ${year}`;
    
    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('span'));
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('span');
        day.className = 'p-1 cursor-pointer hover:bg-teal-50 rounded text-center text-xs font-semibold';
        day.textContent = i;
        day.onclick = () => { if(window.mrkCalendar) window.mrkCalendar.gotoDate(new Date(year, month, i)); };
        grid.appendChild(day);
    }
};

// Auto-run on load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initMRKInteractivity();
    if (document.getElementById('sp-patient-name') && window.currentViewContext) window.loadPatientProfile(window.currentViewContext);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initMRKInteractivity();
        if (document.getElementById('sp-patient-name') && window.currentViewContext) window.loadPatientProfile(window.currentViewContext);
    });
}
-- Table: obras_sociales
create table if not exists obras_sociales (
    id uuid default gen_random_uuid() primary key,
    nombre text not null,
    tipo_convenio text,
    plazo_pago integer,
    nomenclador text,
    comentarios text,
    estado text default 'activa',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: pacientes
create table if not exists pacientes (
    id uuid default gen_random_uuid() primary key,
    nombre text not null,
    apellido text not null,
    dni text unique,
    telefono text,
    obra_social_id uuid references obras_sociales(id),
    plan_obra_social text,
    indicaciones text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: turnos
create table if not exists turnos (
    id uuid default gen_random_uuid() primary key,
    paciente_id uuid references pacientes(id) not null,
    fecha date not null,
    hora time not null,
    sala text,
    motivo text,
    estado text default 'pendiente',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: sesiones_pagos
create table if not exists sesiones_pagos (
    id uuid default gen_random_uuid() primary key,
    paciente_id uuid references pacientes(id) not null,
    turno_id uuid references turnos(id),
    fecha_sesion date not null,
    numero_sesion integer,
    evolucion text,
    monto_abonado numeric default 0,
    medio_pago text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies Setup
alter table obras_sociales enable row level security;
alter table pacientes enable row level security;
alter table turnos enable row level security;
alter table sesiones_pagos enable row level security;

-- Allow anonymous access for the mockup application (To be restricted later)
create policy "Allow public read access on obras_sociales" on obras_sociales for select using (true);
create policy "Allow public insert access on obras_sociales" on obras_sociales for insert with check (true);
create policy "Allow public update access on obras_sociales" on obras_sociales for update using (true);

create policy "Allow public read access on pacientes" on pacientes for select using (true);
create policy "Allow public insert access on pacientes" on pacientes for insert with check (true);
create policy "Allow public update access on pacientes" on pacientes for update using (true);

create policy "Allow public read access on turnos" on turnos for select using (true);
create policy "Allow public insert access on turnos" on turnos for insert with check (true);
create policy "Allow public update access on turnos" on turnos for update using (true);

create policy "Allow public read access on sesiones_pagos" on sesiones_pagos for select using (true);
create policy "Allow public insert access on sesiones_pagos" on sesiones_pagos for insert with check (true);
create policy "Allow public update access on sesiones_pagos" on sesiones_pagos for update using (true);

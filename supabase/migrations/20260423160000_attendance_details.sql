-- Create attendance tracking table to record exact dates of each session
CREATE TABLE IF NOT EXISTS asistencias_sesiones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_id uuid REFERENCES sesiones_pagos(id) ON DELETE CASCADE NOT NULL,
    paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    fecha_asistencia timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE asistencias_sesiones ENABLE ROW LEVEL SECURITY;

-- Allow public access (consistent with existing policies for other tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on asistencias_sesiones') THEN
        CREATE POLICY "Allow public access on asistencias_sesiones" ON asistencias_sesiones FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Create payments history table
CREATE TABLE IF NOT EXISTS pagos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sesion_id uuid REFERENCES sesiones_pagos(id) ON DELETE CASCADE NOT NULL,
    paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    monto numeric NOT NULL DEFAULT 0,
    fecha timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for pagos
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on pagos') THEN
        CREATE POLICY "Allow public access on pagos" ON pagos FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

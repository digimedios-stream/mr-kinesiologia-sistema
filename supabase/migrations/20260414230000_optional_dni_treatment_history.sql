-- 1. Remove UNIQUE constraint from DNI so multiple patients can have empty/null DNI
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_dni_key;

-- 2. Create treatment history table for tracking evolución changes with dates
CREATE TABLE IF NOT EXISTS historial_tratamientos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
    fecha timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    descripcion text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for historial_tratamientos
ALTER TABLE historial_tratamientos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on historial_tratamientos') THEN
        CREATE POLICY "Allow public access on historial_tratamientos" ON historial_tratamientos FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

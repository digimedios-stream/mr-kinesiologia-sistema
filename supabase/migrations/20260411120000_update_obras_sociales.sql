-- Add missing columns to obras_sociales
ALTER TABLE obras_sociales ADD COLUMN IF NOT EXISTS telefono text;
ALTER TABLE obras_sociales ADD COLUMN IF NOT EXISTS codigo_prestacion text;

-- Create table for Insurance Plans
CREATE TABLE IF NOT EXISTS obras_sociales_planes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    obra_social_id uuid REFERENCES obras_sociales(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Planes
ALTER TABLE obras_sociales_planes ENABLE ROW LEVEL SECURITY;

-- If policy exists, skip or drop/create
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access on planes') THEN
        CREATE POLICY "Allow public access on planes" ON obras_sociales_planes FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

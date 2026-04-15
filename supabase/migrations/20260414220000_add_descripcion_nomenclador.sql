-- Fix: Add the missing 'descripcion_nomenclador' column to obras_sociales
-- The frontend Insurances.jsx references this column but it was never created
ALTER TABLE obras_sociales ADD COLUMN IF NOT EXISTS descripcion_nomenclador text;

-- Fix: Rename 'nombre' to 'nombre_plan' in obras_sociales_planes
-- The frontend inserts/reads 'nombre_plan' but the column was created as 'nombre'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'obras_sociales_planes' AND column_name = 'nombre_plan'
    ) THEN
        ALTER TABLE obras_sociales_planes RENAME COLUMN nombre TO nombre_plan;
    END IF;
END $$;

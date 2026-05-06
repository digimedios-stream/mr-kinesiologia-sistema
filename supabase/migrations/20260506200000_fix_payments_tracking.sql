-- Fix: Add medio_pago column to pagos table (migration 20260419 was never applied to this table)
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS medio_pago text;

-- Fix: Create retroactive payment records for sessions that have monto_abonado > 0
-- but no corresponding record in the pagos table.
-- This ensures all payments are tracked individually with proper dates.
INSERT INTO pagos (sesion_id, paciente_id, monto, fecha, medio_pago, created_at)
SELECT 
  s.id,
  s.paciente_id,
  s.monto_abonado - COALESCE(paid.total, 0),
  s.created_at,
  s.medio_pago,
  s.created_at
FROM sesiones_pagos s
LEFT JOIN (
  SELECT sesion_id, SUM(monto) as total
  FROM pagos
  GROUP BY sesion_id
) paid ON paid.sesion_id = s.id
WHERE s.monto_abonado > 0
AND (s.monto_abonado - COALESCE(paid.total, 0)) > 0;

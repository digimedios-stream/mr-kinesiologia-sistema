-- Update default value for sesiones_asistidas to 1
ALTER TABLE sesiones_pagos ALTER COLUMN sesiones_asistidas SET DEFAULT 1;

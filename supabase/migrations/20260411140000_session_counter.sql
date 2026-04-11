-- Add session tracking counter
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS sesiones_asistidas integer DEFAULT 0;

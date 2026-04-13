-- Add plus_cost to obras_sociales
ALTER TABLE obras_sociales ADD COLUMN IF NOT EXISTS plus_cost numeric DEFAULT 0;

-- Add plus_monto and entrego_orden to sesiones_pagos
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS plus_monto numeric DEFAULT 0;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS entrego_orden boolean DEFAULT false;

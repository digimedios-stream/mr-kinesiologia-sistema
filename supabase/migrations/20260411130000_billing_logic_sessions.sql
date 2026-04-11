-- Update sessions table with billing logic
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS cantidad_sesiones integer DEFAULT 1;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS costo_unitario numeric DEFAULT 0;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS descuento_porcentaje numeric DEFAULT 0;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS total_estimado numeric DEFAULT 0;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS codigo_prestacion text;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS descripcion_nomenclador text;
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS saldo_pendiente numeric DEFAULT 0;

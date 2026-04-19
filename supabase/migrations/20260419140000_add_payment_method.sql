-- Add payment method column to pagos table
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS medio_pago text;

-- Also ensure sesiones_pagos has it and it's consistent
ALTER TABLE sesiones_pagos ADD COLUMN IF NOT EXISTS medio_pago text;

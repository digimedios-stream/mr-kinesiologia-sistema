-- 1. OBRAS SOCIALES
DROP POLICY IF EXISTS "Allow public read access on obras_sociales" ON obras_sociales;
DROP POLICY IF EXISTS "Allow public insert access on obras_sociales" ON obras_sociales;
DROP POLICY IF EXISTS "Allow public update access on obras_sociales" ON obras_sociales;

CREATE POLICY "Enable ALL for authenticated users only" ON obras_sociales 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 2. PACIENTES
DROP POLICY IF EXISTS "Allow public read access on pacientes" ON pacientes;
DROP POLICY IF EXISTS "Allow public insert access on pacientes" ON pacientes;
DROP POLICY IF EXISTS "Allow public update access on pacientes" ON pacientes;

CREATE POLICY "Enable ALL for authenticated users only" ON pacientes 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 3. TURNOS
DROP POLICY IF EXISTS "Allow public read access on turnos" ON turnos;
DROP POLICY IF EXISTS "Allow public insert access on turnos" ON turnos;
DROP POLICY IF EXISTS "Allow public update access on turnos" ON turnos;

CREATE POLICY "Enable ALL for authenticated users only" ON turnos 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 4. SESIONES PAGOS
DROP POLICY IF EXISTS "Allow public read access on sesiones_pagos" ON sesiones_pagos;
DROP POLICY IF EXISTS "Allow public insert access on sesiones_pagos" ON sesiones_pagos;
DROP POLICY IF EXISTS "Allow public update access on sesiones_pagos" ON sesiones_pagos;

CREATE POLICY "Enable ALL for authenticated users only" ON sesiones_pagos 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. OBRAS SOCIALES PLANES
DROP POLICY IF EXISTS "Allow public access on planes" ON obras_sociales_planes;

CREATE POLICY "Enable ALL for authenticated users only" ON obras_sociales_planes 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 6. HISTORIAL TRATAMIENTOS
DROP POLICY IF EXISTS "Allow public access on historial_tratamientos" ON historial_tratamientos;

CREATE POLICY "Enable ALL for authenticated users only" ON historial_tratamientos 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 7. PAGOS
DROP POLICY IF EXISTS "Allow public access on pagos" ON pagos;

CREATE POLICY "Enable ALL for authenticated users only" ON pagos 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 8. ASISTENCIAS SESIONES
DROP POLICY IF EXISTS "Allow public access on asistencias_sesiones" ON asistencias_sesiones;

CREATE POLICY "Enable ALL for authenticated users only" ON asistencias_sesiones 
FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

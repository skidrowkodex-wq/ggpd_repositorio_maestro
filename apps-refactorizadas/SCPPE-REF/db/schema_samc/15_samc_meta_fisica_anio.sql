-- ============================================================================
-- 15_samc_meta_fisica_anio.sql
-- Añade columna anio a samc_meta_fisica (POA) y migra datos existentes
-- derivando el año desde la acción específica → POA
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- Paso 1: Agregar columna nullable primero
ALTER TABLE samc.samc_meta_fisica ADD COLUMN anio INTEGER;

-- Paso 2: Poblar desde la acción → POA → fecha_inicio
UPDATE samc.samc_meta_fisica mf
SET anio = EXTRACT(YEAR FROM p.fecha_inicio)::INTEGER
FROM samc.samc_poa_accion_especifica ae
JOIN samc.samc_poa p ON p.id = ae.poa_id
WHERE mf.acc_esp_id = ae.id;

-- Paso 3: Si quedaron nulos (datos huérfanos), asignar año actual
UPDATE samc.samc_meta_fisica
SET anio = EXTRACT(YEAR FROM NOW())::INTEGER
WHERE anio IS NULL;

-- Paso 4: Hacer NOT NULL
ALTER TABLE samc.samc_meta_fisica ALTER COLUMN anio SET NOT NULL;

COMMIT;

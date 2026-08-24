-- ============================================
-- 03_01_accion_especifica.sql
-- Agrega campos requeridos para metas físicas
-- ============================================

BEGIN;

-- Campo unidad de medida
ALTER TABLE accion_especifica 
ADD COLUMN unidad_medida VARCHAR(100);

-- Campo orden para presentación secuencial
ALTER TABLE accion_especifica 
ADD COLUMN orden INTEGER;

-- Índice para ordenamiento
CREATE INDEX idx_accion_orden ON accion_especifica(poa_id, orden);

-- Comentario documentación ISO
COMMENT ON COLUMN accion_especifica.unidad_medida 
    IS 'Unidad de medida de la acción específica (ej: Unidad, Metro, Software)';
COMMENT ON COLUMN accion_especifica.orden 
    IS 'Orden de presentación de la acción específica dentro del POA';

COMMIT;

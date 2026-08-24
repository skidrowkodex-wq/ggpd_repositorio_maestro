-- ============================================
-- 08_01_accion_especifica_ponderacion.sql
-- Agrega ponderación y fechas a acciones específicas
-- ============================================

BEGIN;

-- Campo ponderación
ALTER TABLE accion_especifica 
ADD COLUMN ponderacion DECIMAL(5,2);

-- Campo fecha_inicio
ALTER TABLE accion_especifica 
ADD COLUMN fecha_inicio_accion DATE;

-- Campo fecha_fin
ALTER TABLE accion_especifica 
ADD COLUMN fecha_fin_accion DATE;

-- Constraints
ALTER TABLE accion_especifica 
ADD CONSTRAINT chk_ponderacion 
    CHECK (ponderacion >= 0 AND ponderacion <= 100);

ALTER TABLE accion_especifica 
ADD CONSTRAINT chk_fechas_accion 
    CHECK (fecha_fin_accion IS NULL OR fecha_inicio_accion IS NULL 
           OR fecha_fin_accion >= fecha_inicio_accion);

-- Índices
CREATE INDEX idx_accion_ponderacion ON accion_especifica(ponderacion);
CREATE INDEX idx_accion_fechas ON accion_especifica(fecha_inicio_accion, fecha_fin_accion);

-- Comentarios
COMMENT ON COLUMN accion_especifica.ponderacion 
    IS 'Porcentaje de ponderación de la acción específica (0-100)';
COMMENT ON COLUMN accion_especifica.fecha_inicio_accion 
    IS 'Fecha de inicio de ejecución de la acción';
COMMENT ON COLUMN accion_especifica.fecha_fin_accion 
    IS 'Fecha de culminación de la acción';

COMMIT;

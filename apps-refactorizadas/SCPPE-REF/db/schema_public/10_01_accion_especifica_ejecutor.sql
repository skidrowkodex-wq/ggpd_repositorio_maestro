-- =====================================================
-- FASE 10: CAMPO EJECUTOR PARA TABLA ACCION_ESPECIFICA
-- Análisis: formulario_ficha_sipes_proyecto.xlsx
-- Fecha: 2026-03-08
-- =====================================================

-- 1. Campo: Unidad ejecutora de la acción
ALTER TABLE accion_especifica ADD COLUMN ejecutor VARCHAR(255);
COMMENT ON COLUMN accion_especifica.ejecutor IS 'Unidad ejecutora de la acción específica (ej: Gerencia de Planificación)';

-- 2. Índice para búsqueda por ejecutor
CREATE INDEX idx_accion_especifica_ejecutor ON accion_especifica(ejecutor);

-- =====================================================
-- VERIFICACIÓN DE CAMPO AGREGADO
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'accion_especifica' 
AND column_name = 'ejecutor';

-- =====================================================
-- FASE 11: CAMPOS ADICIONALES PARA TABLA PARTIDA_PRESUPUESTARIA
-- Análisis: for_opp_087_base_de_calculo_2027_proyecto.xlsx
-- Fecha: 2026-03-08
-- =====================================================

-- 1. Campo: Cantidad solicitada
ALTER TABLE partida_presupuestaria ADD COLUMN cantidad DECIMAL(15,2);
COMMENT ON COLUMN partida_presupuestaria.cantidad IS 'Cantidad solicitada del bien o servicio';

-- 2. Campo: Unidad de medida
ALTER TABLE partida_presupuestaria ADD COLUMN unidad_medida VARCHAR(100);
COMMENT ON COLUMN partida_presupuestaria.unidad_medida IS 'Unidad de medida del bien o servicio (ej: unidad, servicio, lote)';

-- 3. Campo: Costo unitario
ALTER TABLE partida_presupuestaria ADD COLUMN costo_unitario DECIMAL(15,2);
COMMENT ON COLUMN partida_presupuestaria.costo_unitario IS 'Costo unitario del bien o servicio';

-- 4. Campo: Justificación
ALTER TABLE partida_presupuestaria ADD COLUMN justificacion TEXT;
COMMENT ON COLUMN partida_presupuestaria.justificacion IS 'Justificación del gasto o adquisición';

-- 5. Índices para nuevos campos
CREATE INDEX idx_partida_presupuestaria_unidad ON partida_presupuestaria(unidad_medida);
CREATE INDEX idx_partida_presupuestaria_justificacion ON partida_presupuestaria(justificacion);

-- =====================================================
-- VERIFICACIÓN DE CAMPOS AGREGADOS
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'partida_presupuestaria' 
AND column_name IN ('cantidad', 'unidad_medida', 'costo_unitario', 'justificacion')
ORDER BY ordinal_position;

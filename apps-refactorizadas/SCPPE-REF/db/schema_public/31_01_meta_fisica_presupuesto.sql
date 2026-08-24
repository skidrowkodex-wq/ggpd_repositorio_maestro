-- ============================================================================
-- FASE 31: VINCULACIÓN DE METAS FÍSICAS CON EJECUCIÓN PRESUPUESTARIA
-- Fecha: 2026-03-09
-- Descripción: Creación de estructura para vincular metas físicas con presupuesto
-- ============================================================================

-- ============================================================================
-- 1. TABLA: meta_fisica_presupuesto (Vinculación Meta Física ↔ Partida)
-- ============================================================================
-- Relaciona cada meta física con las partidas presupuestarias que la soportan

CREATE TABLE IF NOT EXISTS meta_fisica_presupuesto (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meta_fisica_id          UUID NOT NULL,
    partida_presupuestaria_id UUID NOT NULL,
    
    -- Montos asignados a esta meta física
    monto_asignado          DECIMAL(15,2) NOT NULL DEFAULT 0,
    monto_ejecutado         DECIMAL(15,2) NOT NULL DEFAULT 0,
    monto_pendiente         DECIMAL(15,2) GENERATED ALWAYS AS (monto_asignado - monto_ejecutado) STORED,
    
    -- Porcentaje de avance financiero
    porcentaje_financiero   DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN monto_asignado > 0 THEN 
                LEAST((monto_ejecutado / monto_asignado * 100)::numeric(5,2), 100)
            ELSE 0 
        END
    ) STORED,
    
    -- Observaciones
    observaciones           TEXT,
    
    -- Auditoría
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    version                 INT NOT NULL DEFAULT 1,
    
    -- Constraints
    CONSTRAINT fk_mf_presupuesto_meta 
        FOREIGN KEY (meta_fisica_id) 
        REFERENCES meta_fisica(id) ON DELETE CASCADE,
    CONSTRAINT fk_mf_presupuesto_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) ON DELETE CASCADE,
    CONSTRAINT uq_mf_presupuesto 
        UNIQUE (meta_fisica_id, partida_presupuestaria_id),
    CONSTRAINT chk_mf_presupuesto_monto_asignado 
        CHECK (monto_asignado >= 0),
    CONSTRAINT chk_mf_presupuesto_monto_ejecutado 
        CHECK (monto_ejecutado >= 0)
);

COMMENT ON TABLE meta_fisica_presupuesto IS 
    'Vinculación entre metas físicas y partidas presupuestarias. '
    'Permite rastrear cuánto presupuesto se ha ejecutado para cada meta física.';

COMMENT ON COLUMN meta_fisica_presupuesto.monto_asignado IS 
    'Monto del presupuesto asignado a esta meta física';

COMMENT ON COLUMN meta_fisica_presupuesto.monto_ejecutado IS 
    'Monto del presupuesto ejecutado para esta meta física';

CREATE INDEX idx_mf_presupuesto_meta ON meta_fisica_presupuesto(meta_fisica_id);
CREATE INDEX idx_mf_presupuesto_partida ON meta_fisica_presupuesto(partida_presupuestaria_id);
CREATE INDEX idx_mf_presupuesto_activo ON meta_fisica_presupuesto(activo);

-- ============================================================================
-- 2. TRIGGERS DE SINCRONIZACIÓN
-- ============================================================================

-- Función: Actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_mf_presupuesto()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.version IS NOT NULL THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar timestamps
CREATE TRIGGER trigger_mf_presupuesto_updated_at
    BEFORE UPDATE ON meta_fisica_presupuesto
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_mf_presupuesto();

-- ============================================================================
-- 3. VISTA: RENDICIÓN DE METAS FÍSICAS CON PRESUPUESTO
-- ============================================================================

CREATE OR REPLACE VIEW v_rendicion_metas_fisicas AS
SELECT 
    ae.nombre AS accion_especifica,
    ae.unidad_medida AS unidad_meta,
    mf.anio,
    m.nombre AS mes,
    mf.programado AS meta_programada,
    mf.ejecutado AS meta_ejecutada,
    mf.eficacia AS eficacia_fisica,
    -- Presupuesto vinculado
    COALESCE(SUM(mfp.monto_asignado), 0) AS presupuesto_asignado,
    COALESCE(SUM(mfp.monto_ejecutado), 0) AS presupuesto_ejecutado,
    COALESCE(SUM(mfp.monto_pendiente), 0) AS presupuesto_pendiente,
    -- Eficacia financiera
    CASE 
        WHEN SUM(mfp.monto_asignado) > 0 THEN 
            LEAST((SUM(mfp.monto_ejecutado) / SUM(mfp.monto_asignado) * 100)::numeric(5,2), 100)
        ELSE 0 
    END AS eficacia_financiera,
    -- Indicador de rendición
    CASE 
        WHEN mf.eficacia >= 100 AND SUM(mfp.monto_ejecutado) <= SUM(mfp.monto_asignado) THEN 'ÓPTIMO'
        WHEN mf.eficacia >= 80 AND SUM(mfp.monto_ejecutado) <= SUM(mfp.monto_asignado) THEN 'BUENO'
        WHEN mf.eficacia >= 50 THEN 'REGULAR'
        WHEN mf.eficacia > 0 THEN 'DEFICIENTE'
        ELSE 'SIN EJECUTAR'
    END AS indicador_rendicion,
    -- Detalle de partidas
    STRING_AGG(
        DISTINCT pp.codigo || ': ' || TO_CHAR(COALESCE(mfp.monto_asignado, 0), 'FM999,999,999'),
        '; '
    ) AS detalle_partidas
FROM meta_fisica mf
JOIN accion_especifica ae ON mf.accion_especifica_id = ae.id
JOIN mes m ON mf.mes_id = m.id
LEFT JOIN meta_fisica_presupuesto mfp ON mf.id = mfp.meta_fisica_id AND mfp.activo = TRUE
LEFT JOIN partida_presupuestaria pp ON mfp.partida_presupuestaria_id = pp.id AND pp.activo = TRUE
WHERE mf.activo = TRUE AND ae.activo = TRUE
GROUP BY 
    ae.nombre, ae.unidad_medida, mf.anio, m.nombre, 
    mf.programado, mf.ejecutado, mf.eficacia
ORDER BY mf.anio, m.orden;

COMMENT ON VIEW v_rendicion_metas_fisicas IS 
    'Vista de rendición que muestra metas físicas con su presupuesto vinculado. '
    'Incluye eficacia física, financiera y indicador de rendición.';

-- ============================================================================
-- 4. VISTA: DASHBOARD DE RENDICIÓN POR ACCIÓN
-- ============================================================================

CREATE OR REPLACE VIEW v_dashboard_rendicion AS
SELECT 
    ae.nombre AS accion_especifica,
    mf.anio,
    -- Metas físicas
    SUM(mf.programado) AS total_programado,
    SUM(mf.ejecutado) AS total_ejecutado,
    CASE 
        WHEN SUM(mf.programado) > 0 THEN 
            ROUND((SUM(mf.ejecutado) / SUM(mf.programado) * 100)::numeric, 2)
        ELSE 0 
    END AS avance_fisico,
    -- Presupuesto
    COALESCE(SUM(mfp.monto_asignado), 0) AS total_presupuesto,
    COALESCE(SUM(mfp.monto_ejecutado), 0) AS total_ejecutado_financiero,
    CASE 
        WHEN COALESCE(SUM(mfp.monto_asignado), 0) > 0 THEN 
            ROUND((COALESCE(SUM(mfp.monto_ejecutado), 0) / SUM(mfp.monto_asignado) * 100)::numeric, 2)
        ELSE 0 
    END AS avance_financiero,
    -- Indicador general
    CASE 
        WHEN SUM(mf.ejecutado) >= SUM(mf.programado) AND 
             COALESCE(SUM(mfp.monto_ejecutado), 0) <= COALESCE(SUM(mfp.monto_asignado), 0) 
        THEN 'ÓPTIMO'
        WHEN SUM(mf.ejecutado) >= SUM(mf.programado) * 0.8 AND 
             COALESCE(SUM(mfp.monto_ejecutado), 0) <= COALESCE(SUM(mfp.monto_asignado), 0) * 1.1
        THEN 'BUENO'
        WHEN SUM(mf.ejecutado) >= SUM(mf.programado) * 0.5 THEN 'REGULAR'
        WHEN SUM(mf.ejecutado) > 0 THEN 'DEFICIENTE'
        ELSE 'SIN EJECUTAR'
    END AS indicador_general,
    -- Partidas involucradas
    COUNT(DISTINCT mfp.partida_presupuestaria_id) AS partidas_involucradas
FROM accion_especifica ae
JOIN meta_fisica mf ON ae.id = mf.accion_especifica_id AND mf.activo = TRUE
LEFT JOIN meta_fisica_presupuesto mfp ON mf.id = mfp.meta_fisica_id AND mfp.activo = TRUE
WHERE ae.activo = TRUE
GROUP BY ae.nombre, mf.anio;

COMMENT ON VIEW v_dashboard_rendicion IS 
    'Dashboard de rendición por acción específica. '
    'Muestra resumen de avance físico y financiero.';

-- ============================================================================
-- 5. VISTA: CONCILIACIÓN FÍSICO-FINANCIERA
-- ============================================================================

CREATE OR REPLACE VIEW v_conciliacion_fisico_financiera AS
SELECT 
    ae.nombre AS accion_especifica,
    mf.anio,
    m.nombre AS mes,
    -- Meta física
    mf.programado AS meta_programada,
    mf.ejecutado AS meta_ejecutada,
    mf.eficacia AS eficacia_fisica,
    -- Presupuesto
    COALESCE(SUM(mfp.monto_asignado), 0) AS presupuesto_asignado,
    COALESCE(SUM(mfp.monto_ejecutado), 0) AS presupuesto_ejecutado,
    -- Relación costo-beneficio
    CASE 
        WHEN mf.ejecutado > 0 AND SUM(mfp.monto_ejecutado) > 0 THEN 
            ROUND((SUM(mfp.monto_ejecutado) / mf.ejecutado)::numeric, 2)
        ELSE 0 
    END AS costo_por_unidad_ejecutada,
    -- Eficiencia (meta ejecutada por cada bolívar ejecutado)
    CASE 
        WHEN SUM(mfp.monto_ejecutado) > 0 THEN 
            ROUND((mf.ejecutado / SUM(mfp.monto_ejecutado) * 1000)::numeric, 4)
        ELSE 0 
    END AS unidades_por_mil_bolivares,
    -- Estado de conciliación
    CASE 
        WHEN mf.ejecutado >= mf.programado AND 
             SUM(mfp.monto_ejecutado) <= SUM(mfp.monto_asignado) THEN 'CONFORME'
        WHEN mf.ejecutado < mf.programado AND 
             SUM(mfp.monto_ejecutado) > SUM(mfp.monto_asignado) THEN 'NO CONFORME'
        WHEN mf.ejecutado >= mf.programado THEN 'FÍSICO CONFORME'
        WHEN SUM(mfp.monto_ejecutado) <= SUM(mfp.monto_asignado) THEN 'FINANCIERO CONFORME'
        ELSE 'EN SEGUIMIENTO'
    END AS estado_conciliacion
FROM meta_fisica mf
JOIN accion_especifica ae ON mf.accion_especifica_id = ae.id
JOIN mes m ON mf.mes_id = m.id
LEFT JOIN meta_fisica_presupuesto mfp ON mf.id = mfp.meta_fisica_id AND mfp.activo = TRUE
WHERE mf.activo = TRUE AND ae.activo = TRUE
GROUP BY 
    ae.nombre, mf.anio, m.nombre, m.orden,
    mf.programado, mf.ejecutado, mf.eficacia
ORDER BY mf.anio, m.orden;

COMMENT ON VIEW v_conciliacion_fisico_financiera IS 
    'Conciliación entre avance físico y ejecución presupuestaria. '
    'Muestra relación costo-beneficio y estado de conciliación.';

-- ============================================================================
-- FIN FASE 31
-- ============================================================================

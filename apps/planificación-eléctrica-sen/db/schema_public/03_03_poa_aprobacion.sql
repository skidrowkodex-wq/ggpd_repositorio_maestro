-- ============================================
-- 03_03_poa_aprobacion.sql
-- Control de aprobación con trazabilidad
-- Cumple: ISO 27001 A.12.4.1, ISACA COBIT BAI04
-- ============================================

BEGIN;

-- Tabla de aprobación de POA
CREATE TABLE poa_aprobacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poa_id UUID NOT NULL,
    
    -- Presupuesto Original (Solicitado)
    monto_solicitado DECIMAL(15,2) NOT NULL,
    
    -- Presupuesto Asignado (Real)
    monto_asignado DECIMAL(15,2) NOT NULL,
    
    -- Tipo de Aprobación
    tipo_aprobacion VARCHAR(30) NOT NULL,
    
    -- Control de Metas
    metas_originales JSONB,
    metas_ajustadas JSONB,
    requiere_ajuste_metas BOOLEAN DEFAULT false,
    
    -- Variación
    porcentaje_variacion DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN monto_solicitado > 0 
            THEN ((monto_asignado - monto_solicitado) / monto_solicitado) * 100
            ELSE 0 
        END
    ) STORED,
    
    -- Auditoría ISO 27001
    fecha_aprobacion TIMESTAMPTZ,
    aprobado_por VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL,
    
    -- Restricciones
    CONSTRAINT fk_poa_aprobacion_poa 
        FOREIGN KEY (poa_id) 
        REFERENCES poa(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uq_poa_aprobacion UNIQUE (poa_id),
    
    CONSTRAINT chk_tipo_aprobacion 
        CHECK (tipo_aprobacion IN ('ASIGNADO_IGUAL', 'ASIGNADO_DIFERENTE')),
    
    CONSTRAINT chk_monto_solicitado 
        CHECK (monto_solicitado >= 0),
    
    CONSTRAINT chk_monto_asignado 
        CHECK (monto_asignado >= 0)
);

-- Índices
CREATE INDEX idx_poa_aprobacion_tipo ON poa_aprobacion(tipo_aprobacion);

-- Trigger para updated_at
CREATE TRIGGER trigger_poa_aprobacion_updated_at 
    BEFORE UPDATE ON poa_aprobacion
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Comentarios documentación ISO
COMMENT ON TABLE poa_aprobacion 
    IS 'Control de aprobación de POA con trazabilidad de presupuesto y metas';
COMMENT ON COLUMN poa_aprobacion.tipo_aprobacion 
    IS 'Tipo: ASIGNADO_IGUAL (presupuesto = solicitado) o ASIGNADO_DIFERENTE (ajuste requerido)';
COMMENT ON COLUMN poa_aprobacion.metas_originales 
    IS 'Snapshot JSON de metas físicas originales antes de ajuste';
COMMENT ON COLUMN poa_aprobacion.metas_ajustadas 
    IS 'Snapshot JSON de metas físicas después de ajuste';

COMMIT;

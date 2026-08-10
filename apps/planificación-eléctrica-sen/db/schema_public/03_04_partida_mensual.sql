-- ============================================
-- 03_04_partida_mensual.sql
-- Programación presupuestaria mensual por partida
-- ============================================

BEGIN;

-- Tabla de partida mensual
CREATE TABLE partida_mensual (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_presupuestaria_id UUID NOT NULL,
    mes_id UUID NOT NULL,
    anio INTEGER NOT NULL,
    
    -- Montos
    monto_solicitado DECIMAL(15,2) DEFAULT 0 NOT NULL,
    monto_asignado DECIMAL(15,2) DEFAULT 0 NOT NULL,
    monto_ejecutado DECIMAL(15,2) DEFAULT 0 NOT NULL,
    
    -- Eficacia financiera
    eficacia DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN monto_asignado > 0 
            THEN LEAST((monto_ejecutado / monto_asignado) * 100, 100)
            ELSE 0 
        END
    ) STORED,
    
    -- Auditoría ISO 8000/27001
    activo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1 NOT NULL,
    
    -- Restricciones
    CONSTRAINT fk_partida_mensual_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_partida_mensual_mes 
        FOREIGN KEY (mes_id) 
        REFERENCES mes(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT uq_partida_mensual 
        UNIQUE (partida_presupuestaria_id, mes_id, anio),
    
    CONSTRAINT chk_partida_mensual_solicitado 
        CHECK (monto_solicitado >= 0),
    
    CONSTRAINT chk_partida_mensual_asignado 
        CHECK (monto_asignado >= 0),
    
    CONSTRAINT chk_partida_mensual_ejecutado 
        CHECK (monto_ejecutado >= 0)
);

-- Índices
CREATE INDEX idx_partida_mensual_partida ON partida_mensual(partida_presupuestaria_id);
CREATE INDEX idx_partida_mensual_mes ON partida_mensual(mes_id);
CREATE INDEX idx_partida_mensual_anio ON partida_mensual(anio);

-- Trigger para updated_at
CREATE TRIGGER trigger_partida_mensual_updated_at 
    BEFORE UPDATE ON partida_mensual
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Comentarios documentación ISO
COMMENT ON TABLE partida_mensual 
    IS 'Programación presupuestaria mensual por partida presupuestaria';
COMMENT ON COLUMN partida_mensual.monto_solicitado 
    IS 'Monto solicitado original para el mes';
COMMENT ON COLUMN partida_mensual.monto_asignado 
    IS 'Monto asignado realmente para el mes';
COMMENT ON COLUMN partida_mensual.monto_ejecutado 
    IS 'Monto ejecutado real para el mes';

COMMIT;

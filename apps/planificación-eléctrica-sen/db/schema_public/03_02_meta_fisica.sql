-- ============================================
-- 03_02_meta_fisica.sql
-- Tabla de metas físicas mensuales por acción
-- ============================================

BEGIN;

-- Tabla de metas físicas
CREATE TABLE meta_fisica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accion_especifica_id UUID NOT NULL,
    mes_id UUID NOT NULL,
    anio INTEGER NOT NULL,
    
    -- Datos de meta
    programado DECIMAL(15,2) DEFAULT 0 NOT NULL,
    ejecutado DECIMAL(15,2) DEFAULT 0 NOT NULL,
    unidad_medida VARCHAR(100),
    
    -- Eficacia calculada
    eficacia DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN programado > 0 
            THEN LEAST((ejecutado / programado) * 100, 100)
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
    CONSTRAINT fk_meta_fisica_accion 
        FOREIGN KEY (accion_especifica_id) 
        REFERENCES accion_especifica(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_meta_fisica_mes 
        FOREIGN KEY (mes_id) 
        REFERENCES mes(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT uq_meta_fisica_accion_mes_anio 
        UNIQUE (accion_especifica_id, mes_id, anio),
    
    CONSTRAINT chk_meta_fisica_programado 
        CHECK (programado >= 0),
    
    CONSTRAINT chk_meta_fisica_ejecutado 
        CHECK (ejecutado >= 0),
    
    CONSTRAINT chk_meta_fisica_eficacia 
        CHECK (eficacia >= 0 AND eficacia <= 100)
);

-- Índices para performance
CREATE INDEX idx_meta_fisica_accion ON meta_fisica(accion_especifica_id);
CREATE INDEX idx_meta_fisica_mes ON meta_fisica(mes_id);
CREATE INDEX idx_meta_fisica_anio ON meta_fisica(anio);
CREATE INDEX idx_meta_fisica_accion_anio ON meta_fisica(accion_especifica_id, anio);

-- Trigger para updated_at
CREATE TRIGGER trigger_meta_fisica_updated_at 
    BEFORE UPDATE ON meta_fisica
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Comentarios documentación ISO
COMMENT ON TABLE meta_fisica 
    IS 'Metas físicas mensuales por acción específica del POA';
COMMENT ON COLUMN meta_fisica.programado 
    IS 'Cantidad programada de meta física para el mes';
COMMENT ON COLUMN meta_fisica.ejecutado 
    IS 'Cantidad ejecutada de meta física para el mes';
COMMENT ON COLUMN meta_fisica.eficacia 
    IS 'Porcentaje de eficacia calculado (ejecutado/programado)*100';

COMMIT;

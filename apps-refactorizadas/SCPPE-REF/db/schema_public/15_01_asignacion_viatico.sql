-- =====================================================
-- FASE 15: TABLA ASIGNACIÓN DE VIÁTICOS (CONTROL INDIVIDUAL)
-- Estructura Híbrida - Nivel 2: Asignación por Persona
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para asignación individual de viáticos a personas
CREATE TABLE IF NOT EXISTS asignacion_viatico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a viático (FK)
    viatico_id UUID NOT NULL,
    CONSTRAINT fk_asignacion_viatico 
        FOREIGN KEY (viatico_id) 
        REFERENCES viatico(id) 
        ON DELETE CASCADE,
    
    -- Referencia a responsable (FK)
    responsable_id UUID NOT NULL,
    CONSTRAINT fk_asignacion_responsable 
        FOREIGN KEY (responsable_id) 
        REFERENCES responsable(id) 
        ON DELETE RESTRICT,
    
    -- Datos de la asignación
    monto_asignado DECIMAL(15,2) NOT NULL CHECK (monto_asignado > 0),
    monto_ejecutado DECIMAL(15,2) DEFAULT 0 CHECK (monto_ejecutado >= 0),
    saldo_pendiente DECIMAL(15,2) GENERATED ALWAYS AS (monto_asignado - monto_ejecutado) STORED,
    
    -- Información del viaje
    destino VARCHAR(255) NOT NULL,
    fecha_salida DATE NOT NULL,
    fecha_retorno DATE NOT NULL,
    dias_viaje INTEGER GENERATED ALWAYS AS (fecha_retorno - fecha_salida + 1) STORED,
    
    -- Estado de la asignación
    estado VARCHAR(30) DEFAULT 'PENDIENTE' 
        CHECK (estado IN ('PENDIENTE', 'APROBADO', 'EN_VIAJE', 'COMPLETADO', 'RECHAZADO', 'ANULADO')),
    
    -- Observaciones
    observaciones TEXT,
    motivo_rechazo TEXT,
    
    -- Campos ISO 8000/27001
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Comentarios de las columnas
COMMENT ON TABLE asignacion_viatico IS 'Asignación individual de viáticos a personas responsables';
COMMENT ON COLUMN asignacion_viatico.viatico_id IS 'FK a viatico (presupuesto general)';
COMMENT ON COLUMN asignacion_viatico.responsable_id IS 'FK a responsable (persona que viaja)';
COMMENT ON COLUMN asignacion_viatico.monto_asignado IS 'Monto total asignado a la persona';
COMMENT ON COLUMN asignacion_viatico.monto_ejecutado IS 'Monto total ejecutado/gastado';
COMMENT ON COLUMN asignacion_viatico.saldo_pendiente IS 'Saldo pendiente (asignado - ejecutado)';
COMMENT ON COLUMN asignacion_viatico.destino IS 'Destino del viaje';
COMMENT ON COLUMN asignacion_viatico.fecha_salida IS 'Fecha de salida';
COMMENT ON COLUMN asignacion_viatico.fecha_retorno IS 'Fecha de retorno';
COMMENT ON COLUMN asignacion_viatico.dias_viaje IS 'Días de viaje (calculado)';
COMMENT ON COLUMN asignacion_viatico.estado IS 'Estado: PENDIENTE/APROBADO/EN_VIAJE/COMPLETADO/RECHAZADO/ANULADO';

-- Índices
CREATE INDEX idx_asignacion_viatico_viatico ON asignacion_viatico(viatico_id);
CREATE INDEX idx_asignacion_viatico_responsable ON asignacion_viatico(responsable_id);
CREATE INDEX idx_asignacion_viatico_estado ON asignacion_viatico(estado);
CREATE INDEX idx_asignacion_viatico_fechas ON asignacion_viatico(fecha_salida, fecha_retorno);
CREATE INDEX idx_asignacion_viatico_activo ON asignacion_viatico(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_asignacion_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asignacion_viatico
    BEFORE UPDATE ON asignacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION update_asignacion_viatico_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'asignacion_viatico' 
ORDER BY ordinal_position;

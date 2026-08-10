-- =====================================================
-- FASE 17: TABLA APROBACIÓN DE VIÁTICOS (FLUJO SIMPLE)
-- Estructura Híbrida - Flujo de Aprobación de Un Nivel
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para control de aprobación de viáticos (flujo simple)
CREATE TABLE IF NOT EXISTS aprobacion_viatico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a asignación de viático (FK)
    asignacion_viatico_id UUID NOT NULL,
    CONSTRAINT fk_aprobacion_asignacion 
        FOREIGN KEY (asignacion_viatico_id) 
        REFERENCES asignacion_viatico(id) 
        ON DELETE CASCADE,
    
    -- Datos de la solicitud
    solicitado_por VARCHAR(255) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    justificacion TEXT NOT NULL,
    
    -- Datos de la aprobación
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' 
        CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
    
    -- Montos
    monto_solicitado DECIMAL(15,2) NOT NULL,
    monto_aprobado DECIMAL(15,2),
    
    -- Observaciones y motivo
    observaciones_aprobacion TEXT,
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
COMMENT ON TABLE aprobacion_viatico IS 'Control de aprobación de viáticos (flujo simple de un nivel)';
COMMENT ON COLUMN aprobacion_viatico.asignacion_viatico_id IS 'FK a asignacion_viatico';
COMMENT ON COLUMN aprobacion_viatico.solicitado_por IS 'Nombre de quien solicita el viático';
COMMENT ON COLUMN aprobacion_viatico.fecha_solicitud IS 'Fecha y hora de la solicitud';
COMMENT ON COLUMN aprobacion_viatico.justificacion IS 'Justificación del viaje';
COMMENT ON COLUMN aprobacion_viatico.aprobado_por IS 'Nombre de quien aprueba';
COMMENT ON COLUMN aprobacion_viatico.fecha_aprobacion IS 'Fecha y hora de la aprobación';
COMMENT ON COLUMN aprobacion_viatico.estado IS 'Estado: PENDIENTE/APROBADO/RECHAZADO';
COMMENT ON COLUMN aprobacion_viatico.monto_solicitado IS 'Monto total solicitado';
COMMENT ON COLUMN aprobacion_viatico.monto_aprobado IS 'Monto total aprobado';
COMMENT ON COLUMN aprobacion_viatico.observaciones_aprobacion IS 'Observaciones del aprobador';
COMMENT ON COLUMN aprobacion_viatico.motivo_rechazo IS 'Motivo del rechazo (si aplica)';

-- Índices
CREATE INDEX idx_aprobacion_asignacion ON aprobacion_viatico(asignacion_viatico_id);
CREATE INDEX idx_aprobacion_estado ON aprobacion_viatico(estado);
CREATE INDEX idx_aprobacion_fecha_solicitud ON aprobacion_viatico(fecha_solicitud);
CREATE INDEX idx_aprobacion_activo ON aprobacion_viatico(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_aprobacion_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_aprobacion_viatico
    BEFORE UPDATE ON aprobacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION update_aprobacion_viatico_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'aprobacion_viatico' 
ORDER BY ordinal_position;

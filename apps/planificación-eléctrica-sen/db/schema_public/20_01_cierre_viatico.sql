-- =====================================================
-- FASE 20: TABLA CIERRE DE VIÁTICOS (CONTROL DE ESCENARIOS)
-- Escenarios: Reintegro, Reembolso, Normal, Excepcional
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para control de cierres de viáticos por escenario
CREATE TABLE IF NOT EXISTS cierre_viatico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a asignación de viático (FK)
    asignacion_viatico_id UUID NOT NULL,
    CONSTRAINT fk_cierre_asignacion 
        FOREIGN KEY (asignacion_viatico_id) 
        REFERENCES asignacion_viatico(id) 
        ON DELETE CASCADE,
    
    -- Tipo de cierre (escenario)
    tipo_cierre VARCHAR(30) NOT NULL 
        CHECK (tipo_cierre IN ('RENDICION_NORMAL', 'REINTEGRO', 'REEMBOLSO', 'EXCEPCIONAL')),
    
    -- Montos del cierre
    monto_asignado DECIMAL(15,2) NOT NULL,
    monto_gastado DECIMAL(15,2) DEFAULT 0,
    monto_reintegro DECIMAL(15,2) DEFAULT 0,
    monto_reembolso DECIMAL(15,2) DEFAULT 0,
    
    -- Fechas del cierre
    fecha_cierre DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_reintegro DATE,
    fecha_reembolso DATE,
    
    -- Aprobaciones (quién autorizó)
    -- Aprobador 1: Gerente (siempre requerido)
    aprobado_por_gerente VARCHAR(255) NOT NULL,
    fecha_aprobacion_gerente TIMESTAMP NOT NULL,
    justificacion_gerente TEXT NOT NULL,
    
    -- Aprobador 2: Director (solo para escenario excepcional)
    aprobado_por_director VARCHAR(255),
    fecha_aprobacion_director TIMESTAMP,
    justificacion_director TEXT,
    
    -- Origen de los fondos (para escenarios reembolso y excepcional)
    origen_fondos VARCHAR(100),
    -- Ejemplos: 'PRESUPUESTO GERENCIA', 'FONDOS RESERVA', 'PRESUPUESTO CORPORATIVO'
    
    -- Comprobantes de respaldo
    comprobante_reintegro VARCHAR(100),
    comprobante_reembolso VARCHAR(100),
    
    -- Justificación del cierre
    motivo_cierre TEXT NOT NULL,
    observaciones TEXT,
    
    -- Para escenario excepcional: control de revisión periódica
    es_excepcional BOOLEAN DEFAULT FALSE,
    requiere_revision_periodica BOOLEAN DEFAULT TRUE,
    proxima_revision DATE,
    estado_revision VARCHAR(30) DEFAULT 'PENDIENTE' 
        CHECK (estado_revision IN ('PENDIENTE', 'REVISADO', 'CERRADO')),
    
    -- Campos ISO 8000/27001
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Comentarios de las columnas
COMMENT ON TABLE cierre_viatico IS 'Control de cierres de viáticos por escenario (reintegro, reembolso, normal, excepcional)';
COMMENT ON COLUMN cierre_viatico.asignacion_viatico_id IS 'FK a asignacion_viatico';
COMMENT ON COLUMN cierre_viatico.tipo_cierre IS 'Tipo: RENDICION_NORMAL/REINTEGRO/REEMBOLSO/EXCEPCIONAL';
COMMENT ON COLUMN cierre_viatico.monto_asignado IS 'Monto original asignado al trabajador';
COMMENT ON COLUMN cierre_viatico.monto_gastado IS 'Monto realmente gastado (con comprobantes)';
COMMENT ON COLUMN cierre_viatico.monto_reintegro IS 'Monto a reintegrar a la empresa (sobrante)';
COMMENT ON COLUMN cierre_viatico.monto_reembolso IS 'Monto a reembolsar al trabajador (sobregasto)';
COMMENT ON COLUMN cierre_viatico.fecha_cierre IS 'Fecha de cierre de la asignación';
COMMENT ON COLUMN cierre_viatico.fecha_reintegro IS 'Fecha de reintegro del sobrante';
COMMENT ON COLUMN cierre_viatico.fecha_reembolso IS 'Fecha de reembolso del sobregasto';
COMMENT ON COLUMN cierre_viatico.aprobado_por_gerente IS 'Nombre del gerente que aprobó el cierre';
COMMENT ON COLUMN cierre_viatico.fecha_aprobacion_gerente IS 'Fecha de aprobación del gerente';
COMMENT ON COLUMN cierre_viatico.justificacion_gerente IS 'Justificación del gerente para el cierre';
COMMENT ON COLUMN cierre_viatico.aprobado_por_director IS 'Nombre del director (solo excepcional)';
COMMENT ON COLUMN cierre_viatico.fecha_aprobacion_director IS 'Fecha de aprobación del director (solo excepcional)';
COMMENT ON COLUMN cierre_viatico.justificacion_director IS 'Justificación del director (solo excepcional)';
COMMENT ON COLUMN cierre_viatico.origen_fondos IS 'Origen de los fondos para reembolso/excepcional';
COMMENT ON COLUMN cierre_viatico.comprobante_reintegro IS 'Número de comprobante de reintegro';
COMMENT ON COLUMN cierre_viatico.comprobante_reembolso IS 'Número de comprobante de reembolso';
COMMENT ON COLUMN cierre_viatico.motivo_cierre IS 'Motivo detallado del cierre';
COMMENT ON COLUMN cierre_viatico.observaciones IS 'Observaciones adicionales';
COMMENT ON COLUMN cierre_viatico.es_excepcional IS 'TRUE si es asignación excepcional (sin rendición)';
COMMENT ON COLUMN cierre_viatico.requiere_revision_periodica IS 'TRUE si requiere revisión periódica (excepcional)';
COMMENT ON COLUMN cierre_viatico.proxima_revision IS 'Fecha de próxima revisión (excepcional)';
COMMENT ON COLUMN cierre_viatico.estado_revision IS 'Estado de revisión: PENDIENTE/REVISADO/CERRADO';

-- Índices
CREATE INDEX idx_cierre_asignacion ON cierre_viatico(asignacion_viatico_id);
CREATE INDEX idx_cierre_tipo ON cierre_viatico(tipo_cierre);
CREATE INDEX idx_cierre_fecha ON cierre_viatico(fecha_cierre);
CREATE INDEX idx_cierre_excepcional ON cierre_viatico(es_excepcional);
CREATE INDEX idx_cierre_estado_revision ON cierre_viatico(estado_revision);
CREATE INDEX idx_cierre_proxima_revision ON cierre_viatico(proxima_revision);
CREATE INDEX idx_cierre_activo ON cierre_viatico(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_cierre_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cierre_viatico
    BEFORE UPDATE ON cierre_viatico
    FOR EACH ROW
    EXECUTE FUNCTION update_cierre_viatico_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cierre_viatico' 
ORDER BY ordinal_position;

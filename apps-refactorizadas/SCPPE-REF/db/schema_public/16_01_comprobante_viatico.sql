-- =====================================================
-- FASE 16: TABLA COMPROBANTES DE VIÁTICOS (DOCUMENTOS)
-- Estructura Híbrida - Nivel 3: Comprobantes de Soporte
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para comprobantes/documentos de soporte de viáticos
CREATE TABLE IF NOT EXISTS comprobante_viatico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a asignación de viático (FK)
    asignacion_viatico_id UUID NOT NULL,
    CONSTRAINT fk_comprobante_asignacion 
        FOREIGN KEY (asignacion_viatico_id) 
        REFERENCES asignacion_viatico(id) 
        ON DELETE CASCADE,
    
    -- Tipo de comprobante
    tipo_comprobante VARCHAR(50) NOT NULL 
        CHECK (tipo_comprobante IN ('PASAJE', 'ALOJAMIENTO', 'ALIMENTACION', 'TRANSPORTE_LOCAL', 'OTROS')),
    
    -- Datos del comprobante
    numero_comprobante VARCHAR(100),
    fecha_comprobante DATE NOT NULL,
    descripcion TEXT NOT NULL,
    monto_comprobante DECIMAL(15,2) NOT NULL CHECK (monto_comprobante > 0),
    
    -- Proveedor/Facturador
    proveedor VARCHAR(255),
    rif_proveedor VARCHAR(20),
    
    -- Archivo adjunto (documento digital)
    archivo_ruta VARCHAR(500),  -- Ruta del archivo en sistema de archivos
    archivo_nombre VARCHAR(255), -- Nombre original del archivo
    archivo_tipo VARCHAR(50),    -- Tipo MIME (PDF, JPG, PNG, etc.)
    archivo_tamano INTEGER,      -- Tamaño en bytes
    
    -- Estado de validación
    estado VARCHAR(30) DEFAULT 'PENDIENTE' 
        CHECK (estado IN ('PENDIENTE', 'VALIDADO', 'RECHAZADO')),
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
COMMENT ON TABLE comprobante_viatico IS 'Comprobantes y documentos de soporte para viáticos';
COMMENT ON COLUMN comprobante_viatico.asignacion_viatico_id IS 'FK a asignacion_viatico';
COMMENT ON COLUMN comprobante_viatico.tipo_comprobante IS 'Tipo: PASAJE/ALOJAMIENTO/ALIMENTACION/TRANSPORTE_LOCAL/OTROS';
COMMENT ON COLUMN comprobante_viatico.numero_comprobante IS 'Número de factura o comprobante';
COMMENT ON COLUMN comprobante_viatico.fecha_comprobante IS 'Fecha del comprobante';
COMMENT ON COLUMN comprobante_viatico.descripcion IS 'Descripción del gasto';
COMMENT ON COLUMN comprobante_viatico.monto_comprobante IS 'Monto del comprobante';
COMMENT ON COLUMN comprobante_viatico.proveedor IS 'Nombre del proveedor';
COMMENT ON COLUMN comprobante_viatico.rif_proveedor IS 'RIF del proveedor';
COMMENT ON COLUMN comprobante_viatico.archivo_ruta IS 'Ruta del archivo adjunto en disco';
COMMENT ON COLUMN comprobante_viatico.archivo_nombre IS 'Nombre original del archivo';
COMMENT ON COLUMN comprobante_viatico.archivo_tipo IS 'Tipo MIME del archivo';
COMMENT ON COLUMN comprobante_viatico.archivo_tamano IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN comprobante_viatico.estado IS 'Estado: PENDIENTE/VALIDADO/RECHAZADO';

-- Índices
CREATE INDEX idx_comprobante_asignacion ON comprobante_viatico(asignacion_viatico_id);
CREATE INDEX idx_comprobante_tipo ON comprobante_viatico(tipo_comprobante);
CREATE INDEX idx_comprobante_estado ON comprobante_viatico(estado);
CREATE INDEX idx_comprobante_fecha ON comprobante_viatico(fecha_comprobante);
CREATE INDEX idx_comprobante_activo ON comprobante_viatico(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_comprobante_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comprobante_viatico
    BEFORE UPDATE ON comprobante_viatico
    FOR EACH ROW
    EXECUTE FUNCTION update_comprobante_viatico_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comprobante_viatico' 
ORDER BY ordinal_position;

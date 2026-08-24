-- =====================================================
-- FASE 24: CATÁLOGO DE ORÍGENES DE FONDOS
-- Corrección Hallazgo #5 de Auditoría
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla de catálogo de orígenes de fondos
CREATE TABLE IF NOT EXISTS catalogo_origen_fondos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Comentarios
COMMENT ON TABLE catalogo_origen_fondos IS 'Catálogo de orígenes de fondos para viáticos y reembolsos';
COMMENT ON COLUMN catalogo_origen_fondos.codigo IS 'Código único del origen de fondos';
COMMENT ON COLUMN catalogo_origen_fondos.nombre IS 'Nombre descriptivo del origen';
COMMENT ON COLUMN catalogo_origen_fondos.descripcion IS 'Descripción detallada del origen';

-- Datos iniciales
INSERT INTO catalogo_origen_fondos (codigo, nombre, descripcion) VALUES
('PRESUPUESTO_GERENCIA', 'Presupuesto de Gerencia', 'Fondos asignados al presupuesto operativo de la gerencia'),
('PRESUPUESTO_CORPORATIVO', 'Presupuesto Corporativo', 'Fondos del presupuesto general de la empresa'),
('FONDOS_RESERVA', 'Fondos de Reserva', 'Fondos de reserva para emergencias y situaciones especiales'),
('FONDOS_ESPECIALES', 'Fondos Especiales', 'Fondos asignados para proyectos especiales o confidenciales'),
('FONDOS_CONVENCION', 'Fondos de Convención', 'Fondos provenientes de convenciones o acuerdos'),
('OTROS', 'Otros', 'Otros orígenes de fondos no categorizados');

-- Índices
CREATE INDEX idx_catalogo_origen_fondos_codigo ON catalogo_origen_fondos(codigo);
CREATE INDEX idx_catalogo_origen_fondos_activo ON catalogo_origen_fondos(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_catalogo_origen_fondos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_catalogo_origen_fondos
    BEFORE UPDATE ON catalogo_origen_fondos
    FOR EACH ROW
    EXECUTE FUNCTION update_catalogo_origen_fondos_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    codigo, 
    nombre, 
    descripcion
FROM catalogo_origen_fondos
WHERE activo = TRUE
ORDER BY codigo;

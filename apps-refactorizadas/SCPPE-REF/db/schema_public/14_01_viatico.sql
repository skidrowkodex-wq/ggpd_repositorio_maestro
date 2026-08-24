-- =====================================================
-- FASE 14: TABLA VIÁTICOS (DETALLE PARTIDA 405)
-- Análisis: for_opp_087_base_de_calculo_2027_proyecto.xlsx (Hoja 405)
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para almacenar detalles de viáticos (Partida 405)
-- Almacena concepto, personas, días y costos
CREATE TABLE IF NOT EXISTS viatico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a partida presupuestaria (FK)
    partida_presupuestaria_id UUID NOT NULL,
    CONSTRAINT fk_viatico_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) 
        ON DELETE CASCADE,
    
    -- Datos del viático
    concepto VARCHAR(255) NOT NULL,
    numero_personas INTEGER NOT NULL CHECK (numero_personas > 0),
    dias INTEGER NOT NULL CHECK (dias > 0),
    costo_unitario DECIMAL(15,2) NOT NULL CHECK (costo_unitario >= 0),
    costo_total DECIMAL(15,2) GENERATED ALWAYS AS (numero_personas * dias * costo_unitario) STORED,
    
    -- Campos ISO 8000/27001
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Comentarios de las columnas
COMMENT ON TABLE viatico IS 'Detalle de viáticos para partidas presupuestarias tipo 405';
COMMENT ON COLUMN viatico.partida_presupuestaria_id IS 'FK a partida_presupuestaria que contiene el monto total';
COMMENT ON COLUMN viatico.concepto IS 'Descripción del concepto de viático (ej: Relevamiento de data en estados)';
COMMENT ON COLUMN viatico.numero_personas IS 'Número de personas que realizan el viaje';
COMMENT ON COLUMN viatico.dias IS 'Número de días de viaje';
COMMENT ON COLUMN viatico.costo_unitario IS 'Costo por persona por día (Bs.)';
COMMENT ON COLUMN viatico.costo_total IS 'Costo total calculado (personas × días × costo_unitario)';

-- Índices
CREATE INDEX idx_viatico_partida ON viatico(partida_presupuestaria_id);
CREATE INDEX idx_viatico_concepto ON viatico(concepto);
CREATE INDEX idx_viatico_activo ON viatico(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viatico
    BEFORE UPDATE ON viatico
    FOR EACH ROW
    EXECUTE FUNCTION update_viatico_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viatico' 
ORDER BY ordinal_position;

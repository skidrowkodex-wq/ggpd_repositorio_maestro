-- =====================================================
-- FASE 12: TABLA RECURSO_HUMANO (DETALLE PARTIDA 402)
-- Análisis: for_opp_087_base_de_calculo_2027_proyecto.xlsx (Hoja 402)
-- Fecha: 2026-03-08
-- =====================================================

-- Tabla para almacenar detalles de recursos humanos (Partida 402)
-- Almacena roles funcionales, dedicación y costos mensuales
CREATE TABLE IF NOT EXISTS recurso_humano (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencia a partida presupuestaria (FK)
    partida_presupuestaria_id UUID NOT NULL,
    CONSTRAINT fk_recurso_humano_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) 
        ON DELETE CASCADE,
    
    -- Datos del recurso humano
    rol_funcional VARCHAR(255) NOT NULL,
    dedicacion_meses INTEGER NOT NULL CHECK (dedicacion_meses BETWEEN 1 AND 12),
    costo_mensual DECIMAL(15,2) NOT NULL CHECK (costo_mensual >= 0),
    costo_anual DECIMAL(15,2) GENERATED ALWAYS AS (costo_mensual * dedicacion_meses) STORED,
    
    -- Campos ISO 8000/27001
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Comentarios de las columnas
COMMENT ON TABLE recurso_humano IS 'Detalle de recursos humanos para partidas presupuestarias tipo 402';
COMMENT ON COLUMN recurso_humano.partida_presupuestaria_id IS 'FK a partida_presupuestaria que contiene el monto total';
COMMENT ON COLUMN recurso_humano.rol_funcional IS 'Nombre del rol o cargo funcional';
COMMENT ON COLUMN recurso_humano.dedicacion_meses IS 'Número de meses de dedicación (1-12)';
COMMENT ON COLUMN recurso_humano.costo_mensual IS 'Costo mensual del recurso humano';
COMMENT ON COLUMN recurso_humano.costo_anual IS 'Costo anual calculado (costo_mensual × dedicacion_meses)';

-- Índices
CREATE INDEX idx_recurso_humano_partida ON recurso_humano(partida_presupuestaria_id);
CREATE INDEX idx_recurso_humano_rol ON recurso_humano(rol_funcional);
CREATE INDEX idx_recurso_humano_activo ON recurso_humano(activo);

-- Trigger para actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_recurso_humano_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recurso_humano
    BEFORE UPDATE ON recurso_humano
    FOR EACH ROW
    EXECUTE FUNCTION update_recurso_humano_timestamp();

-- =====================================================
-- VERIFICACIÓN DE TABLA CREADA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'recurso_humano' 
ORDER BY ordinal_position;

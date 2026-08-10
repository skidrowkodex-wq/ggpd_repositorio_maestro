-- =====================================================
-- FASE 9: CAMPOS ADICIONALES PARA TABLA POA
-- Análisis: formulario_ficha_sipes_proyecto.xlsx
-- Fecha: 2026-03-08
-- =====================================================

-- 1. Campo: Proyecto plurianual
ALTER TABLE poa ADD COLUMN es_plurianual BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN poa.es_plurianual IS 'Indica si el proyecto es plurianual (varios años)';

-- 2. Campo: Situación presupuestaria
ALTER TABLE poa ADD COLUMN situacion_presupuestaria VARCHAR(50) DEFAULT 'POR INICIAR';
COMMENT ON COLUMN poa.situacion_presupuestaria IS 'Estado presupuestario del proyecto: POR INICIAR, EN EJECUCIÓN, FINALIZADO';

-- 3. Campo: Responsable técnico
ALTER TABLE poa ADD COLUMN responsable_tecnico_nombre VARCHAR(255);
COMMENT ON COLUMN poa.responsable_tecnico_nombre IS 'Nombre completo del responsable técnico del proyecto';

ALTER TABLE poa ADD COLUMN responsable_tecnico_email VARCHAR(100);
COMMENT ON COLUMN poa.responsable_tecnico_email IS 'Correo electrónico del responsable técnico';

-- 4. Campo: Responsable administrativo
ALTER TABLE poa ADD COLUMN responsable_admin_nombre VARCHAR(255);
COMMENT ON COLUMN poa.responsable_admin_nombre IS 'Nombre completo del responsable administrativo del proyecto';

ALTER TABLE poa ADD COLUMN responsable_admin_email VARCHAR(100);
COMMENT ON COLUMN poa.responsable_admin_email IS 'Correo electrónico del responsable administrativo';

-- 5. Campo: Localización del proyecto
ALTER TABLE poa ADD COLUMN localizacion TEXT;
COMMENT ON COLUMN poa.localizacion IS 'Ubicación física del proyecto (parroquia, municipio, estado)';

-- 6. Índices para nuevos campos
CREATE INDEX idx_poa_plurianual ON poa(es_plurianual);
CREATE INDEX idx_poa_situacion_presupuestaria ON poa(situacion_presupuestaria);
CREATE INDEX idx_poa_responsable_tecnico ON poa(responsable_tecnico_nombre);
CREATE INDEX idx_poa_responsable_admin ON poa(responsable_admin_nombre);

-- =====================================================
-- VERIFICACIÓN DE CAMPOS AGREGADOS
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'poa' 
AND column_name IN (
    'es_plurianual', 
    'situacion_presupuestaria', 
    'responsable_tecnico_nombre', 
    'responsable_tecnico_email',
    'responsable_admin_nombre', 
    'responsable_admin_email',
    'localizacion'
)
ORDER BY ordinal_position;

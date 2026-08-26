#!/usr/bin/env python3
"""
⚡ CORPOELEC - GGPD / INSFORGE ORGANIZATIONAL TREE & SCPPE MODERNIZATION DEPLOYER
Despliega el modelo de estructura organizacional recursiva y polimórfica en `core.*`
y moderniza el esquema `scppe.*` en InsForge PostgreSQL (ggpd-data-maestra-0002).
"""

import subprocess
import json

DDL_SQL = """
-- 1. CATÁLOGO DE TIPOS DE NODOS ORGANIZACIONALES
CREATE TABLE IF NOT EXISTS core.cat_tipos_organizacion (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel_jerarquico INT NOT NULL,
    sector VARCHAR(30) NOT NULL CHECK (sector IN ('ELECTRICO', 'PUBLICO_NACIONAL', 'REGIONAL_MUNICIPAL', 'COMUNAL', 'OTRO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ÁRBOL UNIVERSAL DE ORGANIZACIONES Y DEPENDENCIAS (Recursivo con parent_id)
CREATE TABLE IF NOT EXISTS core.dim_organizaciones (
    id VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50) REFERENCES core.dim_organizaciones(id) ON DELETE CASCADE,
    tipo_id VARCHAR(30) NOT NULL REFERENCES core.cat_tipos_organizacion(id),
    
    codigo_siglas VARCHAR(30) NOT NULL,
    nombre_oficial VARCHAR(250) NOT NULL,
    rif VARCHAR(20),
    codigo_estado VARCHAR(5) REFERENCES core.dim_estados(codigo_estado),
    
    titular_nombre VARCHAR(150),
    titular_cargo VARCHAR(150),
    titular_email VARCHAR(150),
    es_tenant_activo BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dim_organizaciones_parent ON core.dim_organizaciones(parent_id);
CREATE INDEX IF NOT EXISTS idx_dim_organizaciones_tipo ON core.dim_organizaciones(tipo_id);
CREATE INDEX IF NOT EXISTS idx_dim_organizaciones_estado ON core.dim_organizaciones(codigo_estado);

-- 3. ACTUALIZACIÓN RELACIONAL DE TABLAS DE SCPPE

-- scppe.mae_proyectos_especiales
ALTER TABLE scppe.mae_proyectos_especiales
    ADD COLUMN IF NOT EXISTS unidad_ejecutora_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS ente_financiador_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS circuito_asociado VARCHAR(150),
    ADD COLUMN IF NOT EXISTS accion_poa_codigo VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accion_poa_nombre VARCHAR(255);

-- scppe.mae_poa_acciones
ALTER TABLE scppe.mae_poa_acciones
    ADD COLUMN IF NOT EXISTS codigo VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nombre VARCHAR(255),
    ADD COLUMN IF NOT EXISTS unidad_ejecutora VARCHAR(150),
    ADD COLUMN IF NOT EXISTS unidad_ejecutora_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS ponderacion NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS meta_fisica_programada NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS meta_fisica_ejecutada NUMERIC DEFAULT 0;

-- scppe.mae_proyectos_ggd
ALTER TABLE scppe.mae_proyectos_ggd
    ADD COLUMN IF NOT EXISTS codigo_convenio VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ente_cofinanciador_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS ente_cofinanciador VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ente_nombre VARCHAR(150),
    ADD COLUMN IF NOT EXISTS gerencia_responsable_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS responsable_ggd VARCHAR(150),
    ADD COLUMN IF NOT EXISTS codigo_estado VARCHAR(5) REFERENCES core.dim_estados(codigo_estado),
    ADD COLUMN IF NOT EXISTS monto_estimado_bs NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS monto_estimado_usd NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS avance_fisico_pct NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS estatus_gestion VARCHAR(50) DEFAULT 'DESCENTRALIZADO_GGD',
    ADD COLUMN IF NOT EXISTS fecha_registro DATE DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- scppe.mae_viaticos_control
ALTER TABLE scppe.mae_viaticos_control
    ADD COLUMN IF NOT EXISTS unidad_solicitante_id VARCHAR(50) REFERENCES core.dim_organizaciones(id),
    ADD COLUMN IF NOT EXISTS gerencia_emisora_id VARCHAR(50) REFERENCES core.dim_organizaciones(id);

-- 4. VISTAS SEMÁNTICAS PÚBLICAS

DROP VIEW IF EXISTS public.samc_proyecto_ggd CASCADE;
DROP VIEW IF EXISTS public.samc_poa_accion_especifica CASCADE;
DROP VIEW IF EXISTS public.v_scppe_proyectos_ggd CASCADE;
DROP VIEW IF EXISTS public.v_scppe_proyectos_prtsen CASCADE;
DROP VIEW IF EXISTS public.v_scppe_poa_acciones CASCADE;
DROP VIEW IF EXISTS public.v_organizaciones_arbol CASCADE;

-- Vista de Árbol de Organizaciones
CREATE OR REPLACE VIEW public.v_organizaciones_arbol AS
SELECT 
    o.id,
    o.parent_id,
    p.nombre_oficial AS organizacion_padre_nombre,
    p.codigo_siglas AS organizacion_padre_siglas,
    o.tipo_id,
    t.nombre AS tipo_nombre,
    t.nivel_jerarquico,
    t.sector,
    o.codigo_siglas,
    o.nombre_oficial,
    o.rif,
    o.codigo_estado,
    e.nombre_estado,
    e.codigo_region,
    r.nombre_region,
    o.titular_nombre,
    o.titular_cargo,
    o.titular_email,
    o.es_tenant_activo,
    o.activo
FROM core.dim_organizaciones o
LEFT JOIN core.cat_tipos_organizacion t ON t.id = o.tipo_id
LEFT JOIN core.dim_organizaciones p ON p.id = o.parent_id
LEFT JOIN core.dim_estados e ON e.codigo_estado = o.codigo_estado
LEFT JOIN core.dim_regiones r ON r.codigo_region = e.codigo_region;

-- Vista Proyectos GGD Enriquecida con Organizaciones
CREATE OR REPLACE VIEW public.v_scppe_proyectos_ggd AS
SELECT 
    p.id,
    COALESCE(p.codigo_convenio, p.codigo) AS codigo_convenio,
    p.nombre,
    COALESCE(p.monto_estimado_bs, 0) AS monto_estimado_bs,
    COALESCE(p.monto_estimado_usd, p.inversion_usd, 0) AS monto_estimado_usd,
    COALESCE(p.avance_fisico_pct, p.avance_pct, 0) AS avance_fisico_pct,
    COALESCE(p.estatus_gestion, p.estatus, 'DESCENTRALIZADO_GGD') AS estatus_gestion,
    COALESCE(p.fecha_registro, p.created_at::date, CURRENT_DATE) AS fecha_registro,
    p.observaciones,
    p.codigo_estado,
    e.nombre_estado,
    e.codigo_region,
    r.nombre_region,
    -- Datos Ente Cofinanciador
    p.ente_cofinanciador_id,
    COALESCE(co.nombre_oficial, p.ente_nombre, 'Gobernación del Estado') AS ente_cofinanciador_nombre,
    COALESCE(co.codigo_siglas, p.ente_cofinanciador, 'GOB') AS ente_cofinanciador_siglas,
    COALESCE(tco.nombre, p.ente_cofinanciador, 'GOBERNACION') AS ente_cofinanciador_tipo,
    -- Datos Gerencia Responsable
    p.gerencia_responsable_id,
    COALESCE(gr.nombre_oficial, 'Gerencia General de Distribución') AS gerencia_responsable_nombre,
    COALESCE(gr.codigo_siglas, 'GGD') AS gerencia_responsable_siglas,
    p.responsable_ggd,
    p.created_at,
    p.updated_at
FROM scppe.mae_proyectos_ggd p
LEFT JOIN core.dim_estados e ON e.codigo_estado = p.codigo_estado
LEFT JOIN core.dim_regiones r ON r.codigo_region = e.codigo_region
LEFT JOIN core.dim_organizaciones co ON co.id = p.ente_cofinanciador_id
LEFT JOIN core.cat_tipos_organizacion tco ON tco.id = co.tipo_id
LEFT JOIN core.dim_organizaciones gr ON gr.id = p.gerencia_responsable_id;

-- Vista Proyectos PRTSEN Enriquecida
CREATE OR REPLACE VIEW public.v_scppe_proyectos_prtsen AS
SELECT 
    p.id,
    p.codigo_rds,
    p.nombre,
    p.dimension,
    p.codigo_region,
    r.nombre_region,
    p.codigo_estado,
    e.nombre_estado,
    p.subestacion_asociada,
    p.circuito_asociado,
    p.monto_usd,
    p.avance_fisico_pct,
    p.avance_financiero_pct,
    p.estatus,
    p.vinculado_poa,
    p.codigo_sipes,
    p.accion_poa_codigo,
    p.accion_poa_nombre,
    p.match_metodo,
    -- Unidad y Ente
    p.unidad_ejecutora_id,
    ue.nombre_oficial AS unidad_ejecutora_nombre,
    ue.codigo_siglas AS unidad_ejecutora_siglas,
    p.ente_financiador_id,
    ef.nombre_oficial AS ente_financiador_nombre,
    ef.codigo_siglas AS ente_financiador_siglas,
    p.created_at,
    p.updated_at
FROM scppe.mae_proyectos_especiales p
LEFT JOIN core.dim_regiones r ON r.codigo_region = p.codigo_region
LEFT JOIN core.dim_estados e ON e.codigo_estado = p.codigo_estado
LEFT JOIN core.dim_organizaciones ue ON ue.id = p.unidad_ejecutora_id
LEFT JOIN core.dim_organizaciones ef ON ef.id = p.ente_financiador_id;

-- Vista Acciones POA Enriquecida
CREATE OR REPLACE VIEW public.v_scppe_poa_acciones AS
SELECT 
    a.id,
    COALESCE(a.codigo, a.codigo_accion) AS codigo,
    COALESCE(a.nombre, a.descripcion) AS nombre,
    a.unidad_ejecutora_id,
    COALESCE(ue.nombre_oficial, a.unidad_ejecutora, 'División de Planificación Técnica') AS unidad_ejecutora,
    COALESCE(ue.codigo_siglas, 'DIV-PLANIF') AS unidad_ejecutora_siglas,
    COALESCE(a.ponderacion, 0) AS ponderacion,
    COALESCE(a.presupuesto_asignado_bs, 0) AS presupuesto_asignado_bs,
    COALESCE(a.presupuesto_ejecutado_bs, 0) AS presupuesto_ejecutado_bs,
    COALESCE(a.meta_fisica_programada, a.meta_anual, 0) AS meta_fisica_programada,
    COALESCE(a.meta_fisica_ejecutada, a.ejecutado_acumulado, 0) AS meta_fisica_ejecutada,
    a.unidad_medida,
    a.created_at,
    a.updated_at
FROM scppe.mae_poa_acciones a
LEFT JOIN core.dim_organizaciones ue ON ue.id = a.unidad_ejecutora_id;

-- Vista de Compatibilidad samc_proyecto_ggd
CREATE OR REPLACE VIEW public.samc_proyecto_ggd AS
SELECT * FROM public.v_scppe_proyectos_ggd;

-- Vista de Compatibilidad samc_poa_accion_especifica
CREATE OR REPLACE VIEW public.samc_poa_accion_especifica AS
SELECT * FROM public.v_scppe_poa_acciones;
"""

SEED_SQL = """
-- 1. TIPOS DE ORGANIZACIONES
INSERT INTO core.cat_tipos_organizacion (id, nombre, nivel_jerarquico, sector) VALUES
('MINISTERIO', 'Ministerio / Órgano Rector', 1, 'PUBLICO_NACIONAL'),
('EMPRESA_MATRIZ', 'Empresa Matriz / Corporación', 1, 'ELECTRICO'),
('ENTE_ADSCRITO', 'Ente Adscrito / Instituto Autónomo', 2, 'ELECTRICO'),
('DESPACHO_PRESIDENCIA', 'Despacho de Presidencia / Dirección Superior', 2, 'ELECTRICO'),
('GERENCIA_GENERAL', 'Gerencia General / Dirección General', 3, 'ELECTRICO'),
('DIVISION_UNIDAD', 'División / Coordinación Operativa', 4, 'ELECTRICO'),
('GOBERNACION', 'Gobernación de Estado', 2, 'REGIONAL_MUNICIPAL'),
('ALCALDIA', 'Alcaldía de Municipio', 3, 'REGIONAL_MUNICIPAL'),
('CONVENIO_COMUNAL', 'Consejo Comunal / Poder Popular', 4, 'COMUNAL'),
('EMPRESA_ESTATAL', 'Empresa Estatal Aliada', 2, 'PUBLICO_NACIONAL')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    nivel_jerarquico = EXCLUDED.nivel_jerarquico,
    sector = EXCLUDED.sector;

-- 2. ÁRBOL ORGANIZACIONAL MAESTRO
INSERT INTO core.dim_organizaciones (
    id, parent_id, tipo_id, codigo_siglas, nombre_oficial, rif, codigo_estado, titular_nombre, titular_cargo, es_tenant_activo, activo
) VALUES
-- Nivel 1: Órganos Rectores y Matrices
('MPPEE', NULL, 'MINISTERIO', 'MPPEE', 'Ministerio del Poder Popular para la Energía Eléctrica', 'G-20009542-0', 'DCA', 'G/J Néstor Reverol', 'Ministro', TRUE, TRUE),
('CORPOELEC', 'MPPEE', 'EMPRESA_MATRIZ', 'CORPOELEC', 'Corporación Eléctrica Nacional, S.A.', 'G-20010014-1', 'DCA', 'Ing. José Luis Betancourt', 'Presidente', TRUE, TRUE),
('MPPP', NULL, 'MINISTERIO', 'MPPP', 'Ministerio del Poder Popular de Planificación', 'G-20002451-8', 'DCA', 'Ricardo Menéndez', 'Ministro', FALSE, TRUE),
('PDVSA', NULL, 'EMPRESA_ESTATAL', 'PDVSA', 'Petróleos de Venezuela, S.A.', 'J-00095036-9', 'DCA', 'Ing. Héctor Obregón', 'Presidente', FALSE, TRUE),

-- Nivel 2: Entes Adscritos y Despachos
('FUNDELEC', 'MPPEE', 'ENTE_ADSCRITO', 'FUNDELEC', 'Fundación para el Desarrollo del Servicio Eléctrico', 'G-20002145-4', 'DCA', 'Ing. Carlos Mendoza', 'Director Ejecutivo', TRUE, TRUE),
('CNEE', 'MPPEE', 'ENTE_ADSCRITO', 'CNEE', 'Centro Nacional de Despacho y Operación Eléctrica', 'G-20003312-0', 'DCA', 'Ing. Roberto Fuentes', 'Director General', TRUE, TRUE),
('CORPOELEC_PRES', 'CORPOELEC', 'DESPACHO_PRESIDENCIA', 'PRESIDENCIA', 'Despacho de Presidencia de CORPOELEC', 'G-20010014-1', 'DCA', 'Ing. José Luis Betancourt', 'Presidente', TRUE, TRUE),

-- Nivel 3: Gerencias Generales de CORPOELEC
('CORPOELEC_GGD', 'CORPOELEC', 'GERENCIA_GENERAL', 'GGD', 'Gerencia General de Distribución', 'G-20010014-1', 'DCA', 'Ing. Adrián Correa', 'Gerente General de Distribución', TRUE, TRUE),
('CORPOELEC_GGPD', 'CORPOELEC', 'GERENCIA_GENERAL', 'GGPD', 'Gerencia General de Gestión de Planificación de Distribución', 'G-20010014-1', 'DCA', 'Ing. Carlos Reyes', 'Gerente General de Planificación', TRUE, TRUE),
('CORPOELEC_GGT', 'CORPOELEC', 'GERENCIA_GENERAL', 'GGT', 'Gerencia General de Transmisión', 'G-20010014-1', 'DCA', 'Ing. Marcos Valera', 'Gerente General de Transmisión', TRUE, TRUE),
('CORPOELEC_CGGTH', 'CORPOELEC', 'GERENCIA_GENERAL', 'CGGTH', 'Gerencia General de Talento Humano', 'G-20010014-1', 'DCA', 'Lic. Yelitza Tovar', 'Gerente General (E)', TRUE, TRUE),
('CORPOELEC_GGPPSYC', 'CORPOELEC', 'GERENCIA_GENERAL', 'GGPPSYC', 'Gerencia General de Comercialización y Grandes Usuarios', 'G-20010014-1', 'DCA', 'Ing. Alejandro Blanco', 'Gerente General', TRUE, TRUE),

-- Nivel 4: Divisiones y Unidades Ejecutoras
('GGPD_DIV_PLANIF', 'CORPOELEC_GGPD', 'DIVISION_UNIDAD', 'DIV-PLANIF', 'División de Planificación Técnica y Estudios SEN', 'G-20010014-1', 'DCA', 'Ing. Josué Pacheco', 'Jefe de División', TRUE, TRUE),
('GGPD_DIV_AUTO', 'CORPOELEC_GGPD', 'DIVISION_UNIDAD', 'DIV-AUTO', 'División de Automatización e Ingeniería de Productos con IA', 'G-20010014-1', 'DCA', 'Ing. Yván Cipiran', 'Líder de Automatización', TRUE, TRUE),
('GGPD_DIV_PROY', 'CORPOELEC_GGPD', 'DIVISION_UNIDAD', 'DIV-PROY', 'División de Formulación y Proyectos PRTSEN', 'G-20010014-1', 'DCA', 'Ing. Gabriela Morillo', 'Jefe de División', TRUE, TRUE),
('GGD_DIV_MTTO', 'CORPOELEC_GGD', 'DIVISION_UNIDAD', 'DIV-MTTO', 'División de Mantenimiento de Redes y Subestaciones', 'G-20010014-1', 'DCA', 'Ing. Luis Zambrano', 'Jefe de División', TRUE, TRUE),

-- Entes Regionales y Municipales (Cofinanciadores / Convenios)
('GOB_MIRANDA', NULL, 'GOBERNACION', 'GOB-MIRANDA', 'Gobernación del Estado Bolivariano de Miranda', 'G-20000142-2', 'MIR', 'G/D Elio Serrano', 'Gobernador (E)', FALSE, TRUE),
('GOB_ZULIA', NULL, 'GOBERNACION', 'GOB-ZULIA', 'Gobernación del Estado Zulia', 'G-20000102-3', 'ZUL', 'Manuel Rosales', 'Gobernador', FALSE, TRUE),
('GOB_TACHIRA', NULL, 'GOBERNACION', 'GOB-TACHIRA', 'Gobernación del Estado Táchira', 'G-20000122-8', 'TAC', 'Freddy Bernal', 'Gobernador', FALSE, TRUE),
('GOB_CARABOBO', NULL, 'GOBERNACION', 'GOB-CARABOBO', 'Gobernación del Estado Carabobo', 'G-20000132-5', 'CAR', 'Rafael Lacava', 'Gobernador', FALSE, TRUE),
('GOB_LARA', NULL, 'GOBERNACION', 'GOB-LARA', 'Gobernación del Estado Lara', 'G-20000112-0', 'LAR', 'Adolfo Pereira', 'Gobernador', FALSE, TRUE),
('ALC_CARACAS', NULL, 'ALCALDIA', 'ALC-LIBERTADOR', 'Alcaldía del Municipio Bolivariano Libertador', 'G-20000025-6', 'DCA', 'A/J Carmen Meléndez', 'Alcaldesa', FALSE, TRUE),
('ALC_MARACAIBO', NULL, 'ALCALDIA', 'ALC-MARACAIBO', 'Alcaldía del Municipio Maracaibo', 'G-20000215-1', 'ZUL', 'Rafael Ramírez', 'Alcalde', FALSE, TRUE),
('ALC_SAN_CRISTOBAL', NULL, 'ALCALDIA', 'ALC-SC', 'Alcaldía del Municipio San Cristóbal', 'G-20000225-9', 'TAC', 'Silvestre García', 'Alcalde', FALSE, TRUE),
('CONV_COMUNAL_01', NULL, 'CONVENIO_COMUNAL', 'CC-PETARE', 'Consejo Comunal Unión Petare Sur', 'J-50001245-0', 'MIR', 'Vocería de Energía Eléctrica', 'Coordinador Comunal', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    parent_id = EXCLUDED.parent_id,
    tipo_id = EXCLUDED.tipo_id,
    codigo_siglas = EXCLUDED.codigo_siglas,
    nombre_oficial = EXCLUDED.nombre_oficial,
    rif = EXCLUDED.rif,
    codigo_estado = EXCLUDED.codigo_estado,
    titular_nombre = EXCLUDED.titular_nombre,
    titular_cargo = EXCLUDED.titular_cargo,
    es_tenant_activo = EXCLUDED.es_tenant_activo,
    activo = EXCLUDED.activo;

-- 3. PROYECTOS GGD SEMBRADOS CON ENTES COFINANCIADORES
INSERT INTO scppe.mae_proyectos_ggd (
    id, codigo, codigo_convenio, nombre, ente_cofinanciador_id, ente_cofinanciador, ente_nombre,
    gerencia_responsable_id, responsable_ggd, codigo_estado, monto_estimado_bs,
    monto_estimado_usd, avance_fisico_pct, estatus_gestion, fecha_registro, observaciones
) VALUES
('ggd-001', 'CONV-GGD-2026-MIR-01', 'CONV-GGD-2026-MIR-01', 'Rehabilitación de Alumbrado y Redes Sector Santa Teresa del Tuy', 'GOB_MIRANDA', 'GOBERNACION', 'Gobernación del Estado Bolivariano de Miranda', 'CORPOELEC_GGD', 'Ing. Carlos Mendoza (GGD Miranda)', 'MIR', 12500000, 215000, 65.0, 'DESCENTRALIZADO_GGD', '2026-08-01', 'Convenio Gobernación de Miranda - GGD para sustitución de 40 transformadores y luminarias LED.'),
('ggd-002', 'CONV-GGD-2026-ZUL-02', 'CONV-GGD-2026-ZUL-02', 'Sustitución de Celdas y Acometidas Circuito Delicias Norte', 'ALC_MARACAIBO', 'ALCALDIA', 'Alcaldía del Municipio Maracaibo', 'CORPOELEC_GGD', 'Ing. Roberto Silva (GGD Zulia)', 'ZUL', 8900000, 150000, 40.0, 'EN_REVISION_PLANIFICACION', '2026-08-10', 'Convenio municipal Maracaibo con despacho de carga regional.'),
('ggd-003', 'CONV-GGD-2026-TAC-03', 'CONV-GGD-2026-TAC-03', 'Adecuación de Redes Rurales y Postes en Troncal 5 La Pedrera', 'GOB_TACHIRA', 'GOBERNACION', 'Gobernación del Estado Táchira', 'CORPOELEC_GGD', 'Ing. Marcos Chacón (GGD Táchira)', 'TAC', 5200000, 90000, 85.0, 'NORMALIZADO_POA_PRTSEN', '2026-07-20', 'Proyecto articulado con el Plan PRTSEN Los Andes e incorporado al POA 2026.')
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    codigo_convenio = EXCLUDED.codigo_convenio,
    nombre = EXCLUDED.nombre,
    ente_cofinanciador_id = EXCLUDED.ente_cofinanciador_id,
    gerencia_responsable_id = EXCLUDED.gerencia_responsable_id,
    monto_estimado_usd = EXCLUDED.monto_estimado_usd,
    avance_fisico_pct = EXCLUDED.avance_fisico_pct,
    estatus_gestion = EXCLUDED.estatus_gestion;

-- 4. VINCULACIÓN EN PROYECTOS ESPECIALES PRTSEN Y POA
UPDATE scppe.mae_proyectos_especiales SET
    unidad_ejecutora_id = 'GGPD_DIV_PLANIF',
    ente_financiador_id = 'MPPEE'
WHERE id IN ('prt-001', 'prt-002', 'prt-003');

UPDATE scppe.mae_poa_acciones SET
    codigo = 'POA-2026-D01',
    nombre = 'Adecuación y Normalización de Subestaciones Troncales de Distribución',
    unidad_ejecutora_id = 'GGPD_DIV_PLANIF',
    ponderacion = 40.0,
    meta_fisica_programada = 100.0,
    meta_fisica_ejecutada = 78.5
WHERE id = 'poa-001';
"""

def run_query(sql):
    res = subprocess.run(['npx', '@insforge/cli', 'db', 'query', sql], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Error ejecutando SQL: {res.stderr}")
        return False
    print(res.stdout)
    return True

def main():
    print("================================================================================")
    print("⚡ DESPLEGANDO MODELO ORGANIZACIONAL RECURSIVO Y POLIMÓRFICO EN INSFORGE")
    print("================================================================================")
    
    print("\n1. Creando tablas `core.cat_tipos_organizacion`, `core.dim_organizaciones` y vistas...")
    if not run_query(DDL_SQL):
        return

    print("\n2. Sembrando catálogo universal de organizaciones (CORPOELEC, MPPEE, FUNDELEC, Gobernaciones, Alcaldías)...")
    if not run_query(SEED_SQL):
        return

    print("\n3. Verificando conteo de organizaciones sembradas...")
    run_query("SELECT tipo_id, COUNT(*) AS total FROM core.dim_organizaciones GROUP BY tipo_id ORDER BY total DESC;")

    print("\n4. Verificando vista semántica v_scppe_proyectos_ggd...")
    run_query("SELECT id, codigo_convenio, nombre, ente_cofinanciador_nombre, gerencia_responsable_nombre FROM public.v_scppe_proyectos_ggd LIMIT 3;")

if __name__ == "__main__":
    main()

-- ====================================================================================
-- MIGRACIÓN 09: ACCESO DEL ROL `anon` (CLAVE PÚBLICA) A SIGAD Y SIGA-SEN
-- PROYECTO: Repositorio Maestro CORPOELEC (GGPD) • InsForge ggpd-data-maestra-0002
-- ------------------------------------------------------------------------------------
-- CONTEXTO / OBJETIVO (ISO/IEC 27001 A.5.15, A.8.3 · OWASP ASVS v4 V14 · COBIT MEA02):
--   SIGAD y SIGA-SEN dejan de empaquetar la CLAVE DE SERVICIO (rol `project_admin`,
--   con BYPASSRLS) en el bundle público. El navegador pasa a usar la CLAVE PÚBLICA
--   (`anon`), que SÍ está sujeta a Row Level Security.
--
--   La migración 08 habilitó RLS en `sigad`/`sigad_sen` SIN políticas (fail-closed),
--   lo que bloquea por completo al rol `anon`. Esta migración abre EXACTAMENTE lo que
--   las dos aplicaciones necesitan y NADA más:
--     · sigad.estructuras_subestaciones  -> SELECT / INSERT / UPDATE (snapshot JSONB)
--     · sigad.componentes_patio          -> INSERT (inventario de patio)
--     · sigad.eventos_historial          -> INSERT (bitácora de eventos)
--     · sigad_sen.* (tablas base)        -> SELECT (catálogos/topología del SEN)
--     · core.mae_subestaciones / mae_circuitos -> SELECT (catálogos maestros; ya
--       tenían política RLS `p_select_*` para anon, solo faltaba el GRANT de tabla).
--
--   NOTA DE LÍMITES (documentado en handoff): el `anon` es una identidad única y
--   pública (la clave viaja en el bundle), por lo que la autorización por USUARIO no
--   es posible con esta arquitectura; requiere emitir un JWT de plataforma (InsForge
--   Auth) por sesión. El alcance se limita deliberadamente a `sigad`, `sigad_sen` y
--   DOS catálogos de `core`, sin acceso a `core.mae_usuarios_sistema` (hashes bcrypt)
--   ni a los esquemas de las demás aplicaciones (SCGCC, SCTIS, SCEIN, SCPPE, SIGI).
-- ====================================================================================

-- ------------------------------------------------------------------------------------
-- 1) CATÁLOGOS MAESTROS DE `core` CONSUMIDOS POR SIGAD
--    (las políticas SELECT para anon ya existen: p_select_subestaciones / p_select_circuitos)
-- ------------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA core TO anon;
GRANT SELECT ON core.mae_subestaciones TO anon;
GRANT SELECT ON core.mae_circuitos TO anon;

-- ------------------------------------------------------------------------------------
-- 2) POLÍTICAS RLS PARA `anon` EN EL ESQUEMA `sigad`
-- ------------------------------------------------------------------------------------
DROP POLICY IF EXISTS p_anon_all_estructuras ON sigad.estructuras_subestaciones;
CREATE POLICY p_anon_all_estructuras ON sigad.estructuras_subestaciones
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_all_componentes ON sigad.componentes_patio;
CREATE POLICY p_anon_all_componentes ON sigad.componentes_patio
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_all_eventos ON sigad.eventos_historial;
CREATE POLICY p_anon_all_eventos ON sigad.eventos_historial
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------------
-- 3) POLÍTICAS RLS PARA `anon` EN EL ESQUEMA `sigad_sen` (tablas base del SEN)
-- ------------------------------------------------------------------------------------
DROP POLICY IF EXISTS p_anon_sel_barras ON sigad_sen.cnd_barras;
CREATE POLICY p_anon_sel_barras ON sigad_sen.cnd_barras
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_clientes ON sigad_sen.cnd_clientes_industriales;
CREATE POLICY p_anon_sel_clientes ON sigad_sen.cnd_clientes_industriales
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_compensacion ON sigad_sen.cnd_compensacion_reactiva;
CREATE POLICY p_anon_sel_compensacion ON sigad_sen.cnd_compensacion_reactiva
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_generacion ON sigad_sen.cnd_generacion;
CREATE POLICY p_anon_sel_generacion ON sigad_sen.cnd_generacion
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_lineas_tramos ON sigad_sen.cnd_lineas_tramos;
CREATE POLICY p_anon_sel_lineas_tramos ON sigad_sen.cnd_lineas_tramos
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_metadata ON sigad_sen.cnd_metadata;
CREATE POLICY p_anon_sel_metadata ON sigad_sen.cnd_metadata
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_niveles_tension ON sigad_sen.cnd_niveles_tension;
CREATE POLICY p_anon_sel_niveles_tension ON sigad_sen.cnd_niveles_tension
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_rotulos ON sigad_sen.cnd_rotulos_texto;
CREATE POLICY p_anon_sel_rotulos ON sigad_sen.cnd_rotulos_texto
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_subestaciones ON sigad_sen.cnd_subestaciones;
CREATE POLICY p_anon_sel_subestaciones ON sigad_sen.cnd_subestaciones
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_anon_sel_transformadores ON sigad_sen.cnd_transformadores;
CREATE POLICY p_anon_sel_transformadores ON sigad_sen.cnd_transformadores
  AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------------
-- 4) VERIFICACIÓN INMEDIATA (se imprime en el log de la migración)
-- ------------------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'IAM anon: USAGE core=% | SELECT mae_subestaciones=% | SELECT mae_circuitos=%',
    has_schema_privilege('anon','core','USAGE'),
    has_table_privilege('anon','core.mae_subestaciones','SELECT'),
    has_table_privilege('anon','core.mae_circuitos','SELECT');
END $$;

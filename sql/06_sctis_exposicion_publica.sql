-- ============================================================================
-- MIGRACIÓN: 06_sctis_exposicion_publica.sql
-- Exposición pública (API REST InsForge) de las entidades del esquema sctis
-- para que SCTIS-REF escriba/lea 100% contra InsForge (sin mock, sin SQLite).
-- Patrón idéntico al aplicado en SCPPE (sql 17_samc_comprobante_viatico.sql):
-- vistas públicas visibles en `public` + triggers INSTEAD OF para escritura.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Tiras de interrupción: escritura sobre la vista ya existente
--    public.v_sctis_tiras_interrupcion (hace JOIN a core.dim_estados → NO es
--    auto-actualizable, por eso requiere triggers INSTEAD OF).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ins_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sctis.mae_interrupciones_tiras (
        id, codigo_estado, subestacion_nombre, circuito_codigo,
        fecha_apertura, fecha_cierre, duracion_minutos, mw_interrumpidos,
        causa_codigo, subcausa_codigo, despachador, observaciones,
        calidad_score, created_at, updated_at
    ) VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.codigo_estado, NEW.subestacion_nombre, NEW.circuito_codigo,
        NEW.fecha_apertura, NEW.fecha_cierre, NEW.duracion_minutos, NEW.mw_interrumpidos,
        NEW.causa_codigo, NEW.subcausa_codigo, NEW.despachador, NEW.observaciones,
        NEW.calidad_score, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ins_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_ins_v_sctis_tiras
    INSTEAD OF INSERT ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.ins_v_sctis_tiras();

CREATE OR REPLACE FUNCTION public.upd_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sctis.mae_interrupciones_tiras SET
        codigo_estado     = NEW.codigo_estado,
        subestacion_nombre = NEW.subestacion_nombre,
        circuito_codigo   = NEW.circuito_codigo,
        fecha_apertura    = NEW.fecha_apertura,
        fecha_cierre      = NEW.fecha_cierre,
        duracion_minutos  = NEW.duracion_minutos,
        mw_interrumpidos  = NEW.mw_interrumpidos,
        causa_codigo      = NEW.causa_codigo,
        subcausa_codigo   = NEW.subcausa_codigo,
        despachador       = NEW.despachador,
        observaciones     = NEW.observaciones,
        calidad_score     = NEW.calidad_score,
        updated_at        = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upd_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_upd_v_sctis_tiras
    INSTEAD OF UPDATE ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.upd_v_sctis_tiras();

CREATE OR REPLACE FUNCTION public.del_v_sctis_tiras()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM sctis.mae_interrupciones_tiras WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_del_v_sctis_tiras ON public.v_sctis_tiras_interrupcion;
CREATE TRIGGER trg_del_v_sctis_tiras
    INSTEAD OF DELETE ON public.v_sctis_tiras_interrupcion
    FOR EACH ROW EXECUTE FUNCTION public.del_v_sctis_tiras();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.v_sctis_tiras_interrupcion TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Catálogo de despachadores: vista pública de lectura para la UI
--    (el frontend lee sugerencias; no requiere escritura desde la app).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_sctis_despachadores AS
SELECT
    d.id,
    d.codigo_despachador,
    d.nombre,
    d.centro_despacho,
    d.es_activo,
    d.created_at
FROM sctis.cat_despachadores d;

GRANT SELECT ON public.v_sctis_despachadores TO anon, authenticated;

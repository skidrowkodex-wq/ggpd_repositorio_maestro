-- ============================================================================
-- 11_samc_sync_programado.sql
-- Sincronización automática: base_calculo → meta_financiera → accion
--
-- Cadena:
--   base_calculo.total (cantidad × costo_unitario, GENERATED)
--     → meta_financiera.programado = SUM(base_calculo.total)
--       → accion.programado = SUM(meta_financiera.programado)
--         → accion.eficacia / restante (GENERATED, se actualizan solos)
-- ============================================================================

BEGIN;

SET search_path TO samc;

-- ============================================================================
-- Paso 1: Función para sincronizar meta_financiera.programado desde sus bases
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.sync_meta_financiera_programado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_meta_id UUID;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        v_meta_id := NEW.meta_financiera_id;
    ELSIF TG_OP = 'DELETE' THEN
        v_meta_id := OLD.meta_financiera_id;
    END IF;

    UPDATE samc.samc_meta_financiera mf
    SET programado = COALESCE((
        SELECT SUM(bc.total)
        FROM samc.samc_base_calculo bc
        WHERE bc.meta_financiera_id = v_meta_id
    ), 0)
    WHERE mf.id = v_meta_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION samc.sync_meta_financiera_programado IS 'Trigger: actualiza meta_financiera.programado = SUM(base_calculo.total)';

-- ============================================================================
-- Paso 2: Triggers sobre samc_base_calculo
-- ============================================================================

DROP TRIGGER IF EXISTS trg_sync_programado_insert ON samc.samc_base_calculo;
CREATE TRIGGER trg_sync_programado_insert
    AFTER INSERT ON samc.samc_base_calculo
    FOR EACH ROW EXECUTE FUNCTION samc.sync_meta_financiera_programado();

DROP TRIGGER IF EXISTS trg_sync_programado_update ON samc.samc_base_calculo;
CREATE TRIGGER trg_sync_programado_update
    AFTER UPDATE OF cantidad, costo_unitario ON samc.samc_base_calculo
    FOR EACH ROW EXECUTE FUNCTION samc.sync_meta_financiera_programado();

DROP TRIGGER IF EXISTS trg_sync_programado_delete ON samc.samc_base_calculo;
CREATE TRIGGER trg_sync_programado_delete
    AFTER DELETE ON samc.samc_base_calculo
    FOR EACH ROW EXECUTE FUNCTION samc.sync_meta_financiera_programado();

-- ============================================================================
-- Paso 3: Función para sincronizar accion.programado desde sus metas
-- ============================================================================

CREATE OR REPLACE FUNCTION samc.sync_accion_programado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_acc_id UUID;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        v_acc_id := NEW.acc_esp_id;
    ELSIF TG_OP = 'DELETE' THEN
        v_acc_id := OLD.acc_esp_id;
    END IF;

    UPDATE samc.samc_poa_accion_especifica ae
    SET programado = COALESCE((
        SELECT SUM(mf.programado)
        FROM samc.samc_meta_financiera mf
        WHERE mf.acc_esp_id = v_acc_id
    ), 0)
    WHERE ae.id = v_acc_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION samc.sync_accion_programado IS 'Trigger: actualiza accion.programado = SUM(meta_financiera.programado)';

-- ============================================================================
-- Paso 4: Triggers sobre samc_meta_financiera
-- ============================================================================

DROP TRIGGER IF EXISTS trg_sync_accion_programado_insert ON samc.samc_meta_financiera;
CREATE TRIGGER trg_sync_accion_programado_insert
    AFTER INSERT ON samc.samc_meta_financiera
    FOR EACH ROW EXECUTE FUNCTION samc.sync_accion_programado();

DROP TRIGGER IF EXISTS trg_sync_accion_programado_update ON samc.samc_meta_financiera;
CREATE TRIGGER trg_sync_accion_programado_update
    AFTER UPDATE OF programado ON samc.samc_meta_financiera
    FOR EACH ROW EXECUTE FUNCTION samc.sync_accion_programado();

DROP TRIGGER IF EXISTS trg_sync_accion_programado_delete ON samc.samc_meta_financiera;
CREATE TRIGGER trg_sync_accion_programado_delete
    AFTER DELETE ON samc.samc_meta_financiera
    FOR EACH ROW EXECUTE FUNCTION samc.sync_accion_programado();

-- ============================================================================
-- Paso 5: Sincronizar datos existentes
-- ============================================================================

-- Actualizar programado de metas desde sus bases de cálculo
UPDATE samc.samc_meta_financiera mf
SET programado = COALESCE((
    SELECT SUM(bc.total)
    FROM samc.samc_base_calculo bc
    WHERE bc.meta_financiera_id = mf.id
), 0);

-- Actualizar programado de acciones desde sus metas
UPDATE samc.samc_poa_accion_especifica ae
SET programado = COALESCE((
    SELECT SUM(mf.programado)
    FROM samc.samc_meta_financiera mf
    WHERE mf.acc_esp_id = ae.id
), 0);

COMMIT;

-- ============================================================================
-- FASE 31: DATOS DE EJEMPLO - METAS FÍSICAS CON PRESUPUESTO
-- Fecha: 2026-03-09
-- Descripción: Inserción de datos de ejemplo para metas físicas vinculadas
-- ============================================================================

-- ============================================================================
-- 1. INSERTAR METAS FÍSICAS (12 meses para la acción específica)
-- ============================================================================

DO $$
DECLARE
    v_accion_id UUID;
    v_mes RECORD;
    v_programado DECIMAL(15,2);
    v_ejecutado DECIMAL(15,2);
BEGIN
    -- Obtener ID de la acción específica
    SELECT id INTO v_accion_id 
    FROM accion_especifica 
    WHERE nombre LIKE '%Relevamiento%' 
    LIMIT 1;
    
    IF v_accion_id IS NULL THEN
        RAISE NOTICE 'No se encontró acción específica';
        RETURN;
    END IF;
    
    -- Insertar metas mensuales (programado = 100/12 ≈ 8.33 por mes)
    FOR v_mes IN SELECT id, numero FROM mes ORDER BY numero
    LOOP
        -- Programado: distribuir 100% en 12 meses
        v_programado := 8.33;
        
        -- Ejecutado: vari según el mes (simular avance)
        CASE v_mes.numero
            WHEN 1 THEN v_ejecutado := 7.50;  -- 90%
            WHEN 2 THEN v_ejecutado := 8.00;  -- 96%
            WHEN 3 THEN v_ejecutado := 8.33;  -- 100%
            WHEN 4 THEN v_ejecutado := 8.33;  -- 100%
            WHEN 5 THEN v_ejecutado := 8.33;  -- 100%
            WHEN 6 THEN v_ejecutado := 8.33;  -- 100%
            WHEN 7 THEN v_ejecutado := 8.33;  -- 100%
            WHEN 8 THEN v_ejecutado := 0;     -- 0% (futuro)
            WHEN 9 THEN v_ejecutado := 0;     -- 0% (futuro)
            WHEN 10 THEN v_ejecutado := 0;    -- 0% (futuro)
            WHEN 11 THEN v_ejecutado := 0;    -- 0% (futuro)
            WHEN 12 THEN v_ejecutado := 0;    -- 0% (futuro)
        END CASE;
        
        INSERT INTO meta_fisica (
            accion_especifica_id, mes_id, anio, programado, ejecutado, unidad_medida
        )
        VALUES (
            v_accion_id, v_mes.id, 2027, v_programado, v_ejecutado, 'Porcentaje'
        )
        ON CONFLICT (accion_especifica_id, mes_id, anio) 
        DO UPDATE SET 
            programado = v_programado,
            ejecutado = v_ejecutado,
            updated_at = NOW();
    END LOOP;
    
    RAISE NOTICE 'Metas físicas insertadas para 12 meses';
END $$;

-- ============================================================================
-- 2. INSERTAR VINCULACIÓN CON PRESUPUESTO
-- ============================================================================

DO $$
DECLARE
    v_meta RECORD;
    v_partida RECORD;
    v_monto_mensual DECIMAL(15,2);
    v_monto_ejecutado DECIMAL(15,2);
BEGIN
    -- Para cada meta física
    FOR v_meta IN 
        SELECT mf.id, mf.mes_id, mf.anio, mf.ejecutado
        FROM meta_fisica mf
        WHERE mf.activo = TRUE
    LOOP
        -- Para cada partida activa
        FOR v_partida IN 
            SELECT id, codigo, monto_presupuestado
            FROM partida_presupuestaria
            WHERE activo = TRUE
        LOOP
            -- Calcular monto mensual proporcional
            v_monto_mensual := v_partida.monto_presupuestado / 12;
            
            -- Calcular monto ejecutado basado en eficacia de meta
            v_monto_ejecutado := v_monto_mensual * (v_meta.ejecutado / 100);
            
            -- Insertar vinculación
            INSERT INTO meta_fisica_presupuesto (
                meta_fisica_id, partida_presupuestaria_id,
                monto_asignado, monto_ejecutado, observaciones
            )
            VALUES (
                v_meta.id, v_partida.id,
                v_monto_mensual, v_monto_ejecutado,
                'Vinculación automática - ' || v_partida.codigo
            )
            ON CONFLICT (meta_fisica_id, partida_presupuestaria_id)
            DO UPDATE SET 
                monto_asignado = v_monto_mensual,
                monto_ejecutado = v_monto_ejecutado,
                updated_at = NOW();
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Vinculaciones meta-presupuesto insertadas';
END $$;

-- ============================================================================
-- 3. VERIFICACIÓN
-- ============================================================================

-- Verificar metas físicas
SELECT 
    'METAS FÍSICAS' AS verificacion,
    COUNT(*) AS registros
FROM meta_fisica
WHERE activo = TRUE;

-- Verificar vinculaciones
SELECT 
    'VINCULACIONES' AS verificacion,
    COUNT(*) AS registros
FROM meta_fisica_presupuesto
WHERE activo = TRUE;

-- Verificar vista de rendición
SELECT 
    accion_especifica,
    mes,
    meta_programada,
    meta_ejecutada,
    eficacia_fisica,
    presupuesto_asignado,
    presupuesto_ejecutado,
    indicador_rendicion
FROM v_rendicion_metas_fisicas
LIMIT 6;

-- ============================================================================
-- FIN DATOS DE EJEMPLO
-- ============================================================================

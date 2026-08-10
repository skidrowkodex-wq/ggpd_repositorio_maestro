-- ============================================================================
-- FASE 29: SISTEMA DE CONTROL DE ITEMS POR PARTIDA PRESUPUESTARIA
-- Fecha: 2026-03-09
-- Descripción: Creación de tablas, triggers y vistas para control de items
--              presupuestarios por partida, basado en formato oficial F-PMFFAC-002
-- ============================================================================

-- ============================================================================
-- 1. TABLA: partida_elemento (Catálogo de elementos por partida)
-- ============================================================================
-- Sub-items dentro de cada partida presupuestaria (ej: 402.03.02 = Prendas de Vestir)
-- Basado en la codificación del Clasificador Presupuestario Nacional

CREATE TABLE IF NOT EXISTS partida_elemento (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_presupuestaria_id UUID NOT NULL,
    codigo                  VARCHAR(50) NOT NULL,           -- '03.02' (GEN.ESP)
    nombre                  VARCHAR(255) NOT NULL,          -- 'Prendas de Vestir'
    descripcion             TEXT,
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    version                 INT NOT NULL DEFAULT 1,
    
    CONSTRAINT fk_partida_elemento_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) ON DELETE CASCADE,
    CONSTRAINT uq_partida_elemento_codigo 
        UNIQUE (partida_presupuestaria_id, codigo),
    CONSTRAINT chk_partida_elemento_codigo 
        CHECK (LENGTH(codigo) >= 2)
);

COMMENT ON TABLE partida_elemento IS 
    'Catálogo de elementos/sub-items por partida presupuestaria. '
    'Basado en el Clasificador Presupuestario de Recursos y Egresos Nacional.';

COMMENT ON COLUMN partida_elemento.codigo IS 
    'Código del elemento (GEN.ESP) ej: 03.02 = Textiles > Prendas de Vestir';

CREATE INDEX idx_partida_elemento_partida ON partida_elemento(partida_presupuestaria_id);
CREATE INDEX idx_partida_elemento_codigo ON partida_elemento(codigo);
CREATE INDEX idx_partida_elemento_activo ON partida_elemento(activo);

-- ============================================================================
-- 2. TABLA: item_presupuestario (Items específicos de la base de cálculo)
-- ============================================================================
-- Items detallados con todos los campos del formato oficial F-PMFFAC-002
-- Soporta híbrido: codificación 2021 (402.03.02.00) y 2027 (EQ-01)

CREATE TABLE IF NOT EXISTS item_presupuestario (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partida_presupuestaria_id   UUID NOT NULL,
    elemento_id                 UUID,                           -- FK a partida_elemento (opcional)
    
    -- Codificación híbrida (formato 2021 + 2027)
    codigo                      VARCHAR(100) NOT NULL,          -- '402.03.02.00' o 'EQ-01'
    codigo_snc                  VARCHAR(50),                    -- Código SNC (Servicio Nacional de Contrataciones)
    codigo_sap                  VARCHAR(50),                    -- Código SAP (si aplica)
    
    -- Descripción del item
    nombre                      VARCHAR(500) NOT NULL,          -- 'GUANTES DIELÉCTRICOS'
    descripcion                 TEXT,                           -- Descripción ampliada
    especificacion_tecnica      TEXT,                           -- Solo para 404 (Activos)
    
    -- Cantidad y unidades
    cantidad                    DECIMAL(18,2) NOT NULL DEFAULT 0,
    unidad_medida               VARCHAR(100),                   -- 'PARES', 'CAJA', 'UNIDAD', 'Servicio anual'
    
    -- Costos
    costo_unitario              DECIMAL(18,2) NOT NULL DEFAULT 0,
    costo_total                 DECIMAL(18,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
    
    -- Tipo de item (determina campos adicionales)
    tipo_item                   VARCHAR(30) NOT NULL,           -- 'MATERIAL', 'SERVICIO', 'ACTIVO', 'VIATICO', 'RECURSO_HUMANO'
    
    -- Campos específicos para Partida 402 (Materiales)
    tipo_reemplazo              VARCHAR(20),                    -- 'REEMPLAZO', 'DEFICIENCIA', 'NUEVO'
    categoria_codigo            VARCHAR(20),                    -- '03' (Genérica)
    subcategoria_codigo         VARCHAR(20),                    -- '02' (Específica)
    
    -- Campos específicos para Partida 403 (Servicios)
    tipo_servicio               VARCHAR(100),                   -- 'Alquiler', 'Mantenimiento', 'Licencia', etc.
    periodo_facturacion         VARCHAR(50),                    -- 'Mensual', 'Anual', 'Único'
    proveedor                   VARCHAR(255),
    
    -- Campos específicos para Partida 404 (Activos)
    marca                       VARCHAR(100),
    modelo                      VARCHAR(100),
    vida_util_meses             INT,
    estado_activo               VARCHAR(20),                    -- 'NUEVO', 'USADO', 'REMANUFACTURADO'
    
    -- Campos específicos para Partida 405 (Viáticos)
    numero_personas             INT,
    numero_dias                 INT,
    unidades_tributarias        DECIMAL(18,2),
    costo_por_ut                DECIMAL(18,2),
    destino                     VARCHAR(255),
    tipo_viatico                VARCHAR(20),                    -- 'NACIONAL', 'INTERNACIONAL'
    
    -- Justificación
    justificacion               TEXT NOT NULL,
    
    -- Control de ejecución
    estado                      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',  -- 'PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'
    fecha_ejecucion_estimada    DATE,
    fecha_ejecucion_real        DATE,
    
    -- Auditoría
    activo                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    version                     INT NOT NULL DEFAULT 1,
    
    -- Constraints
    CONSTRAINT fk_item_partida 
        FOREIGN KEY (partida_presupuestaria_id) 
        REFERENCES partida_presupuestaria(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_elemento 
        FOREIGN KEY (elemento_id) 
        REFERENCES partida_elemento(id) ON DELETE SET NULL,
    CONSTRAINT uq_item_codigo 
        UNIQUE (partida_presupuestaria_id, codigo),
    CONSTRAINT chk_item_cantidad 
        CHECK (cantidad >= 0),
    CONSTRAINT chk_item_costo_unitario 
        CHECK (costo_unitario >= 0),
    CONSTRAINT chk_item_tipo 
        CHECK (tipo_item IN ('MATERIAL', 'SERVICIO', 'ACTIVO', 'VIATICO', 'RECURSO_HUMANO')),
    CONSTRAINT chk_item_estado 
        CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')),
    CONSTRAINT chk_item_reemplazo 
        CHECK (tipo_reemplazo IS NULL OR tipo_reemplazo IN ('REEMPLAZO', 'DEFICIENCIA', 'NUEVO')),
    CONSTRAINT chk_item_tipo_viatico 
        CHECK (tipo_viatico IS NULL OR tipo_viatico IN ('NACIONAL', 'INTERNACIONAL')),
    CONSTRAINT chk_item_estado_activo 
        CHECK (estado_activo IS NULL OR estado_activo IN ('NUEVO', 'USADO', 'REMANUFACTURADO'))
);

COMMENT ON TABLE item_presupuestario IS 
    'Items específicos de la base de cálculo por partida presupuestaria. '
    'Formato híbrido: codificación 2021 (402.03.02.00) y 2027 (EQ-01). '
    'Incluye todos los campos del formato oficial F-PMFFAC-002.';

COMMENT ON COLUMN item_presupuestario.codigo IS 
    'Código híbrido: formato 2021 (PART.GEN.ESP.SUB-ESP) o formato 2027 (EQ-01)';

COMMENT ON COLUMN item_presupuestario.codigo_snc IS 
    'Código del Servicio Nacional de Contrataciones (formato 2021)';

COMMENT ON COLUMN item_presupuestario.tipo_item IS 
    'Tipo de item: MATERIAL (402), SERVICIO (403), ACTIVO (404), VIATICO (405), RECURSO_HUMANO (402)';

CREATE INDEX idx_item_partida ON item_presupuestario(partida_presupuestaria_id);
CREATE INDEX idx_item_elemento ON item_presupuestario(elemento_id);
CREATE INDEX idx_item_codigo ON item_presupuestario(codigo);
CREATE INDEX idx_item_tipo ON item_presupuestario(tipo_item);
CREATE INDEX idx_item_estado ON item_presupuestario(estado);
CREATE INDEX idx_item_activo ON item_presupuestario(activo);
CREATE INDEX idx_item_codigo_snc ON item_presupuestario(codigo_snc);
CREATE INDEX idx_item_codigo_sap ON item_presupuestario(codigo_sap);

-- ============================================================================
-- 3. TABLA: ejecucion_item (Histórico de ejecución vinculado a comprobantes)
-- ============================================================================
-- Registro de cada adquisición/ejecución de un item, vinculada a comprobante

CREATE TABLE IF NOT EXISTS ejecucion_item (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_presupuestario_id      UUID NOT NULL,
    
    -- Datos de la ejecución
    fecha_ejecucion             DATE NOT NULL DEFAULT CURRENT_DATE,
    cantidad_ejecutada          DECIMAL(18,2) NOT NULL DEFAULT 0,
    costo_ejecutado             DECIMAL(18,2) NOT NULL DEFAULT 0,
    
    -- Vinculación con comprobante original
    comprobante_tipo            VARCHAR(50),                    -- 'FACTURA', 'NOTA_DEBITO', 'ORDEN_COMPRA', 'CONTRATO'
    comprobante_numero          VARCHAR(100),
    comprobante_fecha           DATE,
    comprobante_rif             VARCHAR(20),
    comprobante_proveedor       VARCHAR(255),
    comprobante_archivo_ruta    TEXT,
    comprobante_archivo_nombre  VARCHAR(255),
    comprobante_archivo_tipo    VARCHAR(50),
    comprobante_archivo_tamano  BIGINT,
    
    -- Datos de recepción
    recibido_por                VARCHAR(255),
    fecha_recepcion             DATE,
    conformidad                 BOOLEAN DEFAULT FALSE,
    
    -- Observaciones
    observaciones               TEXT,
    
    -- Auditoría
    activo                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    version                     INT NOT NULL DEFAULT 1,
    
    -- Constraints
    CONSTRAINT fk_ejecucion_item 
        FOREIGN KEY (item_presupuestario_id) 
        REFERENCES item_presupuestario(id) ON DELETE CASCADE,
    CONSTRAINT chk_ejecucion_cantidad 
        CHECK (cantidad_ejecutada >= 0),
    CONSTRAINT chk_ejecucion_costo 
        CHECK (costo_ejecutado >= 0),
    CONSTRAINT chk_ejecucion_conformidad 
        CHECK (conformidad IN (TRUE, FALSE))
);

COMMENT ON TABLE ejecucion_item IS 
    'Histórico de ejecución de cada item presupuestario. '
    'Cada registro representa una adquisición o ejecución vinculada a un comprobante original.';

COMMENT ON COLUMN ejecucion_item.comprobante_tipo IS 
    'Tipo de comprobante: FACTURA, NOTA_DEBITO, ORDEN_COMPRA, CONTRATO';

CREATE INDEX idx_ejecucion_item ON ejecucion_item(item_presupuestario_id);
CREATE INDEX idx_ejecucion_fecha ON ejecucion_item(fecha_ejecucion);
CREATE INDEX idx_ejecucion_comprobante ON ejecucion_item(comprobante_numero);
CREATE INDEX idx_ejecucion_proveedor ON ejecucion_item(comprobante_proveedor);
CREATE INDEX idx_ejecucion_activo ON ejecucion_item(activo);

-- ============================================================================
-- 4. FUNCIONES Y TRIGGERS DE SINCRONIZACIÓN
-- ============================================================================

-- Función: Actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_item()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.version IS NOT NULL THEN
        NEW.version = OLD.version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Sincronizar ejecución de item hacia item_presupuestario
CREATE OR REPLACE FUNCTION sincronizar_ejecucion_item()
RETURNS TRIGGER AS $$
DECLARE
    v_total_ejecutado DECIMAL(18,2);
    v_cantidad_ejecutada DECIMAL(18,2);
BEGIN
    -- Calcular totales de ejecución del item
    SELECT 
        COALESCE(SUM(costo_ejecutado), 0),
        COALESCE(SUM(cantidad_ejecutada), 0)
    INTO v_total_ejecutado, v_cantidad_ejecutada
    FROM ejecucion_item
    WHERE item_presupuestario_id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id)
      AND activo = TRUE;
    
    -- Actualizar estado del item
    UPDATE item_presupuestario 
    SET 
        estado = CASE 
            WHEN v_cantidad_ejecutada >= cantidad THEN 'COMPLETADO'
            WHEN v_cantidad_ejecutada > 0 THEN 'EN_PROCESO'
            ELSE 'PENDIENTE'
        END,
        fecha_ejecucion_real = CASE 
            WHEN v_cantidad_ejecutada >= cantidad THEN CURRENT_DATE
            ELSE fecha_ejecucion_real
        END,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id);
    
    -- Actualizar monto_ejecutado en partida_presupuestaria
    UPDATE partida_presupuestaria 
    SET monto_ejecutado = (
        SELECT COALESCE(SUM(costo_ejecutado), 0)
        FROM ejecucion_item ei
        JOIN item_presupuestario ip ON ei.item_presupuestario_id = ip.id
        WHERE ip.partida_presupuestaria_id = (
            SELECT partida_presupuestaria_id 
            FROM item_presupuestario 
            WHERE id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id)
        )
        AND ei.activo = TRUE AND ip.activo = TRUE
    ),
    updated_at = NOW()
    WHERE id = (
        SELECT partida_presupuestaria_id 
        FROM item_presupuestario 
        WHERE id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función: Sincronizar monto de items hacia partida_mensual
CREATE OR REPLACE FUNCTION sincronizar_items_partida_mensual()
RETURNS TRIGGER AS $$
DECLARE
    v_partida_id UUID;
    v_monto_total DECIMAL(18,2);
    v_monto_ejecutado DECIMAL(18,2);
BEGIN
    -- Obtener partida_id
    SELECT partida_presupuestaria_id INTO v_partida_id
    FROM item_presupuestario
    WHERE id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id);
    
    IF v_partida_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calcular totales de items de la partida
    SELECT 
        COALESCE(SUM(costo_total), 0),
        COALESCE(SUM(CASE WHEN estado = 'COMPLETADO' THEN costo_total ELSE 0 END), 0)
    INTO v_monto_total, v_monto_ejecutado
    FROM item_presupuestario
    WHERE partida_presupuestaria_id = v_partida_id
      AND activo = TRUE;
    
    -- Actualizar partida_presupuestaria (solo si no tiene hijos directos como recurso_humano)
    UPDATE partida_presupuestaria 
    SET monto_presupuestado = v_monto_total,
        updated_at = NOW()
    WHERE id = v_partida_id
      AND monto_presupuestado = 0;  -- Solo actualizar si no tiene monto definido
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función: Sincronizar ejecutado hacia partida_mensual
CREATE OR REPLACE FUNCTION sincronizar_ejecutado_partida_mensual()
RETURNS TRIGGER AS $$
DECLARE
    v_partida_id UUID;
    v_monto_ejecutado DECIMAL(18,2);
BEGIN
    -- Obtener partida_id
    SELECT partida_presupuestaria_id INTO v_partida_id
    FROM item_presupuestario
    WHERE id = COALESCE(NEW.item_presupuestario_id, OLD.item_presupuestario_id);
    
    IF v_partida_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calcular total ejecutado de items
    SELECT COALESCE(SUM(costo_ejecutado), 0) INTO v_monto_ejecutado
    FROM ejecucion_item ei
    JOIN item_presupuestario ip ON ei.item_presupuestario_id = ip.id
    WHERE ip.partida_presupuestaria_id = v_partida_id
      AND ei.activo = TRUE AND ip.activo = TRUE;
    
    -- Actualizar monto_ejecutado en partida_presupuestaria
    UPDATE partida_presupuestaria 
    SET monto_ejecutado = v_monto_ejecutado,
        updated_at = NOW()
    WHERE id = v_partida_id;
    
    -- Actualizar monto_ejecutado en partida_mensual (distribuir proporcionalmente)
    UPDATE partida_mensual 
    SET monto_ejecutado = CASE 
        WHEN monto_asignado > 0 THEN 
            LEAST(v_monto_ejecutado * (monto_asignado / (
                SELECT COALESCE(SUM(monto_asignado), 1) 
                FROM partida_mensual 
                WHERE partida_presupuestaria_id = v_partida_id AND activo = TRUE
            )), monto_asignado)
        ELSE 0
    END,
    updated_at = NOW()
    WHERE partida_presupuestaria_id = v_partida_id
      AND activo = TRUE;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Actualizar timestamps en item_presupuestario
CREATE TRIGGER trigger_item_presupuestario_updated_at
    BEFORE UPDATE ON item_presupuestario
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_item();

-- Trigger: Actualizar timestamps en ejecucion_item
CREATE TRIGGER trigger_ejecucion_item_updated_at
    BEFORE UPDATE ON ejecucion_item
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_item();

-- Trigger: Sincronizar ejecución al insertar/actualizar/eliminar ejecucion_item
CREATE TRIGGER trigger_sincronizar_ejecucion_item
    AFTER INSERT OR UPDATE OR DELETE ON ejecucion_item
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_ejecucion_item();

-- Trigger: Sincronizar ejecutado hacia partida_mensual
CREATE TRIGGER trigger_sincronizar_ejecutado_partida
    AFTER INSERT OR UPDATE OR DELETE ON ejecucion_item
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_ejecutado_partida_mensual();

-- ============================================================================
-- 5. VISTAS DE CONTROL
-- ============================================================================

-- Vista 1: Resumen por partida presupuestaria
CREATE OR REPLACE VIEW v_resumen_partida AS
SELECT 
    pp.id AS partida_id,
    pp.codigo AS partida_codigo,
    pp.nombre AS partida_nombre,
    COUNT(DISTINCT ip.id) AS total_items,
    COUNT(DISTINCT CASE WHEN ip.estado = 'COMPLETADO' THEN ip.id END) AS items_completados,
    COUNT(DISTINCT CASE WHEN ip.estado = 'EN_PROCESO' THEN ip.id END) AS items_en_proceso,
    COUNT(DISTINCT CASE WHEN ip.estado = 'PENDIENTE' THEN ip.id END) AS items_pendientes,
    COALESCE(SUM(ip.costo_total), 0) AS costo_total_planificado,
    COALESCE(SUM(CASE WHEN ip.estado = 'COMPLETADO' THEN ip.costo_total ELSE 0 END), 0) AS costo_total_ejecutado,
    COALESCE(SUM(CASE WHEN ip.estado != 'COMPLETADO' THEN ip.costo_total ELSE 0 END), 0) AS costo_total_pendiente,
    CASE 
        WHEN SUM(ip.costo_total) > 0 THEN 
            ROUND((SUM(CASE WHEN ip.estado = 'COMPLETADO' THEN ip.costo_total ELSE 0 END) / SUM(ip.costo_total)) * 100, 2)
        ELSE 0 
    END AS porcentaje_avance,
    pp.monto_presupuestado,
    pp.monto_ejecutado
FROM partida_presupuestaria pp
LEFT JOIN item_presupuestario ip ON pp.id = ip.partida_presupuestaria_id AND ip.activo = TRUE
WHERE pp.activo = TRUE
GROUP BY pp.id, pp.codigo, pp.nombre, pp.monto_presupuestado, pp.monto_ejecutado;

COMMENT ON VIEW v_resumen_partida IS 'Resumen de avance por partida presupuestaria';

-- Vista 2: Detalle de items con ejecución
CREATE OR REPLACE VIEW v_detalle_items AS
SELECT 
    ip.id AS item_id,
    ip.codigo AS item_codigo,
    ip.codigo_snc,
    ip.codigo_sap,
    ip.nombre AS item_nombre,
    ip.especificacion_tecnica,
    ip.cantidad,
    ip.unidad_medida,
    ip.costo_unitario,
    ip.costo_total,
    ip.tipo_item,
    ip.estado,
    ip.justificacion,
    -- Datos de la partida
    pp.codigo AS partida_codigo,
    pp.nombre AS partida_nombre,
    -- Datos de la acción
    ae.nombre AS accion_nombre,
    -- Datos del elemento
    pe.codigo AS elemento_codigo,
    pe.nombre AS elemento_nombre,
    -- Ejecución
    COALESCE(ej.total_ejecutado, 0) AS total_ejecutado,
    COALESCE(ej.cantidad_ejecutada, 0) AS cantidad_ejecutada,
    CASE 
        WHEN ip.cantidad > 0 THEN 
            ROUND((COALESCE(ej.cantidad_ejecutada, 0) / ip.cantidad) * 100, 2)
        ELSE 0 
    END AS porcentaje_avance
FROM item_presupuestario ip
JOIN partida_presupuestaria pp ON ip.partida_presupuestaria_id = pp.id
JOIN accion_especifica ae ON pp.accion_especifica_id = ae.id
LEFT JOIN partida_elemento pe ON ip.elemento_id = pe.id
LEFT JOIN (
    SELECT 
        item_presupuestario_id,
        SUM(costo_ejecutado) AS total_ejecutado,
        SUM(cantidad_ejecutada) AS cantidad_ejecutada
    FROM ejecucion_item
    WHERE activo = TRUE
    GROUP BY item_presupuestario_id
) ej ON ip.id = ej.item_presupuestario_id
WHERE ip.activo = TRUE AND pp.activo = TRUE;

COMMENT ON VIEW v_detalle_items IS 'Detalle completo de items con su ejecución';

-- Vista 3: Dashboard de control presupuestario
CREATE OR REPLACE VIEW v_dashboard_items AS
SELECT 
    pp.codigo AS partida,
    pp.nombre AS nombre_partida,
    COUNT(ip.id) AS total_items,
    SUM(ip.costo_total) AS presupuesto_total,
    SUM(CASE WHEN ip.estado = 'COMPLETADO' THEN ip.costo_total ELSE 0 END) AS ejecutado,
    SUM(CASE WHEN ip.estado = 'EN_PROCESO' THEN ip.costo_total ELSE 0 END) AS en_proceso,
    SUM(CASE WHEN ip.estado = 'PENDIENTE' THEN ip.costo_total ELSE 0 END) AS pendiente,
    SUM(CASE WHEN ip.estado = 'CANCELADO' THEN ip.costo_total ELSE 0 END) AS cancelado,
    CASE 
        WHEN SUM(ip.costo_total) > 0 THEN 
            ROUND((SUM(CASE WHEN ip.estado = 'COMPLETADO' THEN ip.costo_total ELSE 0 END) / SUM(ip.costo_total)) * 100, 1)
        ELSE 0 
    END AS avance_pct,
    -- Clasificación por tipo
    SUM(CASE WHEN ip.tipo_item = 'MATERIAL' THEN ip.costo_total ELSE 0 END) AS total_materiales,
    SUM(CASE WHEN ip.tipo_item = 'SERVICIO' THEN ip.costo_total ELSE 0 END) AS total_servicios,
    SUM(CASE WHEN ip.tipo_item = 'ACTIVO' THEN ip.costo_total ELSE 0 END) AS total_activos,
    SUM(CASE WHEN ip.tipo_item = 'VIATICO' THEN ip.costo_total ELSE 0 END) AS total_viaticos,
    SUM(CASE WHEN ip.tipo_item = 'RECURSO_HUMANO' THEN ip.costo_total ELSE 0 END) AS total_recurso_humano
FROM partida_presupuestaria pp
LEFT JOIN item_presupuestario ip ON pp.id = ip.partida_presupuestaria_id AND ip.activo = TRUE
WHERE pp.activo = TRUE
GROUP BY pp.codigo, pp.nombre
ORDER BY pp.codigo;

COMMENT ON VIEW v_dashboard_items IS 'Dashboard de control presupuestario por partida';

-- Vista 4: Items pendientes de ejecución
CREATE OR REPLACE VIEW v_items_pendientes AS
SELECT 
    ip.codigo AS item_codigo,
    ip.nombre AS item_nombre,
    ip.cantidad,
    ip.unidad_medida,
    ip.costo_total,
    ip.estado,
    ip.fecha_ejecucion_estimada,
    pp.codigo AS partida_codigo,
    ae.nombre AS accion_nombre,
    CASE 
        WHEN ip.fecha_ejecucion_estimada < CURRENT_DATE THEN 'ATRASADO'
        WHEN ip.fecha_ejecucion_estimada = CURRENT_DATE THEN 'HOY'
        WHEN ip.fecha_ejecucion_estimada <= CURRENT_DATE + INTERVAL '7 days' THEN 'PRÓXIMO'
        ELSE 'FUTURO'
    END AS prioridad_temporal,
    CURRENT_DATE - ip.fecha_ejecucion_estimada AS dias_retraso
FROM item_presupuestario ip
JOIN partida_presupuestaria pp ON ip.partida_presupuestaria_id = pp.id
JOIN accion_especifica ae ON pp.accion_especifica_id = ae.id
WHERE ip.estado IN ('PENDIENTE', 'EN_PROCESO')
  AND ip.activo = TRUE AND pp.activo = TRUE
ORDER BY ip.fecha_ejecucion_estimada ASC;

COMMENT ON VIEW v_items_pendientes IS 'Items pendientes de ejecución con prioridad temporal';

-- Vista 5: Historial de ejecución por item
CREATE OR REPLACE VIEW v_historial_ejecucion AS
SELECT 
    ip.codigo AS item_codigo,
    ip.nombre AS item_nombre,
    ei.fecha_ejecucion,
    ei.cantidad_ejecutada,
    ei.costo_ejecutado,
    ei.comprobante_tipo,
    ei.comprobante_numero,
    ei.comprobante_proveedor,
    ei.recibido_por,
    ei.fecha_recepcion,
    ei.conformidad,
    ei.observaciones,
    pp.codigo AS partida_codigo
FROM ejecucion_item ei
JOIN item_presupuestario ip ON ei.item_presupuestario_id = ip.id
JOIN partida_presupuestaria pp ON ip.partida_presupuestaria_id = pp.id
WHERE ei.activo = TRUE AND ip.activo = TRUE
ORDER BY ei.fecha_ejecucion DESC;

COMMENT ON VIEW v_historial_ejecucion IS 'Historial completo de ejecución de items';

-- Vista 6: Conciliación presupuestaria por item
CREATE OR REPLACE VIEW v_conciliacion_items AS
SELECT 
    pp.codigo AS partida,
    pp.nombre AS nombre_partida,
    ip.codigo AS item,
    ip.nombre AS nombre_item,
    ip.costo_total AS presupuestado,
    COALESCE(ej.ejecutado, 0) AS ejecutado,
    ip.costo_total - COALESCE(ej.ejecutado, 0) AS saldo,
    CASE 
        WHEN ip.costo_total > 0 THEN 
            ROUND((COALESCE(ej.ejecutado, 0) / ip.costo_total) * 100, 2)
        ELSE 0 
    END AS porcentaje_ejecutado,
    CASE 
        WHEN COALESCE(ej.ejecutado, 0) > ip.costo_total THEN 'SOBREGASTO'
        WHEN COALESCE(ej.ejecutado, 0) = ip.costo_total THEN 'EXACTO'
        WHEN COALESCE(ej.ejecutado, 0) > 0 THEN 'PARCIAL'
        ELSE 'SIN EJECUTAR'
    END AS estado_conciliacion
FROM item_presupuestario ip
JOIN partida_presupuestaria pp ON ip.partida_presupuestaria_id = pp.id
LEFT JOIN (
    SELECT 
        item_presupuestario_id,
        SUM(costo_ejecutado) AS ejecutado
    FROM ejecucion_item
    WHERE activo = TRUE
    GROUP BY item_presupuestario_id
) ej ON ip.id = ej.item_presupuestario_id
WHERE ip.activo = TRUE AND pp.activo = TRUE
ORDER BY pp.codigo, ip.codigo;

COMMENT ON VIEW v_conciliacion_items IS 'Conciliación presupuestaria por item (presupuestado vs ejecutado)';

-- ============================================================================
-- FIN FASE 29
-- ============================================================================

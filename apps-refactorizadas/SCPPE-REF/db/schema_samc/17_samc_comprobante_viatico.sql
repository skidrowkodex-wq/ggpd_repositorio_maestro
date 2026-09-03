-- ============================================================================
-- SCRIPT DE MIGRACIÓN: 17_samc_comprobante_viatico.sql
-- COMPROBANTES FISCALES SENIAT DE VIÁTICOS (CONEXIÓN FRONTEND ↔ INSForge)
-- Fecha: Septiembre 2026
-- Esquema: scppe (modelo activo desplegado en InsForge, tablas mae_*)
-- Norma: ISO 8000 (Calidad de Datos) / ISO 27001 (Seguridad & Auditoría)
-- Adapta la estructura canónica SAMC (comprobante_viatico) + campos fiscales SENIAT
-- que la UI de ViáticosControlView ya consume (ref. src/types.ts ComprobanteFiscalViatico).
-- ============================================================================

CREATE TABLE IF NOT EXISTS scppe.mae_comprobantes_viatico (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,

    -- Referencia a la asignación de viático (FK lógica al id de mae_viaticos_control)
    asignacion_id VARCHAR(64) NOT NULL,

    -- Datos fiscales SENIAT
    rif_proveedor VARCHAR(20) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    numero_factura VARCHAR(100),
    numero_control VARCHAR(100),
    fecha_emision DATE NOT NULL,
    concepto VARCHAR(30) NOT NULL
        CHECK (concepto IN ('HOSPEDAJE', 'ALIMENTACION', 'TRANSPORTE', 'COMBUSTIBLE', 'PEAJE', 'OTRO')),

    -- Montos multimoneda
    monto_bs NUMERIC(15,2) NOT NULL,
    monto_usd NUMERIC(15,2),

    CONSTRAINT check_monto_bs CHECK (monto_bs > 0),

    -- Validación fiscal
    valido_seniat BOOLEAN DEFAULT FALSE,

    -- Campos ISO 8000 / 27001
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'sistema',
    updated_by VARCHAR(100) DEFAULT 'sistema',
    version INTEGER DEFAULT 1
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comprobante_asignacion ON scppe.mae_comprobantes_viatico(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_comprobante_fecha ON scppe.mae_comprobantes_viatico(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_comprobante_concepto ON scppe.mae_comprobantes_viatico(concepto);
CREATE INDEX IF NOT EXISTS idx_comprobante_rif ON scppe.mae_comprobantes_viatico(rif_proveedor);

-- Trigger para actualización de timestamps + version
CREATE OR REPLACE FUNCTION scppe.fn_update_comprobante_viatico_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_comprobante_viatico ON scppe.mae_comprobantes_viatico;
CREATE TRIGGER trg_update_comprobante_viatico
    BEFORE UPDATE ON scppe.mae_comprobantes_viatico
    FOR EACH ROW
    EXECUTE FUNCTION scppe.fn_update_comprobante_viatico_timestamp();

-- Grants (roles reales disponibles en InsForge; consistente con tablas mae_* existentes)
GRANT SELECT, INSERT, UPDATE, DELETE ON scppe.mae_comprobantes_viatico TO anon, authenticated;

-- ============================================================================
-- VISTA PÚBLICA PARA LA API REST DE INSFORGE
-- La API REST de InsForge resuelve objetos en el esquema `public` por nombre simple,
-- por lo que se expone una vista pública que proyecta la tabla del esquema scppe.
-- (Patrón idéntico a v_scppe_viaticos_control → scppe.mae_viaticos_control).
-- ============================================================================
CREATE OR REPLACE VIEW public.v_scppe_comprobantes_viatico AS
SELECT
    c.id,
    c.asignacion_id,
    c.rif_proveedor,
    c.razon_social,
    c.numero_factura,
    c.numero_control,
    c.fecha_emision,
    c.concepto,
    c.monto_bs,
    c.monto_usd,
    c.valido_seniat,
    c.activo,
    c.created_at,
    c.updated_at,
    c.created_by,
    c.updated_by,
    c.version
FROM scppe.mae_comprobantes_viatico c;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.v_scppe_comprobantes_viatico TO anon, authenticated;

-- ============================================================================
-- TRIGGERS INSTEAD OF PARA ESCRITURA (API REST) SOBRE VISTAS PÚBLICAS
-- v_scppe_viaticos_control hace JOIN a mae_proyectos_especiales → NO es una vista
-- automáticamente actualizable. La API REST solo accede a objetos `public`, así que
-- se agregan triggers INSTEAD OF para habilitar INSERT/DELETE contra la tabla real.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ins_v_scppe_viaticos_control()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO scppe.mae_viaticos_control (
        id, numero_solicitud, empleado_nombre, empleado_cedula, destino,
        fecha_inicio, fecha_fin, dias_duracion, monto_calculado_usd, monto_calculado_bs,
        estatus_flujo, motivo_comision, proyecto_asociado_id, created_at, updated_at
    ) VALUES (
        NEW.id, NEW.numero_solicitud, NEW.empleado_nombre, NEW.empleado_cedula, NEW.destino,
        NEW.fecha_inicio, NEW.fecha_fin, NEW.dias_duracion, NEW.monto_calculado_usd, NEW.monto_calculado_bs,
        NEW.estatus_flujo, NEW.motivo_comision, NEW.proyecto_asociado_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ins_v_scppe_viaticos ON public.v_scppe_viaticos_control;
CREATE TRIGGER trigger_ins_v_scppe_viaticos
    INSTEAD OF INSERT ON public.v_scppe_viaticos_control
    FOR EACH ROW
    EXECUTE FUNCTION public.ins_v_scppe_viaticos_control();

CREATE OR REPLACE FUNCTION public.del_v_scppe_viaticos_control()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM scppe.mae_viaticos_control WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_del_v_scppe_viaticos ON public.v_scppe_viaticos_control;
CREATE TRIGGER trigger_del_v_scppe_viaticos
    INSTEAD OF DELETE ON public.v_scppe_viaticos_control
    FOR EACH ROW
    EXECUTE FUNCTION public.del_v_scppe_viaticos_control();
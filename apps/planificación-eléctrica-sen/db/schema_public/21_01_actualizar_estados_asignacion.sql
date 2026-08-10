-- =====================================================
-- FASE 21: ACTUALIZAR ESTADOS EN ASIGNACIÓN DE VIÁTICOS
-- Agregar estados para escenarios de cierre
-- Fecha: 2026-03-08
-- =====================================================

-- Eliminar constraint anterior si existe
ALTER TABLE asignacion_viatico DROP CONSTRAINT IF EXISTS asignacion_viatico_estado_check;

-- Agregar nuevo constraint con todos los estados
ALTER TABLE asignacion_viatico ADD CONSTRAINT asignacion_viatico_estado_check 
    CHECK (estado IN (
        'PENDIENTE',      -- Solicitud creada, pendiente de aprobación
        'APROBADO',       -- Aprobado por gerente
        'EN_VIAJE',       -- Trabajador en viaje
        'COMPLETADO',     -- Rendición normal completada
        'REINTEGRADO',    -- Con reintegro de sobrante
        'REEMBOLSADO',    -- Con reembolso de sobregasto
        'EXCEPCIONAL',    -- Sin rendición (asignación excepcional)
        'RECHAZADO',      -- Solicitud rechazada
        'ANULADO'         -- Asignación anulada
    ));

-- =====================================================
-- VERIFICACIÓN DE ESTADOS
-- =====================================================
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'asignacion_viatico'::regclass
AND contype = 'c';

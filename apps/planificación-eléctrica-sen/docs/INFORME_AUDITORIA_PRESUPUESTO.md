# INFORME DE AUDITORÍA - SISTEMA PRESUPUESTARIO DE VIÁTICOS
## Fecha: 2026-03-08
## Auditor Especialista en Presupuesto

---

## 1. RESUMEN EJECUTIVO

Se realizó una auditoría integral del sistema presupuestario de viáticos de la base de datos `planificacion_electrica`. Se identificaron **5 hallazgos críticos** que afectan la rendición de cuentas y el control presupuestario.

**Nivel de Riesgo: ALTO**

---

## 2. HALLAZGOS DE AUDITORÍA

### HALLAZGO #1: EXCESO PRESUPUESTARIO EN ASIGNACIONES (CRÍTICO)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HALLAZGO #1: EXCESO PRESUPUESTARIO                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PROBLEMA:                                                                          │
│  • Presupuesto total de viáticos: Bs. 1,200,000                                   │
│  • Total asignado: Bs. 1,550,000                                                   │
│  • EXCESO: Bs. 350,000 (29.17%)                                                   │
│                                                                                     │
│  EVIDENCIA:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Trabajador                    │ Asignado  │ Estado      │ Exceso         │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │  Juan Carlos Pérez González    │ Bs.500,000│ EXCEPCIONAL │ -Bs.700,000   │   │
│  │  Carlos Alberto Mendoza García │ Bs.300,000│ REEMBOLSADO │ -Bs.900,000   │   │
│  │  Juan Carlos Pérez González    │ Bs.300,000│ APROBADO    │ -Bs.900,000   │   │
│  │  María Elena Rodríguez López   │ Bs.250,000│ REINTEGRADO │ -Bs.950,000   │   │
│  │  Ana Patricia Fernández Ruiz   │ Bs.200,000│ COMPLETADO  │ -Bs.1,000,000 │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │  TOTAL                        │Bs.1,550,000│            │ EXCESO: Bs.350,000│ │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  IMPACTO:                                                                          │
│  • No hay control de presupuesto al momento de la asignación                      │
│  • Se pueden crear asignaciones que excedan el presupuesto disponible             │
│  • Riesgo de gasto no autorizado y sobregasto presupuestario                      │
│                                                                                     │
│  CAUSA RAÍZ:                                                                       │
│  • No existe trigger de validación presupuestaria                                  │
│  • No hay constraint que verifique el saldo disponible antes de asignar           │
│  • No hay campo de saldo disponible en tabla viático                              │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### HALLAZGO #2: FALTA DE CONCILIACIÓN ENTRE MONTOS (ALTO)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HALLAZGO #2: FALTA DE CONCILIACIÓN                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PROBLEMA:                                                                          │
│  • No hay mecanismo de conciliación automática entre:                             │
│    - monto_presupuestado (partida_presupuestaria)                                 │
│    - costo_total (viatico)                                                        │
│    - monto_asignado (asignacion_viatico)                                          │
│    - monto_gastado (cierre_viatico)                                               │
│                                                                                     │
│  EVIDENCIA:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  CONCEPTO                    │ MONTO       │ DIFERENCIA   │ ESTADO        │   │
│  ├─────────────────────────────────────────────────────────────────────────────┤   │
│  │  Presupuesto Partida 405     │ Bs.2,800,000│ -            │ Aprobado      │   │
│  │  Viático (Relevamiento)      │ Bs.1,200,000│ Bs.1,600,000 │ Sin conciliar  │   │
│  │  Total Asignado              │ Bs.1,550,000│ -Bs.350,000  │ Excede viático│   │
│  │  Total Cerrado               │ Bs.1,250,000│ Bs.300,000   │ Sin conciliar  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  IMPACTO:                                                                          │
│  • No se puede determinar el saldo real disponible                                │
│  • No hay trazabilidad completa del flujo presupuestario                           │
│  • Dificulta la rendición de cuentas ante auditorías externas                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### HALLAZGO #3: FALTA DE CONTROL DE COMPROBANTES VS MONTOS (ALTO)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HALLAZGO #3: FALTA DE VALIDACIÓN COMPROBANTES                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PROBLEMA:                                                                          │
│  • No hay validación de que la suma de comprobantes                                │
│    sea igual al monto_gastado en cierre_viatico                                   │
│  • No hay validación de que comprobantes estén VALIDADOS                           │
│    antes de cerrar la asignación                                                   │
│                                                                                     │
│  EVIDENCIA:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  ASIGNACIÓN: María Elena Rodríguez López                                  │   │
│  │  Monto asignado: Bs. 250,000                                              │   │
│  │  Monto gastado (cierre): Bs. 200,000                                      │   │
│  │  Comprobantes registrados: 0 (en tabla comprobante_viatico)               │   │
│  │  Estado cierre: REINTEGRADO                                               │   │
│  │                                                                             │   │
│  │  ❌ No hay comprobantes que respalden el gasto de Bs. 200,000             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  IMPACTO:                                                                          │
│  • Se pueden cerrar asignaciones sin comprobantes válidos                         │
│  • No hay control de integridad entre comprobantes y cierre                       │
│  • Riesgo de rendición de cuentas incompleta                                      │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### HALLAZGO #4: FALTA DE CONTROL TEMPORAL (MEDIO)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HALLAZGO #4: FALTA DE VALIDACIÓN TEMPORAL                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PROBLEMA:                                                                          │
│  • No hay validación de que fecha_retorno > fecha_salida                          │
│  • No hay validación de que fecha_cierre > fecha_retorno                          │
│  • No hay control de plazos para rendición de cuentas                             │
│                                                                                     │
│  EVIDENCIA:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  ASIGNACIÓN: Juan Carlos Pérez González (EXCEPCIONAL)                     │   │
│  │  Fecha salida: 2027-06-01                                                 │   │
│  │  Fecha retorno: 2027-06-30                                                │   │
│  │  Fecha cierre: No registrada                                              │   │
│  │  Próxima revisión: 2027-07-01                                             │   │
│  │                                                                             │   │
│  │  ⚠️ No hay control de plazo para rendición de cuentas                    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  IMPACTO:                                                                          │
│  • No se pueden generar alertas por vencimiento de plazos                         │
│  • No hay control de oportunidad en la rendición de cuentas                       │
│  • Dificulta el seguimiento de asignaciones pendientes                            │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### HALLAZGO #5: FALTA DE TRAZABILIDAD DE ORIGEN DE FONDOS (MEDIO)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HALLAZGO #5: FALTA DE CONTROL DE ORIGEN DE FONDOS                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  PROBLEMA:                                                                          │
│  • Campo origen_fondos es nullable y no tiene catálogo de valores                │
│  • No hay validación del origen de fondos para reembolsos y excepcionales        │
│  • No hay trazabilidad del flujo de fondos                                        │
│                                                                                     │
│  EVIDENCIA:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  CIERRE: REINTEGRADO (María Elena Rodríguez López)                       │   │
│  │  Origen fondos: NULL                                                      │   │
│  │                                                                             │   │
│  │  CIERRE: REEMBOLSADO (Carlos Alberto Mendoza García)                     │   │
│  │  Origen fondos: PRESUPUESTO GERENCIA                                      │   │
│  │                                                                             │   │
│  │  CIERRE: EXCEPCIONAL (Juan Carlos Pérez González)                        │   │
│  │  Origen fondos: FONDOS RESERVA                                            │   │
│  │                                                                             │   │
│  │  ⚠️ No hay catálogo de orígenes de fondos válidos                       │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  IMPACTO:                                                                          │
│  • No hay consistencia en el registro de orígenes de fondos                       │
│  • Dificulta la conciliación contable                                              │
│  • No se puede auditar el flujo de fondos de manera efectiva                      │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PLAN CORPORATIVO DE CORRECCIÓN

### FASE 1: CORRECCIONES INMEDIATAS (1-2 semanas)

#### 1.1 Crear catálogo de orígenes de fondos

```sql
-- Tabla de catálogo de orígenes de fondos
CREATE TABLE IF NOT EXISTS catalogo_origen_fondos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    version INTEGER DEFAULT 1
);

-- Datos iniciales
INSERT INTO catalogo_origen_fondos (codigo, nombre, descripcion) VALUES
('PRESUPUESTO_GERENCIA', 'Presupuesto de Gerencia', 'Fondos asignados al presupuesto de la gerencia'),
('PRESUPUESTO_CORPORATIVO', 'Presupuesto Corporativo', 'Fondos del presupuesto general de la empresa'),
('FONDOS_RESERVA', 'Fondos de Reserva', 'Fondos de reserva para emergencias'),
('FONDOS_ESPECIALES', 'Fondos Especiales', 'Fondos asignados para proyectos especiales'),
('OTROS', 'Otros', 'Otros orígenes de fondos');
```

#### 1.2 Agregar约束 de integridad presupuestaria

```sql
-- Constraint para validar que monto_asignado no exceda costo_total
ALTER TABLE asignacion_viatico ADD CONSTRAINT chk_monto_no_excede_presupuesto
    CHECK (monto_asignado <= (
        SELECT v.costo_total 
        FROM viatico v 
        WHERE v.id = viatico_id
    ));
```

#### 1.3 Agregar campos de conciliación

```sql
-- Campo de saldo disponible en viático
ALTER TABLE viatico ADD COLUMN saldo_disponible DECIMAL(15,2) 
    GENERATED ALWAYS AS (costo_total - (
        SELECT COALESCE(SUM(av.monto_asignado), 0)
        FROM asignacion_viatico av
        WHERE av.viatico_id = viatico.id
        AND av.activo = TRUE
        AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
    )) STORED;
```

### FASE 2: MECANISMOS DE CONTROL (2-4 semanas)

#### 2.1 Crear trigger de validación presupuestaria

```sql
-- Trigger para validar presupuesto antes de insertar asignación
CREATE OR REPLACE FUNCTION fn_validar_presupuesto_viatico()
RETURNS TRIGGER AS $$
DECLARE
    v_saldo_disponible DECIMAL(15,2);
    v_costo_total DECIMAL(15,2);
BEGIN
    -- Obtener costo total del viático
    SELECT costo_total INTO v_costo_total
    FROM viatico
    WHERE id = NEW.viatico_id;
    
    -- Calcular saldo disponible
    SELECT v_costo_total - COALESCE(SUM(monto_asignado), 0) INTO v_saldo_disponible
    FROM asignacion_viatico
    WHERE viatico_id = NEW.viatico_id
    AND activo = TRUE
    AND estado NOT IN ('ANULADO', 'RECHAZADO');
    
    -- Validar que no exceda el presupuesto
    IF NEW.monto_asignado > v_saldo_disponible THEN
        RAISE EXCEPTION 'El monto asignado (%%) excede el saldo disponible (%%)',
            NEW.monto_asignado, v_saldo_disponible;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_presupuesto_viatico
    BEFORE INSERT ON asignacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_presupuesto_viatico();
```

#### 2.2 Crear trigger de validación de comprobantes

```sql
-- Trigger para validar que comprobantes estén validados antes de cerrar
CREATE OR REPLACE FUNCTION fn_validar_comprobantes_cierre()
RETURNS TRIGGER AS $$
DECLARE
    v_total_comprobantes DECIMAL(15,2);
    v_comprobantes_pendientes INTEGER;
BEGIN
    -- Solo validar para cierres normales
    IF NEW.tipo_cierre = 'RENDICION_NORMAL' THEN
        -- Obtener total de comprobantes validados
        SELECT COALESCE(SUM(monto_comprobante), 0) INTO v_total_comprobantes
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = NEW.asignacion_viatico_id
        AND activo = TRUE
        AND estado = 'VALIDADO';
        
        -- Verificar que el monto gastado coincida con comprobantes
        IF NEW.monto_gastado != v_total_comprobantes THEN
            RAISE EXCEPTION 'El monto gastado (%%) no coincide con comprobantes validados (%%)',
                NEW.monto_gastado, v_total_comprobantes;
        END IF;
        
        -- Verificar que no haya comprobantes pendientes
        SELECT COUNT(*) INTO v_comprobantes_pendientes
        FROM comprobante_viatico
        WHERE asignacion_viatico_id = NEW.asignacion_viatico_id
        AND activo = TRUE
        AND estado = 'PENDIENTE';
        
        IF v_comprobantes_pendientes > 0 THEN
            RAISE EXCEPTION 'Existen %% comprobantes pendientes de validación',
                v_comprobantes_pendientes;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_comprobantes_cierre
    BEFORE INSERT OR UPDATE ON cierre_viatico
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_comprobantes_cierre();
```

#### 2.3 Crear trigger de validación temporal

```sql
-- Trigger para validar fechas
CREATE OR REPLACE FUNCTION fn_validar_fechas_viatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que fecha_retorno > fecha_salida
    IF NEW.fecha_retorno <= NEW.fecha_salida THEN
        RAISE EXCEPTION 'La fecha de retorno (%) debe ser posterior a la fecha de salida (%)',
            NEW.fecha_retorno, NEW.fecha_salida;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_fechas_viatico
    BEFORE INSERT OR UPDATE ON asignacion_viatico
    FOR EACH ROW
    EXECUTE FUNCTION fn_validar_fechas_viatico();
```

### FASE 3: VISTAS DE CONCILIACIÓN (3-4 semanas)

#### 3.1 Vista de conciliación presupuestaria

```sql
CREATE OR REPLACE VIEW v_conciliacion_presupuestaria AS
SELECT 
    pp.codigo AS partida_codigo,
    pp.nombre AS partida_nombre,
    pp.monto_presupuestado AS presupuesto_partida,
    v.concepto AS viatico_concepto,
    v.costo_total AS presupuesto_viatico,
    v.saldo_disponible,
    COALESCE(SUM(av.monto_asignado), 0) AS total_asignado,
    v.costo_total - COALESCE(SUM(av.monto_asignado), 0) AS saldo_parcial,
    CASE 
        WHEN v.costo_total > 0 
        THEN ROUND((COALESCE(SUM(av.monto_asignado), 0) / v.costo_total) * 100, 2)
        ELSE 0 
    END AS porcentaje_comprometido
FROM partida_presupuestaria pp
JOIN viatico v ON v.partida_presupuestaria_id = pp.id
LEFT JOIN asignacion_viatico av ON av.viatico_id = v.id
    AND av.activo = TRUE
    AND av.estado NOT IN ('ANULADO', 'RECHAZADO')
WHERE pp.activo = TRUE
AND v.activo = TRUE
GROUP BY pp.codigo, pp.nombre, pp.monto_presupuestado, v.concepto, v.costo_total, v.saldo_disponible;
```

#### 3.2 Vista de control de rendición de cuentas

```sql
CREATE OR REPLACE VIEW v_control_rendicion_cuentas AS
SELECT 
    av.id AS asignacion_id,
    r.cedula,
    r.nombres || ' ' || r.apellidos AS trabajador,
    av.destino,
    av.fecha_salida,
    av.fecha_retorno,
    av.dias_viaje,
    av.monto_asignado,
    av.estado AS estado_asignacion,
    cv.tipo_cierre,
    cv.fecha_cierre,
    cv.monto_gastado,
    cv.monto_reintegro,
    cv.monto_reembolso,
    -- Control temporal
    CASE 
        WHEN av.estado = 'EN_VIAJE' AND av.fecha_retorno < CURRENT_DATE 
        THEN 'VENCIDO - DEBE RENDICIÓN'
        WHEN av.estado = 'EN_VIAJE' 
        THEN 'EN CURSO'
        WHEN av.estado = 'COMPLETADO' 
        THEN 'RENDIDO'
        ELSE av.estado
    END AS control_temporal,
    -- Control de comprobantes
    (SELECT COUNT(*) FROM comprobante_viatico c 
     WHERE c.asignacion_viatico_id = av.id AND c.activo = TRUE) AS total_comprobantes,
    (SELECT COUNT(*) FROM comprobante_viatico c 
     WHERE c.asignacion_viatico_id = av.id AND c.activo = TRUE AND c.estado = 'VALIDADO') AS comprobantes_validados,
    (SELECT COUNT(*) FROM comprobante_viatico c 
     WHERE c.asignacion_viatico_id = av.id AND c.activo = TRUE AND c.estado = 'PENDIENTE') AS comprobantes_pendientes
FROM asignacion_viatico av
JOIN responsable r ON r.id = av.responsable_id
LEFT JOIN cierre_viatico cv ON cv.asignacion_viatico_id = av.id AND cv.activo = TRUE
WHERE av.activo = TRUE;
```

### FASE 4: PROCEDIMIENTOS ALMACENADOS (4-6 semanas)

#### 4.1 Procedimiento de cierre con validación

```sql
CREATE OR REPLACE FUNCTION sp_cerrar_asignacion_viatico(
    p_asignacion_id UUID,
    p_tipo_cierre VARCHAR(30),
    p_monto_gastado DECIMAL(15,2),
    p_aprobado_por_gerente VARCHAR(255),
    p_justificacion_gerente TEXT,
    p_motivo_cierre TEXT,
    p_comprobante_reintegro VARCHAR(100) DEFAULT NULL,
    p_comprobante_reembolso VARCHAR(100) DEFAULT NULL,
    p_origen_fondos VARCHAR(100) DEFAULT NULL,
    p_aprobado_por_director VARCHAR(255) DEFAULT NULL,
    p_justificacion_director TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_asignacion RECORD;
    v_cierre_id UUID;
    v_monto_reintegro DECIMAL(15,2) := 0;
    v_monto_reembolso DECIMAL(15,2) := 0;
BEGIN
    -- Obtener datos de la asignación
    SELECT * INTO v_asignacion
    FROM asignacion_viatico
    WHERE id = p_asignacion_id
    AND activo = TRUE;
    
    -- Validar que la asignación exista y esté en estado válido
    IF v_asignacion IS NULL THEN
        RAISE EXCEPTION 'Asignación no encontrada o inactiva';
    END IF;
    
    IF v_asignacion.estado NOT IN ('APROBADO', 'EN_VIAJE') THEN
        RAISE EXCEPTION 'La asignación no está en estado válido para cierre (%%)', v_asignacion.estado;
    END IF;
    
    -- Calcular montos según tipo de cierre
    CASE p_tipo_cierre
        WHEN 'RENDICION_NORMAL' THEN
            IF p_monto_gastado > v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'Para rendición normal, el monto gastado no puede exceder el asignado';
            END IF;
            v_monto_reintegro := v_asignacion.monto_asignado - p_monto_gastado;
            
        WHEN 'REINTEGRO' THEN
            IF p_monto_gastado >= v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'Para reintegro, el monto gastado debe ser menor al asignado';
            END IF;
            v_monto_reintegro := v_asignacion.monto_asignado - p_monto_gastado;
            
        WHEN 'REEMBOLSO' THEN
            IF p_monto_gastado <= v_asignacion.monto_asignado THEN
                RAISE EXCEPTION 'Para reembolso, el monto gastado debe ser mayor al asignado';
            END IF;
            v_monto_reembolso := p_monto_gastado - v_asignacion.monto_asignado;
            
        WHEN 'EXCEPCIONAL' THEN
            IF p_aprobado_por_director IS NULL THEN
                RAISE EXCEPTION 'Para cierre excepcional se requiere aprobación del director';
            END IF;
            
        ELSE
            RAISE EXCEPTION 'Tipo de cierre no válido: %%', p_tipo_cierre;
    END CASE;
    
    -- Insertar cierre
    INSERT INTO cierre_viatico (
        asignacion_viatico_id, tipo_cierre, monto_asignado, monto_gastado,
        monto_reintegro, monto_reembolso, fecha_cierre,
        aprobado_por_gerente, fecha_aprobacion_gerente, justificacion_gerente,
        aprobado_por_director, fecha_aprobacion_director, justificacion_director,
        origen_fondos, comprobante_reintegro, comprobante_reembolso,
        motivo_cierre, es_excepcional, requiere_revision_periodica
    ) VALUES (
        p_asignacion_id, p_tipo_cierre, v_asignacion.monto_asignado, p_monto_gastado,
        v_monto_reintegro, v_monto_reembolso, CURRENT_DATE,
        p_aprobado_por_gerente, CURRENT_TIMESTAMP, p_justificacion_gerente,
        p_aprobado_por_director, 
        CASE WHEN p_aprobado_por_director IS NOT NULL THEN CURRENT_TIMESTAMP END,
        p_justificacion_director,
        p_origen_fondos, p_comprobante_reintegro, p_comprobante_reembolso,
        p_motivo_cierre,
        CASE WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN TRUE ELSE FALSE END,
        CASE WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN TRUE ELSE FALSE END
    ) RETURNING id INTO v_cierre_id;
    
    -- Actualizar estado de la asignación
    UPDATE asignacion_viatico
    SET estado = CASE 
        WHEN p_tipo_cierre = 'REINTEGRADO' THEN 'REINTEGRADO'
        WHEN p_tipo_cierre = 'REEMBOLSADO' THEN 'REEMBOLSADO'
        WHEN p_tipo_cierre = 'EXCEPCIONAL' THEN 'EXCEPCIONAL'
        ELSE 'COMPLETADO'
    END,
    monto_ejecutado = p_monto_gastado
    WHERE id = p_asignacion_id;
    
    RETURN v_cierre_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. BENEFICIOS ESPERADOS

### Cumplimiento Normativo
- ✅ Control completo de presupuesto por viático
- ✅ Trazabilidad de origen de fondos
- ✅ Conciliación automática de montos
- ✅ Validación de comprobantes antes de cierre
- ✅ Control temporal de rendición de cuentas

### Eficiencia Operativa
- ✅ Automatización de validaciones presupuestarias
- ✅ Reducción de errores humanos
- ✅ Generación automática de reportes de conciliación
- ✅ Alertas automáticas por vencimiento de plazos

### Auditoría
- ✅ Trazabilidad completa del flujo presupuestario
- ✅ Control de integridad de datos
- ✅ Reportes de conciliación listos para auditoría externa
- ✅ Historial completo de aprobaciones

---

## 5. CRONOGRAMA DE IMPLEMENTACIÓN

| Fase | Descripción | Duración | Responsable |
|------|-------------|----------|-------------|
| 1 | Correcciones inmediatas | 1-2 semanas | Equipo BD |
| 2 | Mecanismos de control | 2-4 semanas | Equipo BD |
| 3 | Vistas de conciliación | 3-4 semanas | Equipo BD |
| 4 | Procedimientos almacenados | 4-6 semanas | Equipo BD |
| 5 | Pruebas y validación | 2-3 semanas | Equipo QA |
| 6 | Despliegue y documentación | 1-2 semanas | Equipo DevOps |

**Duración total estimada: 10-15 semanas**

---

## 6. RECOMENDACIONES FINALES

1. **Priorizar** la implementación del trigger de validación presupuestaria (Hallazgo #1)
2. **Crear** el catálogo de orígenes de fondos (Hallazgo #5)
3. **Implementar** la vista de conciliación presupuestaria (Hallazgo #2)
4. **Desarrollar** el procedimiento de cierre con validación (Hallazgo #3)
5. **Establecer** métricas de seguimiento y monitoreo continuo

**Firma del Auditor:**
*Auditor Especialista en Presupuesto*
*Fecha: 2026-03-08*

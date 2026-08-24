# INFORME DE AUDITORÍA - FLUJO DE PRESUPUESTO
## Fecha: 2026-03-09
## Alcance: Sistema de Control de Items por Partida Presupuestaria

---

## 1. RESUMEN EJECUTIVO

Se realizó una auditoría completa del flujo de presupuesto después de la implementación de la FASE 29 (Sistema de Control de Items por Partida). La auditoría verificó la integridad referencial, los triggers de sincronización, las vistas de control y la consistencia de datos para la rendición de cuentas.

### Estado General: ⚠️ CON OBSERVACIONES

Se identificaron **3 hallazgos críticos** y **2 hallazgos medios** que requieren atención antes de la rendición de cuentas.

---

## 2. ALCANCE DE LA AUDITORÍA

### 2.1 Entidades Auditadas
- **34 tablas** en esquema público
- **28 vistas** de control y reportes
- **12 triggers** de sincronización automática
- **4 funciones** de negocio

### 2.2 Flujos Verificados
1. POA → Acción Específica → Partida Presupuestaria
2. Partida Presupuestaria → Item Presupuestario
3. Item Presupuestario → Ejecución (comprobantes)
4. Sincronización automática de montos
5. Vistas de control y conciliación

---

## 3. HALLAZGOS DE AUDITORÍA

### 3.1 HALLAZGOS CRÍTICOS

#### HALLAZGO CRÍTICO #1: Inconsistencia de Montos entre Partida e Items
- **Ubicación**: `partida_presupuestaria.monto_presupuestado` vs `item_presupuestario.costo_total`
- **Descripción**: Los montos totales de las partidas no coinciden con la suma de sus items
- **Evidencia**:

| Partida | Monto Partida | Total Items | Diferencia | Estado |
|---------|---------------|-------------|------------|--------|
| 402 | 42,000,000 | 33,360,000 | +8,640,000 | SOBRANTE |
| 403 | 8,500,000 | 5,790,939,991 | -5,782,439,991 | EXCESO |
| 404 | 12,149,000 | 11,183,437 | +965,563 | SOBRANTE |
| 405 | 2,800,000 | 170,000 | +2,630,000 | SOBRANTE |

- **Causa Raíz**: 
  - Partida 403: El IVA (5,782,440,000) está incluido como item separado, pero el monto de la partida no lo considera
  - Partida 405: Los items tienen montos incorrectos (no coincide con la tabla `viatico`)
  - Partidas 402/404: Diferencias por redondeo y cálculos de formación
- **Impacto**: **CRÍTICO** - Imposible hacer conciliación presupuestaria para rendición de cuentas
- **Recomendación**: 
  1. Recalcular montos de items basados en montos reales de partidas
  2. Excluir IVA del detalle de items (calcularlo por separado)
  3. Sincronizar items de viáticos con tabla `viatico`

#### HALLAZGO CRÍTICO #2: Trigger de Sincronización No Actualiza Vista de Resumen
- **Ubicación**: Vista `v_resumen_partida`
- **Descripción**: La vista muestra `costo_total_ejecutado = 0` aunque hay ejecuciones registradas
- **Evidencia**:
  - Item 402-001 tiene 2 ejecuciones por 700,000
  - La vista muestra ejecutado = 0
- **Causa Raíz**: La vista usa `ip.estado = 'COMPLETADO'` para calcular ejecutado, pero los items nunca llegan a COMPLETADO porque la cantidad ejecutada (1-3) es menor que la cantidad total (9-12)
- **Impacto**: **CRÍTICO** - Los reportes de avance no reflejan la realidad
- **Recomendación**: 
  1. Modificar la vista para usar `SUM(ei.costo_ejecutado)` en lugar de `ip.estado`
  2. O crear vista alternativa que muestre ejecución parcial

#### HALLAZGO CRÍTICO #3: Falta de Sincronización con `partida_mensual`
- **Ubicación**: Tabla `partida_mensual` (vacía)
- **Descripción**: No existen registros en `partida_mensual` para las partidas activas
- **Evidencia**: `SELECT COUNT(*) FROM partida_mensual = 0`
- **Causa Raíz**: La inserción de datos de ejemplo no incluyó la programación mensual
- **Impacto**: **CRÍTICO** - Imposible hacer seguimiento mensual del presupuesto
- **Recomendación**: 
  1. Insertar registros en `partida_mensual` para todas las partidas
  2. Distribuir el presupuesto mensualmente según cronograma

### 3.2 HALLAZGOS MEDIOS

#### HALLAZGO MEDIO #1: Datos Inconsistentes en Items de Viáticos
- **Ubicación**: `item_presupuestario` vs `viatico`
- **Descripción**: Los montos de items de viáticos no coinciden con la tabla `viatico`
- **Evidencia**:

| Concepto | Monto Viático | Monto Item | Diferencia |
|----------|---------------|------------|------------|
| Relevamiento de data | 1,200,000 | 80,000 | -1,120,000 |
| Talleres capacitación | 1,000,000 | 50,000 | -950,000 |
| Acompañamiento | 600,000 | 40,000 | -560,000 |

- **Causa Raíz**: Error en cálculo al insertar datos de ejemplo
- **Impacto: MEDIO** - Inconsistencia en datos de viáticos
- **Recomendación**: Corregir montos en `item_presupuestario` para que coincidan con `viatico`

#### HALLAZGO MEDIO #2: Falta de Tabla de Conciliación Presupuestaria
- **Ubicación**: Estructura general
- **Descripción**: No existe una tabla dedicada para conciliación presupuestaria por período
- **Impacto: MEDIO** - Dificulta la rendición de cuentas por período
- **Recomendación**: Crear tabla `conciliacion_presupuestaria` con campos:
  - Período (trimestre/mes/año)
  - Partida
  - Monto presupuestado
  - Monto ejecutado
  - Saldo
  - Observaciones

---

## 4. VERIFICACIÓN DE FLUJO PARA RENDICIÓN DE CUENTAS

### 4.1 Flujo POA → Acción Específica ✅
- **Estado**: CORRECTO
- **Evidencia**: Jerarquía completa verificada (empresa → ente → gerencia → unidad → poa → acción → partida)
- **Registros**: 4 partidas vinculadas correctamente a 1 acción específica

### 4.2 Flujo Partida → Items ✅
- **Estado**: CORRECTO (con inconsistencias en montos)
- **Evidencia**: 34 items distribuidos en 4 partidas
- **Observación**: Los montos no están sincronizados (ver Hallazgo Crítico #1)

### 4.3 Flujo Items → Ejecución ✅
- **Estado**: CORRECTO
- **Evidencia**: 6 ejecuciones registradas con comprobantes vinculados
- **Trigger**: Funcionando correctamente (actualiza estado y montos)

### 4.4 Flujo de Sincronización Automática ⚠️
- **Estado**: PARCIAL
- **Evidencia**: 
  - Trigger `sincronizar_ejecucion_item`: ✅ Funciona
  - Trigger `sincronizar_ejecutado_partida`: ✅ Funciona
  - Vista `v_resumen_partida`: ❌ No muestra ejecutado correctamente

### 4.5 Vistas de Control para Rendición ⚠️
- **Estado**: PARCIAL
- **Vistas disponibles**:
  - `v_resumen_partida`: ❌ No muestra ejecutado
  - `v_detalle_items`: ✅ Muestra detalle correcto
  - `v_dashboard_items`: ⚠️ Parcial (usa estado incorrecto)
  - `v_items_pendientes`: ✅ Funcional
  - `v_historial_ejecucion`: ✅ Funcional
  - `v_conciliacion_items`: ❌ No muestra ejecutado

---

## 5. CAPACIDADES PARA RENDICIÓN DE CUENTAS

### 5.1 Rendición del POA (Anual)
- **Estado**: ❌ NO DISPONIBLE
- **Motivo**: 
  - Falta `partida_mensual` con programación mensual
  - Vistas no muestran ejecución acumulada
  - No hay conciliación presupuestaria

### 5.2 Rendición por Acción Específica
- **Estado**: ⚠️ PARCIAL
- **Disponible**:
  - ✅ Detalle de items por acción
  - ✅ Historial de ejecución
  - ❌ Montos ejecutados acumulados
  - ❌ Conciliación presupuestaria

### 5.3 Rendición de Metas Físicas Ejecutadas
- **Estado**: ❌ NO DISPONIBLE
- **Motivo**: 
  - Tabla `meta_fisica` vacía
  - No hay vinculación entre metas físicas y ejecución presupuestaria

### 5.4 Rendición por Período (Trimestral/Mensual)
- **Estado**: ❌ NO DISPONIBLE
- **Motivo**: 
  - No existe `partida_mensual`
  - No hay distribución temporal del presupuesto

---

## 6. RECOMENDACIONES PRIORITARIAS

### PRIORIDAD 1 (CRÍTICA - Antes de rendición)
1. **Corregir montos de items** para que coincidan con partidas
2. **Modificar vista `v_resumen_partida`** para usar ejecución real
3. **Insertar `partida_mensual`** con programación mensual
4. **Sincronizar items de viáticos** con tabla `viatico`

### PRIORIDAD 2 (MEDIA - Para funcionalidad completa)
5. **Crear tabla `conciliacion_presupuestaria`** para rendición por período
6. **Vincular `meta_fisica` con ejecución presupuestaria**
7. **Crear vista de rendición por trimestre**

### PRIORIDAD 3 (BAJA - Mejoras futuras)
8. **Implementar alertas automáticas** para items atrasados
9. **Crear reportes PDF** de rendición
10. **Integrar con SAP** (cuando esté disponible)

---

## 7. CONCLUSIÓN

El sistema de control de items por partida está **funcionalmente correcto** pero tiene **inconsistencias de datos** que impiden una rendición de cuentas confiable. Los triggers de sincronización funcionan, pero las vistas de reporte no están mostrando la información correcta.

**Antes de hacer una rendición de cuentas, es necesario**:
1. Corregir los montos inconsistentes
2. Modificar las vistas para usar ejecución real
3. Insertar la programación mensual del presupuesto

**Tiempo estimado de corrección**: 2-3 horas

---

## 8. ANEXOS

### 8.1 Scripts de Corrección Necesarios
- `30_01_corregir_montos_items.sql` - Recalcular montos
- `30_02_corregir_vistas.sql` - Modificar vistas
- `30_03_insertar_partida_mensual.sql` - Insertar programación mensual

### 8.2 Tablas y Vistas Auditadas
- 34 tablas en esquema público
- 28 vistas de control
- 12 triggers de sincronización
- 4 funciones de negocio

---

**Elaborado por**: Sistema de Auditoría Automatizada
**Fecha**: 2026-03-09
**Próxima revisión**: Después de aplicar correcciones

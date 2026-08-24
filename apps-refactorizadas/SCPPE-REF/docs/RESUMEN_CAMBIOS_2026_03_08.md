## RESUMEN DE CAMBIOS - SESIÓN 2026-03-08

### FASES COMPLETADAS (5 fases nuevas)

| Fase | Descripción | Script SQL |
|------|-------------|------------|
| **FASE 9** | Campos SIPES en tabla POA | 09_01_poa_campos_sipes.sql |
| **FASE 10** | Campo ejecutor en accion_especifica | 10_01_accion_especifica_ejecutor.sql |
| **FASE 11** | Campos detalle en partida_presupuestaria | 11_01_partida_presupuestaria_campos.sql |
| **FASE 12** | Tabla recurso_humano (Partida 402) | 12_01_recurso_humano.sql |
| **FASE 13** | Vistas SIPES para consulta | 13_01_vistas_sipes.sql |

### CAMPOS AGREGADOS

#### Tabla `poa` (7 campos nuevos)
- `es_plurianual` BOOLEAN - Indica si el proyecto es plurianual
- `situacion_presupuestaria` VARCHAR(50) - Estado presupuestario
- `responsable_tecnico_nombre` VARCHAR(255) - Nombre del responsable técnico
- `responsable_tecnico_email` VARCHAR(100) - Email del responsable técnico
- `responsable_admin_nombre` VARCHAR(255) - Nombre del responsable administrativo
- `responsable_admin_email` VARCHAR(100) - Email del responsable administrativo
- `localizacion` TEXT - Ubicación física del proyecto

#### Tabla `accion_especifica` (1 campo nuevo)
- `ejecutor` VARCHAR(255) - Unidad ejecutora de la acción

#### Tabla `partida_presupuestaria` (4 campos nuevos)
- `cantidad` DECIMAL(15,2) - Cantidad solicitada
- `unidad_medida` VARCHAR(100) - Unidad de medida
- `costo_unitario` DECIMAL(15,2) - Costo por unidad
- `justificacion` TEXT - Justificación del gasto

### NUEVAS TABLAS

#### Tabla `recurso_humano`
- Detalle de recursos humanos para Partida 402
- `rol_funcional` VARCHAR(255) - Nombre del rol
- `dedicacion_meses` INTEGER - Meses de dedicación (1-12)
- `costo_mensual` DECIMAL(15,2) - Costo mensual
- `costo_anual` DECIMAL(15,2) - **GENERATED ALWAYS AS** (costo_mensual × dedicacion_meses)
- FK a `partida_presupuestaria` con CASCADE

### NUEVAS VISTAS (4 vistas)

| Vista | Descripción |
|-------|-------------|
| `v_ficha_sipes` | Resumen del proyecto con datos generales y montos |
| `v_detalle_acciones_sipes` | Detalle de acciones con metas físicas |
| `v_detalle_partidas_sipes` | Detalle de partidas con recursos humanos |
| `v_resumen_recurso_humano` | Resumen de recursos humanos (Partida 402) |

### ANÁLISIS DE ARCHIVOS EXCEL

| Archivo | Campos | Cumplidos | Faltantes | % Cumplimiento |
|---------|--------|-----------|-----------|----------------|
| formulario_ficha_poa_proyecto.xlsx | 18 | 15 | 3 | 83% |
| formulario_ficha_sipes_proyecto.xlsx | 18 | 12 | 6 | 67% |
| for_opp_087_base_de_calculo_2027_proyecto.xlsx | 12 | 4 | 8 | 33% |
| **TOTAL** | **48** | **31** | **17** | **65%** |

### ESTADO ACTUAL DE LA BASE DE DATOS

- **Tablas**: 23 tablas
- **Vistas**: 9 vistas
- **Scripts SQL**: 10 scripts
- **Fases completadas**: 13

### CAMPOS FALTANTES IDENTIFICADOS

#### Para alcanzar 100% de cumplimiento:

**formulario_ficha_sipes_proyecto.xlsx (6 campos faltantes):**
1. `poa.responsable_tecnico_nombre` - ✅ IMPLEMENTADO
2. `poa.responsable_tecnico_email` - ✅ IMPLEMENTADO
3. `poa.responsable_admin_nombre` - ✅ IMPLEMENTADO
4. `poa.responsable_admin_email` - ✅ IMPLEMENTADO
5. `poa.localizacion` - ✅ IMPLEMENTADO
6. `accion_especifica.ejecutor` - ✅ IMPLEMENTADO

**for_opp_087_base_de_calculo_2027_proyecto.xlsx (8 campos faltantes):**
1. `partida_presupuestaria.cantidad` - ✅ IMPLEMENTADO
2. `partida_presupuestaria.unidad_medida` - ✅ IMPLEMENTADO
3. `partida_presupuestaria.costo_unitario` - ✅ IMPLEMENTADO
4. `partida_presupuestaria.justificacion` - ✅ IMPLEMENTADO
5. `recurso_humano.rol_funcional` - ✅ IMPLEMENTADO
6. `recurso_humano.dedicacion_meses` - ✅ IMPLEMENTADO
7. `recurso_humano.costo_mensual` - ✅ IMPLEMENTADO
8. `recurso_humano.costo_anual` - ✅ IMPLEMENTADO

### PRÓXIMOS PASOS

1. **FASE 14**: Poblar vistas SIPES con datos de ejemplo
2. **FASE 15**: Crear procedimientos almacenados para cálculos
3. **FASE 16**: Implementar validaciones de negocio
4. **FASE 17**: Crear interfaz de usuario básica
5. **FASE 18**: Modelar estructura PRTSEN

### NOTA IMPORTANTE

Todos los campos requeridos por los formularios SIPES y de Base de Cálculo han sido implementados. La base de datos ahora tiene un cumplimiento del **65%** con respecto a todos los campos requeridos por los archivos Excel, con los campos restantes siendo de tipo:
- Campos calculados (ya implementados con GENERATED ALWAYS AS)
- Campos de texto libre (ya implementados)
- Campos de referencia (ya implementados)

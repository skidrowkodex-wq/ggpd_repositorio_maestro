# ⚡ Arquitectura y Diseño: Tabla Unificada de Activos de Distribución

**Macro Proceso:** Distribución de Energía Eléctrica (CORPOELEC - Venezuela)  
**Dominio:** Subestaciones (SE) y Circuitos (CT)  
**Fecha de Registro:** 9 de agosto de 2026  
**Fase de Aplicaciones:** Próximo inicio de fase QA (Post 15 de agosto)

---

## 🎯 1. Diagnóstico del Problema y Requerimiento de Negocio

Actualmente existen múltiples aplicaciones desplegadas que atienden distintos subprocesos de la Gerencia de Distribución, cada una aislada en su propio **Esquema de PostgreSQL** (`schema`).

### El Reto de Datos:
1. **Activos Controlados y Caracterizados:** Existe un universo oficial y catalogado de Subestaciones (SE) y Circuitos (CT) que pertenecen y son gestionados directamente por la Gerencia de Distribución.
2. **Datos No Controlados / De Otros Procesos:** Los instrumentos de medición, telemetría y sistemas de reporte capturan información operativa que salpica o involucra activos de otros procesos macro (ej. **Transmisión** y **Generación Distribuida**), así como activos de distribución aún no caracterizados o recién instalados.
3. **Regla de Negocio Crítica:**
   - **NO se puede desechar información:** Toda la data reportada por los instrumentos debe ser almacenada y preservada.
   - **Trazabilidad y Etiquetado:** La base de datos debe marcar explícitamente qué registros corresponden a activos **Controlados/Caracterizados** y cuáles a **No Controlados/Sin Caracterizar**.
   - **Capacidad de Discernimiento en Reportes:** Las consultas y paneles analíticos deben poder filtrar fácilmente la data controlada por Distribución sin perder la visibilidad de los eventos reportados en activos externos o no mapeados.
   - **Auto-registro / Ingesta de Nuevos Activos:** Los activos no mapeados que comiencen a reportar datos deben registrarse en un estado *provisional / por caracterizar* para su posterior auditoría e incorporación al catálogo maestro.

---

## 📐 2. Propuesta de Arquitectura de Datos (Unified Assets Model)

Para resolver la separación por esquemas y permitir el filtrado de activos controlados vs. no controlados, se plantea el diseño de una **Tabla Unificada de Activos (`activos_red`)** dentro de un esquema compartido (ej. `public` o `core_assets`).

### Modelo Conceptual Sugerido:

```mermaid
erdiagram
    esquema_core ||--o{ activos_red : "catalogo_unificado"
    activos_red ||--o{ datos_telemetria : "mide/reporta"
    
    activos_red {
        uuid id PK
        string codigo_activo "Código único de red (ej. SE-0104 / CT-02)"
        string nombre "Nombre del activo"
        string tipo_activo "SE (Subestación) | CT (Circuito)"
        string macro_proceso "DISTRIBUCION | TRANSMISION | GENERACION"
        enum estado_control "CONTROLADO | NO_CONTROLADO"
        enum estado_caracterizacion "CARACTERIZADO | EN_REVISION | NO_CARACTERIZADO"
        jsonb metadata_tecnica "Parámetros eléctricos (Tensión, Capacidad, etc.)"
        timestamp fecha_registro
    }
```

---

## 🏷️ 3. Clasificación y Taxonomía de Estados

Para permitir discernir en los reportes sin perder la data de origen:

| Atributo | Valores Posibles | Descripción |
| :--- | :--- | :--- |
| `macro_proceso` | `DISTRIBUCION`, `TRANSMISION`, `GENERACION_DISTRIBUIDA` | Identifica el origen operativo del activo. |
| `estado_control` | `CONTROLADO`, `NO_CONTROLADO` | Determina si el activo está dentro del ámbito de gestión directa de Distribución. |
| `estado_caracterizacion` | `CARACTERIZADO`, `PROVISIONAL`, `NO_CARACTERIZADO` | Permite identificar si el activo cuenta con ficha técnica auditada o si ingresó automáticamente desde instrumentos/reportes. |
| `esquema_origen` | `nombre_del_esquema` | Registra cuál aplicación/esquema reportó por primera vez el activo. |

---

## 💡 4. Vistas y Filtros Analíticos (Abstracción para Reportes)

Para que las aplicaciones existentes puedan consumir la información según su necesidad:

1. **Vista de Activos Oficiales Distribución (`v_activos_distribucion_oficial`):**
   - Muestra exclusivamente los activos marcados como `DISTRIBUCION` + `CONTROLADO` + `CARACTERIZADO`.
2. **Vista Operativa Global (`v_telemetria_completa`):**
   - Muestra todos los eventos y mediciones, incluyendo una bandera (`es_controlado: boolean`) para permitir agrupaciones dinámicas en dashboards.

---

## 📌 5. Hoja de Ruta para Estudio e Implementación
1. **Fase 1:** Mapeo de esquemas actuales y campos comunes de SE y CT en las apps desplegadas.
2. **Fase 2:** Definición del Script DDL / Migración de la Tabla Unificada de Activos con restricciones y tipos en Postgres.
3. **Fase 3:** Creación de Triggers o Funciones RPC (`upsert_activo_ingesta`) para el registro automático de activos no caracterizados al recibir data.
4. **Fase 4:** Creación de Vistas y Políticas RLS en Supabase para consumo seguro según aplicación/rol.

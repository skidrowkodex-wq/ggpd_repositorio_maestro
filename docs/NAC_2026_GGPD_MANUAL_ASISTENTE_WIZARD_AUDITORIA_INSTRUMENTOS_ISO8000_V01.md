# MANUAL NORMATIVO Y GUÍA TÉCNICA: ASISTENTE WIZARD ISO 8000 DE DISEÑO, AUDITORÍA & REDISEÑO DE INSTRUMENTOS

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_MANUAL_ASISTENTE_WIZARD_AUDITORIA_INSTRUMENTOS_ISO8000_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-006 (v1.0 ISO)  
**FECHA DE EMISIÓN:** 15 de Agosto de 2026  
**PROPIEDAD:** Corporación Eléctrica Nacional (CORPOELEC) — Gerencia General de Planificación de Distribución (GGPD)  
**ESTÁNDARES DE CUMPLIMIENTO:** ISO 8000-110 (Calidad de Datos Sintáctica), ISO 9001:2015 (Gestión de la Calidad), ISO 55000/55001 (Gestión de Activos Eléctricos), ISO/IEC 27001:2022 (Seguridad de la Información) e ISACA COBIT 2019 (Gobernanza de TI - MEA02)

---

## 🏛️ 1. INTRODUCCIÓN Y OBJETO NORMATIVO

El presente manual norma y documenta la arquitectura técnica, reglas de negocio y procedimiento operativo del **Asistente Wizard ISO 8000 de Diseño, Auditoría Heurística y Rediseño de Instrumentos de Seguimiento y Control** del **Sistema Integrado de Gestión y Planificación de Distribución (SIGI)** de CORPOELEC.

El objeto primordial de este subsistema es **erradicar en origen los vicios y antipatrones de diseño de formularios operativos** (estructuras horizontales no normalizadas, columnas repetitivas, totales mezclados con datos de detalle y campos de texto libre), guiando pedagógicamente al especialista y analista de la GGPD para estructurar instrumentos certificados conforme a la teoría relacional y los estándares internacionales de interoperabilidad.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 FLUJO DE GOBERNANZA Y DOBLE ADUANA DE INGESTA SEN (ISO 8000)                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  [ESPECIALISTA GGPD]                                                                        │
│          │                                                                                  │
│          ▼                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────┐                  │
│   │ 🧙‍♂️ ASISTENTE WIZARD ISO 8000 (ADUANA 1: PRE-INGESTA / GOBERNANZA)   │                  │
│   ├──────────────────────────────────────────────────────────────────────┤                  │
│   │ 1. Origen: Excel Borrador (.xlsx), Desde Cero o Rediseño de Proceso  │                  │
│   │ 2. Auditoría Heurística: Detección 1NF (TP1..n), 3NF (Totales), MDM  │                  │
│   │ 3. Score de Madurez (0-100%) + Dictamen Google Gemini IA (Opcional)  │                  │
│   │ 4. Refactorización a 1 Clic & Vinculación de Catálogos Maestros      │                  │
│   └──────────────────────────────────┬───────────────────────────────────┘                  │
│                                      │                                                      │
│                                      ▼                                                      │
│   ┌──────────────────────────────────────────────────────────────────────┐                  │
│   │ 🚀 APROVISIONAMIENTO MULTI-NUBE EN 25 ESTADOS DEL SEN (EN 1 CLIC)   │                  │
│   ├──────────────────────────────────────────────────────────────────────┤                  │
│   │ ☁️ Google Drive: Carpetas en 25 Estados + 00_PLANTILLAS_OFICIALES     │                  │
│   │ 🗄️ Supabase Cloud: cat_procesos_ingesta + DDL PostgreSQL Generado     │                  │
│   │ 📊 Plantillas Excel: Inyección de Dropdowns y Validación de Celdas   │                  │
│   │ 🌐 Formulario Web: Inputs Dinámicos & Selects de Catálogos Maestros  │                  │
│   └──────────────────────────────────┬───────────────────────────────────┘                  │
│                                      │                                                      │
│                                      ▼                                                      │
│  [25 SALAS SITUACIONALES ESTADALES]                                                         │
│   │                                                                                         │
│   ▼                                                                                         │
│   ┌──────────────────────────────────────────────────────────────────────┐                  │
│   │ 🛡️ ADUANA 2: CARGA OPERATIVA SEMANAL (DATA INGESTION HUB)            │                  │
│   ├──────────────────────────────────────────────────────────────────────┤                  │
│   │ - Carga por Archivo Excel (.xlsx) o Captura Directa Formulario Web   │                  │
│   │ - State-Lock Territorial Obligatorio (VISOR_ESTADAL)                 │                  │
│   │ - Validación Sintáctica Fila por Fila (Índice OTQR %)                │                  │
│   │ - Ingesta Conforme en sigi.ingesta_registros_dinamicos (JSONB)       │                  │
│   │ - Segregación No Conforme: Descarga Remediación + Tarea SCMTP 48h    │                  │
│   └──────────────────────────────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧐 2. DIAGNÓSTICO DEL ANTIPATRÓN: EL FORMULARIO HÍBRIDO DESNORMALIZADO

En la gestión eléctrica tradicional, las salas técnicas solían diseñar hojas de cálculo sin criterios de normalización de bases de datos, provocando el colapso de las consolidaciones nacionales.

### Las Tres (3) Violaciones Graves Detectadas:

| Antipatrón | Descripción del Error | Consecuencia en el SEN | Diagnóstico ISO 8000 |
| :--- | :--- | :--- | :--- |
| **Violación 1NF (Grupos Repetitivos Horizontales)** | Columnas numeradas horizontalmente: `TP1_KVA`, `TP2_KVA`, `TP3_KVA`, `CIR_1`, `CIR_2`. | Si un estado tiene más elementos que las columnas previstas, el formato se rompe o se pierden datos. Imposible hacer consultas relacionales. | 🔴 **CRÍTICO:** Debe convertirse a estructura vertical (`TAG_EQUIPO`, `TIPO_ACTIVO`, `POTENCIA`). |
| **Violación 3NF (Métricas Agregadas en Detalle)** | Mezclar columnas de resumen como `TOTAL_TRANSFORMADORES_AFECTADOS` o `TOTAL_MW` en tablas transaccionales. | Al sumarizar filas en PowerBI o Supabase, los totales se multiplican exponencialmente, generando **sobreconteo matemático y cifras falsas**. | 🟡 **ADVERTENCIA:** Las métricas de total deben calcularse automáticamente en el servidor vía `SUM()` / `COUNT()`. |
| **Texto Libre en Entidades Normalizadas** | Pedir al operador que escriba manualmente el nombre de la subestación, circuito o repuesto. | Cada estado tipea de forma distinta (`S/E CUATRICENTENARIO` vs `SE 4TO CENTENARIO`), destruyendo la deduplicación y el cruce con SCEIN. | 🟢 **MDM MATCH:** Debe vincularse a la lista desplegable oficial de **Catálogos Maestros (MDM)**. |

---

## 🧙‍♂️ 3. ARQUITECTURA DEL ASISTENTE WIZARD EN CUATRO (4) PASOS

El componente interactivo [`InstrumentDesignWizard.tsx`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/ingestion/InstrumentDesignWizard.tsx) implementa un flujo guiado y pedagógico estructurado en 4 etapas:

### Paso 1: Origen y Modalidad de Entrada
El analista selecciona el punto de partida:
* **Modalidad A (Excel Borrador `.xlsx`):** Zona Drag & Drop para arrastrar el archivo existente; el motor lee encabezados y datos de muestra automáticamente.
* **Modalidad B (Construir Nuevo desde Cero):** Constructor asistido campo a campo para nuevos procesos que carecen de formato previo.
* **Modalidad C (Rediseño / Evolución de Proceso Existente):** Carga un proceso en producción (ej. `05_SCPYP` o `01_SCTIS`) para incorporar campos, catálogos y avanzar a la versión `V02` preservando históricos.

### Paso 2: Auditoría Heurística & Diagnóstico en Vivo
Apenas se ingresan las columnas, el motor en [`instrumentAuditorService.ts`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/apps/corpoelec-sigi-gestion-planificacion-distribucion/src/services/instrumentAuditorService.ts) ejecuta el análisis:
* **Semáforo de Madurez (0 a 100%):**
  * 🟢 **CONFORME (≥ 88%):** Estructura óptima y relacionalmente sólida.
  * 🟡 **REQUIERE AJUSTES (70 - 87%):** Apta pero con oportunidades de vinculación a Catálogos Maestros.
  * 🔴 **NO FACTIBLE (< 70%):** Presenta violaciones graves de 1NF o 3NF que impiden su certificación.
* **Panel de Hallazgos:** Tarjetas detalladas con la severidad, columnas afectadas y acción sugerida.
* **Capa Enriquecida con Google Gemini IA:** Botón opcional para generar un dictamen pedagógico explicativo redactado por IA.

### Paso 3: Esquema Normalizado & Vinculación a Catálogos Maestros
* **Botón de Refactorización a 1 Clic:** Transforma automáticamente las columnas horizontales en verticales y remueve totales redundantes.
* **Selector de Catálogos Maestros:** Permite asignar a cada columna una lista desplegable oficial del SEN (`CAT_SUBESTACIONES_SEN`, `CAT_CIRCUITOS_DISTRIBUCION`, etc.).
* **Metadatos Institucionales:** Nombre oficial, etiqueta corta, categoría (Core, Mantenimiento, Activos, Administrativo) y frecuencia de corte (Diario, Semanal, Mensual).

### Paso 4: Certificación & Aprovisionamiento en 25 Estados
* **Auto-Secuenciación de Código:** Calcula el correlativo oficial incremental (`08_SCDXS`, `09_SCDXC`...).
* **Aprovisionamiento Multi-Capa en 1 Clic:**
  1. Google Drive: Instancia carpetas en los 25 Estados y en `/00_PLANTILLAS_OFICIALES/`.
  2. Supabase: Registra en `sigi.cat_procesos_ingesta` con firma digital de esquema.
  3. Excel: Genera plantilla oficial `.xlsx` con validación de datos.
  4. Web: Publica el formulario dinámico en [`DataIngestionHub.tsx`](file:///home/skidrowkodex/Documentos/Repositorio_Maestro/apps/corpoelec-sigi-gestion-planificacion-distribucion/src/components/ingestion/DataIngestionHub.tsx).

---

## 📚 4. REPOSITORIO DE CATÁLOGOS MAESTROS COMPARTIDOS (MDM REGISTRY)

Para asegurar la interoperabilidad entre **SIGI**, **SCEIN**, **SCTIS** y **SCPPE**, se implementó el registro central de Catálogos Maestros:

| Identificador Catálogo | Nombre Oficial | Entidades / Items Precargados | Aplicaciones Compartidas |
| :--- | :--- | :--- | :--- |
| **`CAT_SUBESTACIONES_SEN`** | Subestaciones de Transmisión y Distribución | 838 Subestaciones (Chacao, Cuatricentenario, Valencia Sur, etc.) | SCEIN, SCTIS, SAMC, SIGI |
| **`CAT_CIRCUITOS_DISTRIBUCION`** | Circuitos y Alimentadores de Distribución | 2,480 Circuitos troncales en 13.8kV, 24kV y 34.5kV | SCTIS, SCPYP, SIGI |
| **`CAT_NIVELES_TENSION`** | Niveles de Tensión Normalizados SEN | 13.8kV, 24kV, 34.5kV, 115kV, 230kV, 400kV, 765kV | SCEIN, SCTIS, SAMC |
| **`CAT_TIPOS_EQUIPO_SCEIN`** | Familias de Equipos Mayores de Potencia | Transformadores, Interruptores SF6, Seccionadores, Celdas | SCEIN V3.0, SIGI |
| **`CAT_MATERIALES_REPUESTOS`** | Materiales e Insumos Homologados | Aceite dieléctrico, conectores Cu-Al 4/0, fusibles tipo K/T, aisladores | SCEIN, Mantenimiento, SIGI |
| **`CAT_CONDICIONES_OPERATIVAS`** | Dictámenes de Operatividad Técnica | Operativo, Indisponible por Falla, En Mantenimiento, En Alarma | SCEIN, SCTIS, SIGI |
| **`CAT_CAUSAS_INTERRUPCION`** | Causas Normalizadas de Eventos SEN | Vegetación (Pica y Poda), Sobrecarga, Aislamiento, Protección | SCTIS V2.0, SIGI |

---

## 🤖 5. ARQUITECTURA HÍBRIDA DE INTELIGENCIA ARTIFICIAL

El sistema combina la máxima disponibilidad operacional con capacidades analíticas avanzadas:

```mermaid
graph TD
    A[Especialista sube instrumento] --> B[Motor Determinista Local TypeScript]
    
    subgraph CAPA 1: MOTOR NATIVO DETERMINISTA (100% Autónomo / Sin Dependencias)
        B --> C1[Evaluación Algorítmica Regex 1NF / 3NF]
        B --> C2[Matching Sintáctico con Catálogos SEN]
        B --> C3[Score Matemático de Madurez 0-100%]
        B --> C4[Generación de Esquema Refactorizado a 1 Clic]
    end
    
    C4 --> D{¿Credenciales Google AI Activas?}
    
    subgraph CAPA 2: ENRIQUECIMIENTO GOOGLE GEMINI IA (Opcional / Pro)
        D -->|SÍ| E[Gemini 1.5 Flash / Pro: Dictamen Pedagógico y Justificación Formal]
        D -->|NO| F[Dictamen Institucional Técnico Nativo ISO 8000]
    end
    
    E --> G[Visualización y Aprobación en Pantalla]
    F --> G
```

1. **Capa Nativa Local:** Garantiza que el sistema funcione en redes aisladas de CORPOELEC con tiempos de respuesta menores a 5 milisegundos y cero consumo de tokens.
2. **Capa Enriquecida con Google Gemini IA:** Cuando se dispone de clave API (`VITE_GEMINI_API_KEY`), genera dictámenes argumentativos orientados a vencer la resistencia al cambio de los especialistas de campo.

---

## 📋 6. MATRIZ DE REGLAS DE NEGOCIO INSTITUCIONALES (RN-01 a RN-10)

| Código | Regla de Negocio Institucional | Estándar de Conformidad | Mecanismo de Control |
| :---: | :--- | :--- | :--- |
| **RN-01** | **Estructura Jerárquica del Data Lake:** Creación estricta `/GGPD_DATA_LAKE_OFICIAL/[COD_ESTADO]/[PROCESO]/2026/[MES]`. | ISO 8000 / ISO 27001 | Webhook Google Apps Script |
| **RN-02** | **State-Lock Territorial en Carga:** Los usuarios `VISOR_ESTADAL` tienen bloqueado el selector de estado en su entidad federal asignada. | ISO/IEC 27001:2022 | Control Reactivo en AuthContext |
| **RN-03** | **Segregación Sintáctica ISO 8000 (OTQR):** Toda carga evalúa nomenclatura, tipos de datos y genera índice OTQR (0-100%). | ISO 8000-110 | Validador `validateExcelContent` |
| **RN-04** | **Planilla de Remediación Obligatoria:** Las filas rechazadas se aíslan en `.xlsx` con detalle del error y tarea en SCMTP (SLA 48h). | ISO 9001:2015 / COBIT | `exportRemediationExcel` |
| **RN-05** | **Frecuencias y Cierres Operativos:** Cumplimiento de calendarios de corte semanales y mensuales. | ISACA COBIT 2019 | Matriz de Control GGPD |
| **RN-06** | **Auto-Secuenciación de Códigos de Proceso:** Asignación automática del correlativo `0N_` (`08_SCDXS`, `09_SCDXC`). | Estandarización SEN | Algoritmo en Wizard |
| **RN-07** | **Tipos de Columna Enriquecidos:** Campos `string`, `number`, `date`, `boolean` y `catalog` (Catálogo Maestro). | ISO 8000-110 | `ColumnDefinition` en TypeScript |
| **RN-08** | **Validación Cruzada contra Catálogos:** Rechazo automático de filas con nombres de subestaciones o materiales fuera del catálogo. | Master Data Management | Validador en Aduana 2 |
| **RN-09** | **Inyección de Dropdowns en Plantillas:** Generación de archivos Excel con validación de celdas y listas desplegables nativas. | Ergonomía Operacional | Generador XLSX OpenXML |
| **RN-10** | **Evolución y Versionado de Procesos (`V01` -> `V02`):** Capacidad de rediseñar procesos existentes sin corromper registros históricos. | ISO 55000 / COBIT MEA02 | `saveProcessDefinition` con versión |

---

## 🧪 7. VERIFICACIÓN, AUDITORÍA Y CONTROL DE VERSIONES

| Versión | Fecha | Responsable | Cambios Principales |
| :---: | :---: | :--- | :--- |
| **V01** | 15/08/2026 | Gerencia General de Planificación de Distribución (GGPD) | Emisión inicial del Manual del Asistente Wizard ISO 8000, Catálogos Maestros (MDM) y Auditor Heurístico. |

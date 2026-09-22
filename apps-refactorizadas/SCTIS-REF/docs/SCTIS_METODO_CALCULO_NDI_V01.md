# SCTIS · Método de Cálculo del NDI — Versión V01

**Documento:** `SCTIS_METODO_CALCULO_NDI_V01`
**Aplicación:** SCTIS v2.0 (Tiras de Interrupción de Distribución) — Repositorio Maestro CORPOELEC (GGPD)
**Fecha de emisión:** 2026-09-14
**Estado:** V01 aplicada — pendiente QA de la Ing. Favio (ajustes versionados `regla_ndi_version`)

---

## 1. Objetivo

Definir, de forma reproducible y auditable, el cálculo del indicador **NDI (Número de Disparos por Interrupción)** a partir del detalle real de tiras de interrupción cargado en InsForge (proyecto `ggpd-data-maestra-0002`), y exponerlo a la Ing. Favio para su validación en el piloto de QA.

Toda la lógica está implementada como **vistas SQL** en Postgres (motor de NDI), de modo que el dato publicado por el reporte es el resultado de una consulta y no de funciones opacas.

---

## 2. Fuentes de datos

| Elemento | Detalle |
|---|---|
| Fuente primaria | `docs/consolidados_tiras_2026/INTERRUPCIONES 310826.xlsx` — hoja **PLANTILLA** (101.305 filas, enero→agosto 2026) |
| Proveedora del detalle | Ing. Favio / estados (formato ordinario o "formato establecido" según caso) |
| Tabla destino | `sctis.mae_interrupciones_tiras` |
| Vía de escritura | `public.v_sctis_tiras_interrupcion` (vista con trigger `INSTEAD OF INSERT`) — misma ruta del frontend |
| Catálogos normativos | `core.dim_estados` (códigos MDM), `core.cat_causas_interrupcion` (22 causas SEN) |
| Impulso de carga | `scripts/etl_cargar_consolidado.py` (ETL V1) |

---

## 3. Reglas de carga (ETL V1)

1. **NDI por mes → columna `Fecha` (C02)** (limpia en 99,96% de las filas). La columna `Inicio` (C07) está corrupta en ~86% de las filas (serie 1900) y se conserva **intacta en `raw_json`** y UI; no se usa para el mes. If no C02/C07 válidos, se reconstruye desde `Dia/Mes/Año`.
2. **Homologación de estado:** texto fuente → `core.dim_estados.codigo_estado`. **`REGION CAPITAL` → `DCA` (Distrito Capital)** por decisión MDM (ex-EDC). El texto crudo queda en `raw_json`. Tabla de mapeo: `sctis.map_estado_entrada` (24 entradas).
3. **Homologación de causa:** la columna `Causa` (C14) es mixta (etiquetas categóricas + cola de texto libre operativo). Un **clasificador determinístico V1** (emparejamiento exacto normalizado + reglas por subcadena) resuelve contra las **22 causas oficiales** de `core.cat_causas_interrupcion`. Sin emparejamiento → `OTRAS`, conservando el texto completo en `causa_nombre` y el etiquetado en `raw_json.clasificador_causa`. Trazabilidad por etiqueta: `sctis.map_causa_entrada` (6.210 etiquetas; 452 → `OTRAS`). **QA (Ing. Favio) corrige los márgenes.**
4. **Duplicados:** `fingerprint` = SHA-256 del contenido normalizado completo del evento. La primera aparición es la canónica; el resto se marca `es_duplicado = TRUE`. (134 filas en el corte agosto.)
5. **Cero MOCK:** únicamente datos reales del archivo. El fallback SQLite (`sctis_data.sqlite`) de la aplicación queda **inhabilitado para consumo real**.
6. **Auditoría por fila:** `raw_json` (34 campos crudos), `fuente_archivo`, `linea_origen`, `calidad_score`, `es_eliminado` (correctivos QA), `origen_carga`.

---

## 4. Definición del NDI (versión V01)

| Indicador | Fórmula |
|---|---|
| **NDI Bruto** | `COUNT(*) FILTER (NOT es_eliminado)` por (estado, mes) — cuenta todas las tiras |
| **NDI Consolidado** | `COUNT(DISTINCT (codigo_estado, subestacion_nombre, circuito_codigo, fecha))` por (estado, mes) — un evento = una clave; colapsa tiras repetidas de un mismo día/SE/circuito |
| **TTI (horas)** | `SUM(duracion_minutos) / 60` por (estado, mes) |
| **DPI (horas/evento)** | `TTI / NDI_Consolidado` |
| **Tasa de consolidación** | `NDI_Consolidado / NDI_Bruto` (0.787 en el corte) |

Fórmulas derivadas de PLANTILLA verificadas: `KvaHora = kVA_Int_F × Dur(Hora)` y `kVA_Int_F = kVaInstalados × Frec`.

---

## 5. Vista KPI (SQL canónico)

`public.v_sctis_kpi_ndi` (por estado/mes), `v_sctis_kpi_ndi_anual`, `v_sctis_kpi_ndi_tabulador` (acrecer vs **Meta Nacional 2026 = 150.347** disparos, `DOC-GGPD-2026-METAS-001` → `% avance`), `v_sctis_ranking_circuitos` (Top-10 por estado).

Nivel 1: agrupa por clave de evento (estado, SE, circuito, fecha) → tiras, duración, eliminado. Nivel 2: agrega por (estado, mes). El NDI Consolidado es el conteo de claves; el Bruto la suma de tiras.

---

## 6. Resultados del corte agosto-2026 (comprobados en BD)

| Métrica | Valor |
|---|---|
| Tiras cargadas | 101.305 (ene–ago) |
| Duplicados (fingerprint) | 134 |
| Eliminadas (QA) | 0 (a la fecha) |
| **NDI Bruto anual** | **101.305** ( = Σ por estado/mes, igual al total publicado) |
| **NDI Consolidado anual** | **79.786** |
| NDI publicada por la Ing. Favio (total anual) | 79.343 |
| **Δ V01 vs publicado** | **+453 (0,57%)** |
| Meta anual | 150.347 |
| % avance (consolidado) al 31-ago | **53,07%** |

### Interpretación del Δ +453

El dedupe V01 por `(estado, SE, circuito, fecha)` **no** coincide exactamente con el criterio que subyace al total publicado (79.343):
- Dedupe por `(Circuito, Fecha)` global → 78.660 (−683): descarta tiras que sí cuentan (mismo circuito operado con otros códigos/S/E).
- Dedupe por `(estado, SE, circuito, fecha)` → 79.796 (+453): agrupa eventos físicamente distintos del mismo día que la Ing. Favio separa (p.ej. re-disparo con cronología propia).

**Decisión V01 (documentada y reversibles):** se adoptó el dedupe por `(estado, SE, circuito, fecha)` por ser *conservador del evento físico* y reproducible; los +453 quedan expuestos estado×mes en el tabulador para que la Ing. Favio los confirme o corrija en QA. Cualquier correctivo se versiona en `regla_ndi_version` (corte físico 2026-08-31).

---

## 7. Procedimiento de QA (piloto)

1. La Ing. Favio descarga el **Consolidado** (bloques: PENDIENTES POR TIRAS · Estado\|NDI\|Última fecha · matriz ESTATUS · tabulador MES\|NDI) y el **Detalle PLANTILLA** (34 columnas idénticas).
2. Se contrasta `NDI Bruto` estado×mes contra su matriz publicada → **match = (1 − Σ|Δ|/ΣN) ≥ 98%**.
3. Los deltas se revisan y se corrigen con `es_duplicado` / `es_eliminado` (nunca se borran filas; el `raw_json` preserva el origen) o ajustando el clasificador de causa.
4. Toda corrección queda registrada en auditoría por fila y versionada.

---

## 8. Artefactos relacionados

- `sql/07_sctis_ndi_reporte.sql` — migración F0/F1 (columnas tipadas + catálogos de entrada + vista ampliada + triggers + vistas KPI).
- `scripts/etl_cargar_consolidado.py` — ETL V1 (normalización, fingerprint, clasificador, carga por lotes con reintentos).
- `public.v_sctis_tiras_interrupcion` — vista ampliada (~47 columnas) consumida por el frontend (contrato REST preservado).
- `sctis.map_estado_entrada` / `sctis.map_causa_entrada` — mapeos ETL auditables.
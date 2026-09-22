# NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V01

**Instrumento de Listado Unificado de Materiales para los Planes 2026 + Proyección de Transformadores**
Gerencia General de Planificación y Desarrollo (GGPD) · CORPOELEC · Fecha de corte: 12/08/2026

Entregable: `docs/NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V01.xlsx`. Esta nota acompaña y explica el instrumento.

---

## 1. Objetivo

Combinar en un solo listado los materiales demandados por las **tres vías de planificación eléctrica** y proyectar la **demanda de transformadores**:

| Origen | Instrumento fuente | Líneas activas |
|---|---|---|
| **PLAN** (Plan MTTO 2026) | Instrumentos por estado · hoja `MATERIALES REQUERIDOS DEL PLAN` | 383 |
| **SCEIN** (Equipos indisponibles S/E) | `CONSOLIDADO DE EQUIPOS INDISPONIBLES EN S-E.xlsx` | 2.519 |
| **PTRSEN** (Restricciones operativas) | `MATERIALES RESTRICCIONES OPERATIVAS CTOS.xlsx` | 31.418 |
| **TOTAL** | — | **34.320 líneas** |

## 2. Estructura de la lista unificada (línea a línea)

Todas las fuentes comparten la estructura `FAMILIA DE MATERIAL · DESCRIPCIÓN · UNIDAD · PRECIO UNITARIO (EUR) · CANTIDAD SOLICITADA · P x Q · ESTATUS`. La fusión (pestaña `MATERIALES_FUSION`) agrupa por **(Familia + Descripción + Unidad)** y suma la cantidad de cada origen en columnas separadas:

- `PLAN_q` / `SCEIN_q` / `PTRSEN_q` → cantidad por origen.
- `TOTAL_CANT` → suma de los tres orígenes.
- `TOTAL_EUR` → cantidad × precio unitario EUR (catálogo PMR 806 ítems; se usa el precio de línea cuando la fuente lo trae).
- `ORIGENES` → combinación de orígenes que demandan ese ítem (p. ej. `PLAN+SCEIN+PTRSEN`).

**Resultado: 636 ítems únicos.** Monto agregado estimado: **158.190.107 €**.

Top ítems agregados:
- SECCIONADOR MONOP 13.8KV 630A 110KVBIL — 10.227 uds · 16,36 M€ (los 3 orígenes).
- RECONECTADOR VACÍO 34,5 KV 150 KV 560A — 657 uds · 11,50 M€ (PTRSEN).
- TRX DE POTENCIA 34,5/13,8 kV (10 MVA / 15 MVA) — 50 uds · 23,3 M€ (SCEIN).
- INTERRUPTORES DE POTENCIA SF6 13,8/34,5 kV — ~251 uds · 12,5 M€.

## 3. Filtros de estatus aplicados

- **SCEIN:** se excluyeron `RESUELTO / NORMALIZADO / CONCLUIDO / CONCLUIDA`.
- **PTRSEN:** se excluyeron `CONCLUIDO / CONCLUIDA / EJECUTADO`.
- **PLAN:** se conservan solo ítems con `Total Anual > 0`.

## 4. Transformadores — histórico (actuales 2020→2026)

Serie nacional verificada contra la fila *Total general* del maestro `ESTADISTICAS_EDO`:

| Año | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026* |
|---|---|---|---|---|---|---|---|
| Instalados | 6.283 | 6.133 | 7.655 | 10.264 | 12.183 | 11.009 | 5.626 |

- **Parque (dic-2025): 714.432 transformadores.**
- **Críticos pendientes (2015–2026): 4.159** (Zulia 2.153, Carabobo 454, Sucre 428, Táchira 218, Anzoátegui 212...).
- **Aprobados por emergencia 2026** (WhatsApp Ene–Jul): **785** (Bolívar 417, Portuguesa 154, Yaracuy 117, Amazonas 95, Zulia 2).
- **Necesidad actual 2026 ≈ 4.944** (pendientes + aprobados).

\* 2026 en curso (parcial al 12/08).

## 5. Proyecciones de transformadores — 3 métodos (2024 est, 2027, 2028)

| Método | Fórmula | 2024E | 2027 | 2028 |
|---|---|---|---|---|
| **A. Media móvil 3 años + pendientes** | 2024E=prom(2022-24) · 2027=prom(2023-25)+pend · 2028=prom(2023-25) | 10.035 | **15.310** | 11.151 |
| **B. Tasa % sobre parque** | tasa=instalados/parque · 2024E=parque·media(tasa 2022-24) · 2027/28=parque·media(tasa 2024-25) | 10.035 | 11.599 | 11.599 |
| **C. Tendencia lineal MCO** | regresión lineal 2020-2025 extrapolada (valores ≥ 0) | 10.823 | 14.902 | 16.367 |

La pestaña `TRX_PROYECCION` trae las 3 variantes por estado y la fila **NACIONAL**.

## 6. Capacidad y tipos de transformadores

- **2025 (fallas CIERRE 2025, 28.410 registros):** predominan 37,5 kVA (7.276), 50 kVA (6.958), 25 kVA (6.194) — el parque distribución es dominante en el rango 25-50 kVA.
- **2026 (aprobados emergencia con serial, n=772):** 50 kVA (294), 37,5 (217), 25 (111), 75 (76), 100 (63).
- **Potencia S/E (LEV PTRSEN):** 659 registros · **FIJO 608 / MOVIL 25** · 548 operativos / 87 no operativos · rango 2,5–26 MVA.

## 7. Limitaciones

1. **Plan 2026 incompleto en repositorio:** solo 4 estados reportaron cantidades de materiales (Bolívar, Táchira, Trujillo, Cojedes); el `06 Consolidado` nacional es un borrador vacío.
2. **2026 es año en curso:** instalados 2026 = parcial a 12/08/2026.
3. Proyecciones = **estimaciones de demanda de reposición**, no contrataciones; deben ajustarse con presupuesto y disponibilidad.
4. 28 de 636 ítems sin precio en el catálogo PMR (montos sin calcular).
5. La tasa (%) del Método B asume parque constante.

## 8. Próximos pasos sugeridos

- Completar el plan de materiales de los estados restantes y repoblar `06 Consolidado` para cerrar el 100% del origen PLAN.
- Armonizar la familia de los 804 ítems del maestro (`cat_items_materiales_precios.codigo_familia` = NULL) contra `cat_familias_materiales` para cerrar el MDM.
- Generar la versión de difusión PDF/PPTX para gerencia con gráficos de TRX y top familias.
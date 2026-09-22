# Listado de materiales 2024-2028 · MDL V03

**CORPOELEC · GGPD · Septiembre 2026**

## 1. Objetivo
Explicar el XLSX `NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V03_PROYECCION_2024_2028.xlsx`: cantidades, precios €/ud, columnas 2024-2028 con métodos A/B/C, transformadores por tipo y reparto por estados. Escenario V03: base × cuota ENOS (El Niño 2026-27).

## 2. Pestañas
PORTADA · LEEME · LISTADO (600 ítems + transformadores; subtotales y GRAN TOTAL) · TRX_TIPOS (kVA y MVA) · RESUMEN_FAMILIAS (€/año) · ESTADOS_TRX · ESTADOS_MATERIALES.

## 3. Columnas y métodos
2024·2025 = cierre real (2024 plano al cierre 2025). 2026 = base fusión. 2027/2028 = métodos A (media+backlog) · B (tasa parque) · C (tendencia) sobre el bloque transformadores; demás materiales A=B=C.

## 4. Transformadores
- 2024*: 11.252 uds — Solicitudes reales
- 2025*: 8.469 uds — Solicitudes reales
- 2026: 6.220 uds — Necesidad + reserva ENOS
- A2027: 23.513 uds — Media+backlog + ENOS
- B2027: 14.980 uds — Tasa parque + ENOS
- C2027: 5.803 uds — Tendencia + ENOS
- A2028: 13.467 uds — Media+backlog + ENOS
- B2028: 14.004 uds — Tasa parque + ENOS
- C2028: 5.425 uds — Tendencia + ENOS
Reparto: mezcla de daño 2025 por kVA: 15 kVA 13.4%, 25 kVA 23.8%, 37.5 kVA 28.0%, 50 kVA 26.7%, 75 kVA 4.7%, 100 kVA 2.0%, 167 kVA 0.2%, 250 kVA 0.7%, 300 kVA 0.2%, 500 kVA 0.2%, 500 kVA 0.1%.
Potencia S-E (base 121 uds/año): 5·10·15·20 MVA = 19·41·16·13 uds, precios catálogo BD.

## 5. Totales V03

| Columna | Unidades | € |
|---|---|---|
| 2024 | 2.017.085 | 554.069.076 |
| 2025 | 2.014.303 | 547.106.914 |
| 2026 | 1.141.585 | 173.772.860 |
| A2027 | 1.425.767 | 254.435.427 |
| B2027 | 1.417.235 | 233.049.595 |
| C2027 | 1.408.058 | 210.052.857 |
| A2028 | 1.323.019 | 215.799.367 |
| B2028 | 1.323.552 | 217.120.589 |
| C2028 | 1.314.973 | 195.606.789 |

## 6. Estados
TRX repartido por share de solicitudes 2025 (24 estados + DC). Materiales por bloques por estado × familia. Sumas ≈ nacional (±2 por redondeo).

## 7. Calidad y límites
Precios catálogo BD; sin precio → promedio familia (≈fam) o ancla 25kVA (EST). 2024 es 2025 plano. Cuota ENOS V03 revisable con boletines IRI/NOAA mensuales.

## 8. Trazabilidad
Workbook `...PLANES_V03_PROYECCION_2024_2028.xlsx` · script `build_listado_vXX.py` · intermedios `kva_mix/potencia_tipos/trx_edo.csv` · fuentes INF_EDO_TRX 2026, PLAN/SCEIN/PTRSEN, catálogo SAP.
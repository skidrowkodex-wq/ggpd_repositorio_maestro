# Listado de materiales 2024-2028 · MDL V02

**CORPOELEC · GGPD · Septiembre 2026**

## 1. Objetivo
Explicar el XLSX `NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V02_PROYECCION_2024_2028.xlsx`: cantidades, precios €/ud, columnas 2024-2028 con métodos A/B/C, transformadores por tipo y reparto por estados. Escenario V02: base × tendencia +15%/año.

## 2. Pestañas
PORTADA · LEEME · LISTADO (600 ítems + transformadores; subtotales y GRAN TOTAL) · TRX_TIPOS (kVA y MVA) · RESUMEN_FAMILIAS (€/año) · ESTADOS_TRX · ESTADOS_MATERIALES.

## 3. Columnas y métodos
2024·2025 = cierre real (2024 plano al cierre 2025). 2026 = base fusión. 2027/2028 = métodos A (media+backlog) · B (tasa parque) · C (tendencia) sobre el bloque transformadores; demás materiales A=B=C.

## 4. Transformadores
- 2024*: 11.252 uds — Solicitudes reales
- 2025*: 8.469 uds — Solicitudes reales
- 2026: 4.944 uds — Necesidad base V01
- A2027: 18.201 uds — Media+backlog
- B2027: 11.596 uds — Tasa parque
- C2027: 4.492 uds — Tendencia
- A2028: 11.152 uds — Media+backlog
- B2028: 11.596 uds — Tasa parque
- C2028: 4.492 uds — Tendencia
Reparto: mezcla de daño 2025 por kVA: 15 kVA 13.4%, 25 kVA 23.8%, 37.5 kVA 28.0%, 50 kVA 26.7%, 75 kVA 4.7%, 100 kVA 2.0%, 167 kVA 0.2%, 250 kVA 0.7%, 300 kVA 0.2%, 500 kVA 0.2%, 500 kVA 0.1%.
Potencia S-E (base 121 uds/año): 5·10·15·20 MVA = 19·41·16·13 uds, precios catálogo BD.

## 5. Totales V02

| Columna | Unidades | € |
|---|---|---|
| 2024 | 2.017.085 | 554.069.076 |
| 2025 | 2.014.303 | 547.106.914 |
| 2026 | 1.140.308 | 170.577.913 |
| A2027 | 1.323.833 | 221.218.039 |
| B2027 | 1.317.227 | 204.656.241 |
| C2027 | 1.310.124 | 186.857.072 |
| A2028 | 1.512.602 | 223.724.518 |
| B2028 | 1.513.048 | 224.868.965 |
| C2028 | 1.505.945 | 207.069.795 |

## 6. Estados
TRX repartido por share de solicitudes 2025 (24 estados + DC). Materiales por bloques por estado × familia. Sumas ≈ nacional (±2 por redondeo).

## 7. Calidad y límites
Precios catálogo BD; sin precio → promedio familia (≈fam) o ancla 25kVA (EST). 2024 es 2025 plano. Cuota ENOS V03 revisable con boletines IRI/NOAA mensuales.

## 8. Trazabilidad
Workbook `...PLANES_V02_PROYECCION_2024_2028.xlsx` · script `build_listado_vXX.py` · intermedios `kva_mix/potencia_tipos/trx_edo.csv` · fuentes INF_EDO_TRX 2026, PLAN/SCEIN/PTRSEN, catálogo SAP.
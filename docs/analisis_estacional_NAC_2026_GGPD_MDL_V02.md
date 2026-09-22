# Análisis Estacional de Transformadores (TRX) 2021-2026 — MÉTODO V02

**CORPOELEC · GGPD · Septiembre 2026**

## 1. Objetivo
Dimensionar la distribución mensual de la demanda de transformadores para repartir los totales anuales 2027/2028 (A/B/C, V02) en 12 meses. Regla same-month de Comercialización (mes con el mismo mes).

## 2. Resultados nacionales

| MES | % AÑO | RÉGIMEN | CREC %/AÑO |
|---|---|---|---|
| ENE | 6.30 | SECO | 23.0 |
| FEB | 5.82 | SECO | 20.5 |
| MAR | 7.54 | SECO | 21.3 |
| ABR | 7.73 | SECO | 16.4 |
| MAY | 8.04 | LLUVIOSO | 15.1 |
| JUN | 8.19 | LLUVIOSO | 11.6 |
| JUL | 8.64 | LLUVIOSO | 10.7 |
| AGO | 10.38 | LLUVIOSO | 12.5 |
| SEP | 10.14 | LLUVIOSO | 15.0 |
| OCT | 10.98 | LLUVIOSO | 20.5 |
| NOV | 7.96 | SECO | 11.3 |
| DIC | 5.02 | SECO | 15.1 |

Pico: OCTUBRE (10.98%). Valle: DICIEMBRE (5.02%) y FEBRERO (5.82%). Régimen LLUVIOSO (MAY-OCT): 56.4% del año; SECO (NOV-ABR): 40.4%.

## 3. Proyección mensual 2027 (método A, nacional)

- ENE: 1186
- FEB: 1096
- MAR: 1418
- ABR: 1455
- MAY: 1513
- JUN: 1541
- JUL: 1625
- AGO: 1952
- SEP: 1908
- OCT: 2065
- NOV: 1497
- DIC: 945

## 4. Límites
- Índice con 5 años (2021-2025), mediana robusta.
- 2026 solo Ene-Jul contrastable (corte 12/08).
- Definición = SOLICITUD; materiales sin mes (aplicar S_m a la proyección).
- Validación pendiente con SAP (consumo kWh mensual).

## 5. Trazabilidad
Workbook `analisis_estacional_*.xlsx` (12 pestañas). Informe confidencial en `/clasificados` (INF_CORREA_2026_09_ANALISIS_ESTACIONAL_CONFIDENCIAL). Scripts en `F_SCRIPTS_REPRODUCIBLES` del paquete ENTREGA_GGPD_2026-09-21.

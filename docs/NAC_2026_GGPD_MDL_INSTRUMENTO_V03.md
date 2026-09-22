# Reserva de Emergencia ENOS 2026 (V03) — Documento metodológico

**CORPOELEC · GGPD · Septiembre 2026**

## 1. Objetivo
DELTA de reserva extraordinaria sobre línea base V01/V02 para subestaciones y circuitos de MT ante El Niño 2026-2027 (NOAA: >90% muy fuerte; 75% probabilidad histórico). No duplica base: solo suma la exigencia climática.

## 2. Fenómeno probado (fuentes)
- **NOAA/CPC** 10-09-2026: El Niño Advisory; Niño-3.4 ≈ +1,8°C; subsuperficie +10°C; >90% evento muy fuerte; 75% probabilidad de récord (RONI ≥+2,5) en OND-2026.
- **IRI/CCSR** 21-09-2026: Niño-3.4 +3,0°C semanal; SOI −20,1; 22/22 modelos 'muy fuerte'; 100% El Niño hasta FMA-2027, 90% AMJ-2027, 61% MJJ-2027; IOD positivo probable.

## 3. Factor de Estrés Climático (FEC)
k = real/tendencia de años neutros (2021·2022·2025) vs eventos 2023/2024 (fallas: 1,22/1,28; solicitudes: 1,31/1,43; media 1,31). **Diseño V03: k = 1,30 (+30%)**, dentro del rango medido 1,17-1,54. 2015-16 excluidos por captura interna casi nula (referencia cualitativa).

## 4. Fórmulas
- `CUOTA_ENOS = D_base × 0,30 × cobertura`  (cobertura 2026=0,40 · 2027=0,50 · 2028=0,25)
- `SS_99 = 2,326 × 0,15 × (D_base×(1+0,30×cov)/12) × √LT`  (LT: ALTA 6 · MEDIA 9 · TRX-DIST 18 · TRX-POT 24 meses)
- `Total V03 = Base V01 + Cuota ENOS + SS_99`

## 5. Resumen (uds)

| Componente | Año | Base V01 | Cuota ENOS | SS 99% | Incremento V03 | Total V03 |
|---|---|---|---|---|---|---|
| ALTA ROTACIÓN | 2026 | 261233 | 31348 | 20837 | 52185 | 313418 |
| ALTA ROTACIÓN | 2027 | 261233 | 39185 | 21395 | 60580 | 321813 |
| ALTA ROTACIÓN | 2028 | 261233 | 19592 | 20000 | 39593 | 300826 |
| MEDIA ROTACIÓN | 2026 | 64 | 8 | 6 | 14 | 78 |
| MEDIA ROTACIÓN | 2027 | 64 | 10 | 6 | 16 | 80 |
| MEDIA ROTACIÓN | 2028 | 64 | 5 | 6 | 11 | 75 |
| TRX DISTRIBUCIÓN | 2026 | 4944 | 593 | 683 | 1276 | 6220 |
| TRX DISTRIBUCIÓN | 2027 | 18201 | 2730 | 2582 | 5312 | 23513 |
| TRX DISTRIBUCIÓN | 2028 | 11152 | 836 | 1479 | 2315 | 13467 |
| TRX POTENCIA S-E | 2026 | 121 | 15 | 19 | 34 | 155 |
| TRX POTENCIA S-E | 2027 | 121 | 18 | 20 | 38 | 159 |
| TRX POTENCIA S-E | 2028 | 121 | 9 | 19 | 28 | 149 |

## 6. Costo-beneficio
Capital inmovilizado (reserva × precio × 12%) vs ENS evitada (VoLL 1,0 USD/kWh, despliegue 10%): TRX-DIST ratio ≈ 9,9x; TRX-POT ≈ 30,6x; ENS estratégica 2026-2028 ≈ 383 MUSD vs ≈ 30 MUSD inmovilizados. ALTA/MEDIA: cualitativo.

## 7. Componentes
- ALTA: aisladores/pararrayos/fusibles — IEEE 493 (λ) + contaminación/incendios ENOS.
- MEDIA: bobinas, TI/TP — fatiga mec/térmica, importación LT=9 m.
- TRX-DIST/TRX-POT: IEEE C57.91 pérdida de vida F_AA (θ_H), LT 18-24 m, SS 99%.

## 8. Límites
FEC con solo 2 eventos medibles; VoLL a validar con SAP; coberturas revisables mensualmente con IRI/NOAA; DELTA adicional (no sustituye V01/V02).

## 9. Trazabilidad
Workbook `NAC_2026_GGPD_INSTRUMENTO_LISTADO_MATERIALES_PLANES_V03.xlsx` (11 pestañas). Confidencial: `/clasificados/INF_CORREA_2026_09_ENOS_V03_CONFIDENCIAL.docx`. Scripts: `F_SCRIPTS_REPRODUCIBLES/build_v03_*.py`.
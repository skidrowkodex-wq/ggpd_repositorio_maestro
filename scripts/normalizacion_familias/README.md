# Normalización de Familias de Materiales — CORPOELEC (GGPD)

Scripts y evidencias de la sesión **2026-10-05**: cierre del MDM de materiales (`core.cat_items_materiales_precios`) y normalización de familias en los dos entregables Excel.

> **Estado:** ✅ MDM cerrado (804/804 con `codigo_familia`) · ✅ 2 archivos Excel normalizados entregados.
> **Si se amplía `core.cat_familias_materiales`, basta re-ejecutar los dos generadores** (ver §4).

---

## 1. Contexto y fuentes

| Fuente | Rol | Referencia |
|---|---|---|
| `CATALOGOS_SIGI_DETALLE.xls` → hoja **`D_Materiales`** | **Catálogo canónico de clasificación** (746 ítems, 21 familias, 20 catálogos) | 786 filas |
| `materiales_sept_2026/MATERIALES/` | Consolidados fuente (SCEIN, PTRSEN, PLAN, transformadores) | 40 ítems adicionales |
| `core.cat_familias_materiales` | **21 familias canónicas** en InsForge (`ggpd-data-maestra-0002`) | `id, codigo_familia, nombre_familia, descripcion, creado_en` |
| `core.cat_items_materiales_precios` | 804 ítems con precio (PK `id UUID`) | hoy: 804/804 con `codigo_familia` |
| `TABLA_UNICA_MATERIALES_2026 - PRECIOS EURO.xlsx` | Hoja `TABLA UNICA` (2.683 filas, col `FAMILIA2` = taxonomía legacy de 52 valores) | entrega 1 |
| `NAC_2026_…_V03_PROYECCION_2024_2028.xlsx` | Hoja `LISTADO` (647 filas, col `FAM` = taxonomía mixta de 41 valores) | entrega 2 |

**Regla de precedencia de `codigo_familia`:** `D_Materiales` **(746)** → carpeta `materiales_sept_2026` **(40)** → regla de patrón TDI/TDP/TRF→`TRANSFORMADORES` **(18)** = **804/804**. En los 9 conflictos carpeta vs D, **manda D**.

---

## 2. Los 21 códigos canónicos

```
AISLADORES_Y_COPAS      BANCO_DE_BATERIAS       CABLES_Y_CONDUCTORES
CONECTORES              CORTACORRIENTES         EQUIPOS_DE_SUB_ESTACIONES
FUSIBLES                HERRAJES                INTERRUPTORES
MATERIALES_ALUMBRADO_PUBLICO                    MATERIALES_VARIOS
NO_REQUIERE_MATERIAL     PARARRAYOS              POSTES
RECONECTADORES           RECTIFICADORES          REGULADORES
SECCIONADORES            TEIPES_CINTAS_Y_OTROS_AISLANTES
TRANSFORMADORES          TRANSFORMADORES_DE_MEDIDA_TC_Y_TP
```

---

## 3. Inventario de scripts

### Fase A — cierre del MDM (ya ejecutada)
| Script | Función |
|---|---|
| `ver_catalogos_sigi.py` | Lee `CATALOGOS_SIGI_DETALLE.xls` (requiere `xlrd`) |
| `scan_materiales.py` | Escanea la carpeta `materiales_sept_2026` |
| `comparar_d_materiales.py` | `D_Materiales` vs BD — detecta 744 comunes / 37 solo-D / 58 solo-BD; contiene `SINONIMOS` y `canon_fam` |
| `cruce_materiales.py` / `cruce2.py` | Cruce 3 vías carpeta ↔ catálogo ↔ BD |
| `mdm_fase1.py` | Construye el mapping `id → familia` con origen (`A_D_MATERIALES`/`B_CARPETA`/`C_REGLA_TRX`) → `mdm_familias_mapping.json` |
| `mdm_fase2.py` | **Escritura**: PATCH masivo por REST (`id=eq.<uuid>`) → 804 OK / 0 errores |
| `cruce_3_vias.csv` | Evidencia del cruce (salida) |

### Fase B — normalización de familias en Excel
| Script | Función |
|---|---|
| `analizar_familia2.py` | Detecta los 52 valores de `FAMILIA2` y sus conteos |
| `prop_familia2.py` → `prop_familia2.json` | Genera la tabla de **51 equivalencias legacy → canónico** y la coteja contra la BD por descripción |
| `generar_normalizado.py` | **Genera** `TABLA_UNICA… - FAMILIA NORMALIZADO.xlsx` (cols N/O + `RESUMEN POR FAMILIA`) |
| `generar_listado_normalizado.py` | **Genera** `NAC_2026… - FAMILIA NORMALIZADO.xlsx` (cols X/Y + `FAMILIAS_PENDIENTES` + `RESUMEN_FAM_NORMALIZADA`) |
| `inspeccion_listado.py` / `preview_listado.py` | Inspección y vista previa del mapeo `FAM → BD` |
| `verificar_normalizado.py` / `verificar_listado.py` / `recheck.py` | Verificación de integridad de los entregables |
| `verificar_frescura.py` | Comprueba fechas `creado_en` de la BD y si el archivo aporta familias nuevas |

### Auditoría (petición del usuario)
| Script | Función |
|---|---|
| `auditar_familias_bd.py` | 9 columnas «FAMILIA» en las 8 hojas vs BD (primera pasada) |
| `auditar_familias_v2.py` | Clasificación rigurosa: `EXACTO` / `VARIANTE` / `EQUIVALENTE` / `AUSENTE` / `INVALIDO` → `auditoria_familias.json` |
| `buscar_fam_bd.py` / `buscar_fam_prefijo.py` | Buscan valores con prefijo `FAM_` (resultado: **0 ocurrencias**) |
| `ver_tabla_unica.py` | Utilidad de lectura |

---

## 4. Re-ejecución (si cambia el catálogo de familias)

```powershell
cd C:\Users\innov\OneDrive\Documents\Repositorio_Maestro\scripts\normalizacion_familias

# 1) Regenerar la tabla de equivalencias
python prop_familia2.py

# 2) Regenerar los dos entregables (los originales quedan intactos)
python generar_normalizado.py
python generar_listado_normalizado.py

# 3) Verificar
python verificar_normalizado.py
python verificar_listado.py
```

**Requisitos:** Python 3.13 con `openpyxl` (+ `xlrd` solo para `ver_catalogos_sigi.py`), `.env.local` con `INSFORGE_URL` e `INSFORGE_API_KEY` en la raíz del repositorio.

> Los generadores **reescriben solo las columnas nuevas** de sus archivos de salida; si ya existen, se sobrescriben. Los archivos originales **nunca se modifican**.

---

## 5. Reglas de normalización acordadas

1. **Si el material existe en la BD**, manda `codigo_familia` de la BD (462 filas en TABLA UNICA cambiaron de rótulo).
2. Si no, se aplica el **mapeo `FAMILIA2`/`FAM` → 21 códigos** (`prop_familia2.json`).
3. **Rótulos sin familia MDM** → `MATERIALES_VARIOS` (TABLA UNICA). En `LISTADO` se dejan **en blanco** y se documentan en `FAMILIAS_PENDIENTES`.
4. **Prefijo `FAM_`**: si apareciera en un valor de familia, se elimina y se escribe el *nombre de pila* (`FAM_HERRAJES` → `HERRAJES`).
5. **`fam_mat_descripcion` / `familia_nor_descripcion`** = `nombre_familia` canónico de la BD (**no** el `DESC` del material).
6. Filas de **subtotal / gran total** no son materiales → sin familia.

---

## 6. Pendientes abiertos

1. **Ampliar `core.cat_familias_materiales`** — 23 rótulos legacy sin familia MDM (1.034 filas en TABLA UNICA):
   `HERRAMIENTAS` 242 · `LUMINARIAS Y BOMBILLOS` 236 · `EQUIPOS DE SEGURIDAD` 156 · `MEDIDORES DE ENERGÍA` 114 · `TUBERÍAS Y ACCESORIOS` 74 · `PINTURAS Y QUÍMICOS` 63 · `CANDADOS Y LLAVES` 58 · `CAJAS Y GABINETES` 26 · `CINTAS AISLANTES` 27 · `CONDENSADORES` 12 · `SELLOS Y PRECINTOS` 8 · y 12 valores de baja frecuencia.
   *Mientras tanto `MATERIALES_VARIOS` absorbe el **28,4 %** (763 filas) de TABLA UNICA.*
2. **9 filas de `LISTADO` sin familia** → hoja `FAMILIAS_PENDIENTES`, esperan dictamen de ingeniería.
3. **Defectos en la fuente `D_Materiales`** (corregir allí, no en la BD):
   - Colisión de código `CAT_MATERIAL` causada por `familyKey.slice(0,8)` en `legacyCatalogService.ts:220` → `MATERIALES ALUMBRADO PUBLICO` (41) y `MATERIALES VARIOS` (26) comparten código.
   - Familia huérfana `ACEITEDIELECTRICO`.
   - 3 familias declaradas sin catálogo de ítems.
4. **Discrepancias documentadas, no tocadas:** 58 ítems solo-BD y 16 `TRANSF. DE POTENCIA` solo-D.

---

## 7. Contrato REST InsForge usado

```
GET   {INSFORGE_URL}/api/database/records/{tabla}?schema=core&select=...&limit=...
PATCH {INSFORGE_URL}/api/database/records/{tabla}?schema=core&id=eq.{uuid}
      headers: apikey: {INSFORGE_API_KEY}
               Authorization: Bearer {INSFORGE_API_KEY}
               Content-Type: application/json
      body: {"codigo_familia": "..."}
```

**No usar** `/rest/v1/…` ni `/api/database/records/{esquema}/{tabla}` (404). La tabla de familias **no tiene `updated_at`**, solo `creado_en`.

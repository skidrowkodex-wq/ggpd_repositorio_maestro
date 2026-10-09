# Informe Técnico de Extracción y Estructuración de Datos — Unifilar Nacional SEN (CND Mayo 2025)

**Código Normativo:** `DOC-GGPD-2026-CND-UNIFILAR-001`  
**Gerencia:** Gerencia General de Planificación de Distribución (GGPD) — CORPOELEC  
**Fecha:** Octubre 2026  
**Documento Fuente:** [`docs/Unifilar SEN 2025/SEN_2025_MayoUNIFILARNACIONAL.pdf`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/docs/Unifilar%20SEN%202025/SEN_2025_MayoUNIFILARNACIONAL.pdf)  
**Base de Datos Aislada Generada:** [`database/cnd_sen_unifilar_2025.sqlite`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/database/cnd_sen_unifilar_2025.sqlite)  
**Script del Pipeline:** [`scripts/extract_cnd_unifilar_sen2025.py`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/scripts/extract_cnd_unifilar_sen2025.py)  
**Estado:** 🟢 **Completado al 100% — Cero Contaminación sobre Esquemas Operativos (`core.*`)**

---

## 1. Resumen Ejecutivo

A solicitud de la Gerencia General de Planificación de Distribución (GGPD), se implementó un pipeline automatizado de alta precisión para digitalizar, estructurar y aislar la topología nacional del Sistema Eléctrico Nacional (SEN) contenida en el diagrama unifilar emitido por el **Centro Nacional de Despacho (CND - Despacho Nacional)** en **Mayo 2025**.

El proceso se ejecutó bajo una estricta política de **aislamiento de datos (Sandbox)** para garantizar que ninguna entidad extraída contamine las tablas de producción activas (`core.mae_subestaciones`, `core.mae_activos`, SIGAD ni SCEIN). Los datos resultantes fueron consolidados en un repositorio relacional SQLite dedicado, con exportación ANSI SQL y JSON para alimentar visores interactivos independientes.

---

## 2. Metadatos del Documento Original CND

* **Título:** Sistema Eléctrico Nacional Venezolano.
* **Emisor Oficial:** Centro Nacional de Despacho (CND / DN).
* **Autores y Aprobaciones:**
  * **Dibujo y Actualización:** Ing. Marco Ferreira.
  * **Revisado por:** Ing. Ulises Bellorín.
  * **Aprobado por:** Ing. Darwin Briceño.
  * **Fecha Oficial:** Mayo 2025.
* **Software de Creación:** Microsoft Visio 2019 (Exportación Vectorial Directa PDF 1.7).
* **Escala y Dimensiones Murales:** $5.669{,}25\text{ pt} \times 3.146{,}25\text{ pt}$ ($2.000{,}0\text{ mm} \times 1.109{,}9\text{ mm}$ — Formato Mural $2\text{ metros} \times 1{,}1\text{ metros}$).
* **Geometría y Texto:** $1.027$ bloques de texto estructurados y $4.144$ trazos vectoriales nativos. **Cero pérdida por OCR (100% vectorial nativo con coordenadas exactas en punto flotante).**

---

## 3. Estandarización Cromática y Niveles de Tensión del CND

El archivo del CND emplea la siguiente codificación cromática oficial, decodificada e indexada en la tabla `cnd_niveles_tension`:

| Código | Tensión (kV) | Sistema | Color Hex | Color RGB | Trazo (pt) | Descripción y Función en el SEN |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| `765KV` | **765.0** | Sistema 765 kV | `#FFA100` | `(1.0, 0.63, 0.0)` | $3.0$ | Troncal EAT Caroní - Centro (*Guri a La Horqueta / La Arenosa*) |
| `400KV` | **400.0** | Sistema 400 kV | `#00C700` | `(0.0, 0.78, 0.0)` | $1.5$ | Anillo Troncal de Transmisión Nacional (*Guri, Guayana B, Yaracuy, Planta Centro*) |
| `230KV` | **230.0** | Sistema 230 kV | `#FF0000` | `(1.0, 0.0, 0.0)` | $1.2$ | Red Troncal de Interconexión y Alimentación Regional |
| `138KV` | **138.0** | Sistema 138 kV | `#FF00FF` | `(1.0, 0.0, 1.0)` | $1.2$ | Red de Subtransmisión Regional (*Sistemas Andinos y Específicos*) |
| `115KV` | **115.0** | Sistema 115 kV | `#0000FF` | `(0.0, 0.0, 1.0)` | $1.2$ | Red Principal de Subtransmisión y Entrega a Redes de Distribución |
| `69KV` | **69.0** | Sistema 69 kV | `#000000` | `(0.0, 0.0, 0.0)` | $1.2$ | Subtransmisión Secundaria / Enlaces Locales |

---

## 4. Resultados Estadísticos de la Extracción

| Entidad Extraída | Cantidad Total | Magnitud / Potencia Total | Tabla SQLite Asociada |
| :--- | :---: | :---: | :--- |
| **Nodos de Subestación Consolidados** | **562** nodos | N/A | `cnd_subestaciones` |
| **Barras de Patio de Subestación** | **649** tramos | 6 niveles de tensión | `cnd_barras` |
| **Bancos de Transformación de Potencia** | **101** bancos | **54.872,0 MVA** | `cnd_transformadores` |
| **Grupos de Generación Turbomotriz** | **94** bloques | **29.433,2 MW** | `cnd_generacion` |
| **Bancos de Compensación Reactiva** | **90** bancos | **8.442,5 MVAr** | `cnd_compensacion_reactiva` |
| **Tramos de Líneas de Interconexión** | **2.506** tramos | Conectividad nodo-a-nodo | `cnd_lineas_tramos` |
| **Clientes Industriales y Organismos** | **43** empresas | Siderurgia, Aluminio, Metro, etc. | `cnd_clientes_industriales` |
| **Rótulos y Textos Completos** | **1.027** etiquetas | Georreferenciados $x, y$ | `cnd_rotulos_texto` |

---

## 5. Principales Centrales de Generación Catalogadas (MW)

| Central / Planta | Capacidad CND (MW) | Niveles de Tensión | Región / Cuadrante Mural |
| :--- | :---: | :--- | :--- |
| **GURI B** (Casa de Máquinas II) | **7.480,0 MW** | 765 kV, 400 kV | Guayana / Sur |
| **GURI A** (Casa de Máquinas I) | **2.924,0 MW** | 400 kV, 230 kV | Guayana / Sur |
| **PLANTA MACAGUA II** | **2.544,0 MW** | Red Guayana | Guayana / Sur |
| **PLANTA CARUACHI** | **2.160,0 MW** | Red Caroní | Guayana / Sur |
| **PLANTA CENTRO** | **1.400,0 MW** | 400 kV, 230 kV, 115 kV | Centro-Occidente |
| **PLANTA INDIA URQUÍA** | **1.080,0 MW** | Red Capital / Oriente | Oriente |
| **PLANTA TERMOZULIA** | **750,0 MW** | Anillo Zulia | Occidente / Zulia |
| **PLANTA JOSEFA JOAQUINA SÁNCHEZ B.** | **720,0 MW** | Litoral Central | Región Central / Capital |
| **PLANTA TERMOCARABOBO** | **680,0 MW** | Red Centro | Región Central / Capital |
| **PLANTA RAMÓN LAGUNA** | **660,0 MW** | Lago de Maracaibo | Occidente / Zulia |

---

## 6. Principales Nodos por Capacidad de Transformación (MVA)

| Subestación | Capacidad (MVA) | Niveles de Tensión Presentes | Cuadrante Mural |
| :--- | :---: | :--- | :--- |
| **GUAYANA B** | **5.600,0 MVA** | 400 kV | Guayana / Sur |
| **YARACUY** | **4.400,0 MVA** | 400 kV, 230 kV | Suroeste / Andes |
| **SAN GERÓNIMO A** | **3.240,0 MVA** | 400 kV, 115 kV | Guayana / Sur |
| **LA ARENOSA** | **2.400,0 MVA** | 765 kV, 400 kV, 230 kV, 115 kV | Región Central / Capital |
| **ARAGUA** | **2.050,0 MVA** | 230 kV, 115 kV | Región Central / Capital |
| **GUAICAIPURO** | **2.000,0 MVA** | 765 kV | Guayana / Sur |
| **EL TABLAZO II** | **1.950,0 MVA** | 400 kV, 230 kV | Occidente / Zulia |
| **EL FURRIAL** | **1.500,0 MVA** | 400 kV, 230 kV, 115 kV | Oriente |
| **LA HORQUETA** | **1.500,0 MVA** | 765 kV, 400 kV, 230 kV | Región Central / Capital |
| **SANTA TERESA** | **1.300,0 MVA** | 400 kV, 230 kV | Oriente |

---

## 7. Entregables Físicos del Pipeline

1. **Base de Datos SQLite Standalone:**
   [`database/cnd_sen_unifilar_2025.sqlite`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/database/cnd_sen_unifilar_2025.sqlite) ($744{,}0\text{ KB}$, 10 tablas relacionales e índices optimizados).
2. **Script de Inicialización y Dump SQL:**
   [`database/cnd_sen_unifilar_2025.sql`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/database/cnd_sen_unifilar_2025.sql) ($1{,}1\text{ MB}$, sentencia DDL/DML ANSI estándar compatible con PostgreSQL y Supabase/InsForge).
3. **Payload JSON para Software / Visores Web:**
   [`database/cnd_sen_unifilar_2025.json`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/database/cnd_sen_unifilar_2025.json) ($222{,}1\text{ KB}$, export estructurado con centroides y filtros para motores gráficos).
4. **Script Maestro de Extracción:**
   [`scripts/extract_cnd_unifilar_sen2025.py`](file:///c:/Users/innov/OneDrive/Documents/Repositorio_Maestro/scripts/extract_cnd_unifilar_sen2025.py) (Totalmente reproducible e idempotente).

---

## 8. Recomendaciones para el Visor Dedicado / Software Independiente

1. **Visor SVG / Canvas con Zoom Infinito:** Las coordenadas están normalizadas en el rango $[0, 5669] \times [0, 3146]$. Un componente tipo *Panzoom* o *Leaflet* con proyección no geográfica (CRS simple) puede desplegar este plano permitiendo zoom suave desde la vista de país hasta el detalle de una celda de transformación.
2. **Filtros por Nivel de Tensión:** Con las tablas `cnd_barras` y `cnd_lineas_tramos`, el usuario puede prender/apagar capas con un solo clic (ej. *Solo Red de 765 kV y 400 kV*).
3. **Cruce Futuro Controlado:** Cuando la GGPD autorice el cotejo con `core.mae_subestaciones`, se podrá ejecutar un script de homologación que vincule los códigos de subestación del CND con los activos de distribución de SIGAD sin riesgo de sobrescritura accidental.

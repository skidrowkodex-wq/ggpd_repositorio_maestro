# ⚡ GUÍA TÉCNICA Y REGLAS DE NEGOCIO PARA SPARK — SISTEMA SCEIN (EQUIPOS INDISPONIBLES SEN)
**MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE) / CORPOELEC**  
**GERENCIA GENERAL DE DISTRIBUCIÓN — GERENCIA DE GESTIÓN DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)**  
**Código Normativo:** `NAC_2026_GGPD_GUIA_SPARK_SCEIN_V01` | **Estándar:** `GGPD-SGM-INS-005 v3.0 ISO`

---

## 📌 1. Propósito y Alcance de la Automatización en Spark
Este documento establece las **reglas de negocio, algoritmos de validación, relaciones de catálogos maestros y especificaciones de ingesta** para que **Google Spark (Gemini Spark / Data Lake)** procese, audite, sanee y consolide de forma autónoma los archivos Excel (`.xlsx`) correspondientes al **Sistema de Seguimiento y Control de Equipos Indisponibles (SCEIN)** procedentes de las 25 entidades federales y del repositorio corporativo en Google Drive.

---

## 🏛️ 2. Arquitectura de Directorios en Google Drive

Los archivos de SCEIN residen en el árbol del Data Lake institucional en Google Drive bajo la siguiente ruta estandarizada:

```
📁 DATA_LAKE_GGPD_2026/
├── 📁 02_SCEIN_EQUIPOS_INDISPONIBLES/
│   ├── 📁 00_PLANTILLAS_OFICIALES/
│   │   ├── NAC_2026_GGPD_LEV_EI_SE_V01.xlsx (Plantilla Levantamiento)
│   │   └── NAC_2026_GGPD_PLA_EI_SE_V01.xlsx (Plantilla Plan de Atención)
│   ├── 📁 00_CATALOGOS_MAESTROS/
│   │   ├── CATALOGO_MAESTRO_SUBESTACIONES_SEN.xlsx (871 SEs)
│   │   ├── CATALOGO_MAESTRO_EQUIPOS_SCEIN.xlsx (Tipos y Componentes)
│   │   └── CATALOGO_MAESTRO_ESTADOS_REGIONES.xlsx (25 Entidades)
│   ├── 📁 [COD_ESTADO] (ej. TAC, ZUL, CAR, DCA, BOL...)/
│   │   ├── 📁 01_LEVANTAMIENTOS/       <- Archivos LEV_EI_SE subidos por analistas
│   │   ├── 📁 02_PLANES_ATENCION/      <- Archivos PLA_EI_SE subidos por analistas
│   │   └── 📁 03_REMEDIACION_CUARENTENA/ <- Planillas generadas con filas no conformes
│   └── 📁 99_CONSOLIDADO_NACIONAL/
│       ├── NAC_2026_GGPD_SCEIN_EQUIPOS_CONSOLIDADO_NORMALIZADO.xlsx
│       └── NAC_2026_GGPD_SCEIN_PLAN_EJECUCION_CONSOLIDADO.xlsx
```

---

## ⚙️ 3. Reglas de Negocio Específicas de SCEIN

### 🔹 Regla 1: Nomenclatura Estricta de Archivos (`GGPD-SGM-INS-005`)
Todo archivo ingresado debe validar el patrón canónico mediante Regex:
`^([A-Z]{3})_(202[0-9])_GGPD_(LEV_EI_SE|PLA_EI_SE)_(V[0-9]{2})\.xlsx$`

* **Códigos Geográficos Autorizados (26 códigos):**
  * `NAC` (Consolidado Nacional), `AMA` (Amazonas), `ANZ` (Anzoátegui), `APU` (Apure), `ARA` (Aragua), `BAR` (Barinas), `BOL` (Bolívar), `CAR` (Carabobo), `COJ` (Cojedes), `DEL` (Delta Amacuro), `DCA` (Distrito Capital), `FAL` (Falcón), `GUA` (Guárico), `LGU` (La Guaira), `LAR` (Lara), `MER` (Mérida), `MIR` (Miranda), `MON` (Monagas), `NES` (Nueva Esparta), `POR` (Portuguesa), `SUC` (Sucre), `TAC` (Táchira), `TRU` (Trujillo), `YAR` (Yaracuy), `ZUL` (Zulia), `GEQ` (Guayana Esequiba).
* **Acción Spark:** Si el nombre no coincide exactamente, Spark debe registrar advertencia de nomenclatura (`ERROR_NOMENCLATURA`), identificar el tipo por el contenido de las pestañas e inferir la entidad federada.

---

### 🔹 Regla 2: Tratamiento Dual Multi-Plantilla (LEV vs PLA)

SCEIN opera con **dos instrumentos operativos complementarios**:

#### **Tipo A: Plantilla `LEV_EI_SE` (Levantamiento Técnico de Equipos Fuera de Servicio)**
Contiene **dos (2) hojas operativas**:
1. **Hoja 1: `EQUIPOS INDISPONIBLES` (Grano: 1 fila = 1 Equipo Averiado / Fuera de Servicio)**
   * Columnas canónicas:
     * `Secuencia` (Numérico correlativo)
     * `Región` (`ANDES`, `CAPITAL`, `CENTRO`, `LLANOS`, `OCCIDENTE`, `ORIENTE`, `SUR`, `INSULAR`)
     * `Estado` (Código de 2 o 3 letras, ej: `TA`, `ZU`, `DC`)
     * `Subestación` (Nombre de la S/E -> Validar contra `CATALOGO_MAESTRO_SUBESTACIONES_SEN.xlsx`)
     * `Nivel kV` (Tensión en kV -> Validar contra catálogo `[765, 400, 230, 115, 34.5, 13.8, 4.16]`)
     * `Componente` (Código físico del equipo, ej: `TR-1`, `INT-115`, `SEC-230`, `TC-H1`)
     * `Tipo de Elemento` (Nombre estandarizado, ej: `Transformador de Potencia`, `Interruptor de Potencia SF6`)
     * `Especificaciones Técnicas` (Detalle de marca, capacidad MVA/Amp, relación)
     * `Acción Operativa` (`Reemplazo`, `Mantenimiento Mayor`, `Reparación`, `Sustitución por Punto Caliente`, etc.)
     * `Nomenclatura` (Código unívoco: `[EDO]-[SUBESTACION]-[COMPONENTE]`, ej: `TA-SAN-CRISTOBAL-TR1`)
     * `Estatus` (`PENDIENTE`, `EN EJECUCIÓN`, `RESUELTO`)
     * `Prioridad` (`ALTA`, `MEDIA`, `BAJA`)
     * `Unidad Medida` (`UN`, `PZA`, `JGO`)
     * `Cantidad` (Entero $\ge 1$)
     * `Fecha Programada` (Fecha ISO `YYYY-MM-DD`)

2. **Hoja 2: `MATERIALES REQUERIDOS` (Grano: 1 fila = 1 Insumo/Repuesto requerido por equipo)**
   * Columnas canónicas:
     * `Secuencia Equipo` (Llave foránea hacia `Secuencia` de la Hoja 1)
     * `Región`, `Estado`, `Subestación`, `Nivel kV`, `Componente`, `Tipo Elemento`
     * `Familia Material` (`AISLADORES`, `CONTACTOS`, `ACEITE DIELÉCTRICO`, `GAS SF6`, `MANDOS`, `RELÉS`, `CABLES`, `GENERAL`)
     * `Descripción del Material` (Texto descriptivo)
     * `Unidad` (`UN`, `PZA`, `LITROS`, `KG`, `METROS`, `JGO`)
     * `Precio Unitario EUR` (Monto unitario en €)
     * `Cantidad Requerida` (Cantidad numérica)
     * `Total EUR` (Cálculo exacto: `Cantidad Requerida * Precio Unitario EUR`)
     * `Estatus` (`PENDIENTE`, `APROBADO`, `EN ALMACÉN`, `DESPACHADO`)
     * `Prioridad` (`ALTA`, `MEDIA`, `BAJA`)

---

#### **Tipo B: Plantilla `PLA_EI_SE` (Plan de Atención, Inversión y Presupuesto)**
Contiene **dos (2) hojas operativas**:
1. **Hoja 1: `PLAN DE EJECUCIÓN` (Grano: 1 fila = 1 Línea de Proyecto / Inversión de Mantenimiento)**
   * Columnas canónicas:
     * `Secuencia Plan` (Numérico correlativo)
     * `Región`, `Estado`, `Subestación`
     * `Línea de Plan` (Código de proyecto, ej: `PLAN-REEMPLAZO-TR-01`)
     * `Acción Planificada` (Detalle de la obra o servicio mayor)
     * `Presupuesto Asignado EUR` (Monto en Euros $\ge 0$)
     * `Porcentaje Meta` (1 a 100%)
     * `Fecha Inicio` (Fecha ISO `YYYY-MM-DD`)
     * `Fecha Fin` (Fecha ISO `YYYY-MM-DD`)
     * `Responsable` (Ingeniero o División técnica a cargo)

2. **Hoja 2: `RESUMEN PRESUPUESTARIO` (Grano: Agrupación por Familia)**
   * Columnas: `Familia Componente`, `Proyectos Asignados`, `Total Presupuesto EUR`.

---

### 🔹 Regla 3: Deduplicación Semántica SHA-256 (ISO 8000)
Para evitar doble conteo o re-ingesta de fallas idénticas en subestaciones, Spark debe calcular por cada registro de equipo una **huella digital (Fingerprint) SHA-256**:

$$\text{Fingerprint} = \text{SHA256}(\text{ESTADO} \parallel \text{NOMBRE\_SE\_NORM} \parallel \text{NIVEL\_KV} \parallel \text{COMPONENTE} \parallel \text{NOMENCLATURA})$$

* Si la huella ya existe en el consolidado con estatus `PENDIENTE` o `EN EJECUCIÓN`, Spark actualiza los atributos (`Estatus`, `Avance %`, `Fecha`) preservando el historial, sin generar filas duplicadas.

---

### 🔹 Regla 4: Matriz de Validación y Segregación de Cuarentena (Remediación)
Toda fila del archivo Excel procesado debe ser evaluada en 3 ejes de calidad ISO 8000:

| Eje ISO 8000 | Criterio Evaluado por Spark | Acción si Falla |
| :--- | :--- | :--- |
| **Exhaustividad (40%)** | Campos obligatorios no nulos: `Subestación`, `Componente`, `Acción Operativa`, `Nomenclatura`. | Fila rechazada a Cuarentena con motivo `CAMPO_OBLIGATORIO_VACIO`. |
| **Consistencia (40%)** | `Nivel kV` debe ser numérico positivo. `Nomenclatura` en mayúsculas y sin caracteres ilegales. `Total EUR = Cantidad * Precio Unitario`. | Fila saneada automáticamente o enviada a Cuarentena si hay discrepancia grave. |
| **Catálogo (20%)** | `Subestación` debe coincidir con `CATALOGO_MAESTRO_SUBESTACIONES_SEN.xlsx`. `Nivel kV` $\in \{765, 400, 230, 115, 34.5, 13.8, 4.16\}$. | `NOMBRE_SUBESTACION` corregido por homología o marcado como `SE_NO_CATALOGADA`. |

* **Tratamiento de Filas Rechazadas:** Spark debe generar en la carpeta `03_REMEDIACION_CUARENTENA/` el archivo `[NOMBRE_ORIGINAL]_REMEDIACION_ISO8000.xlsx` agregando al final la columna `MOTIVO RECHAZO / NORMALIZACIÓN ISO 8000` con el detalle pedagógico del error para que el analista estadal lo corrija en 1 clic.

---

### 🔹 Regla 5: Cálculo del Índice de Calidad OTQR (ISO 8000)

$$\text{Score Quality (\%)} = (0.40 \times \text{Completitud}) + (0.40 \times \text{Consistencia}) + (0.20 \times \text{Catálogo})$$

* **Escala de Calificación:**
  * **A+ (95% - 100%):** Excelente calidad. Ingesta limpia automática.
  * **A (85% - 94%):** Calidad óptima con correcciones menores aplicadas.
  * **B (75% - 84%):** Calidad aceptable. Filas conformes ingresadas, segregación de cuarentena.
  * **C (60% - 74%):** Calidad deficiente. Requiere revisión del analista.
  * **D (< 60%):** Rechazo de lote completo.

---

## 🗂️ 4. Catálogos Maestros de Relación y Validación Disponibles

Los siguientes catálogos maestros generados se encuentran en `docs/catalogos_maestros_spark/` para el cruce de datos en Spark:

1. **`CATALOGO_MAESTRO_SUBESTACIONES_SEN.xlsx` (871 Subestaciones SEN):**
   * Llave primaria: `ID_ACTIVO_NORMALIZADO` (ej: `SE-TAC-0480`, `SE-ZUL-0810`, `SE-BOL-0001`).
   * Columnas de cruce: `ESTADO`, `NOMBRE_SUBESTACION`, `NOMBRE_SE_NORM`, `TENSION_ENTRADA_KV`, `TENSION_SECUNDARIA_KV`, `ES_MOVIL`.
2. **`CATALOGO_MAESTRO_EQUIPOS_SCEIN.xlsx` (Tipos y Componentes):**
   * Llaves: `ID_TIPO_EQUIPO` (`EQ-TR-01`, `EQ-INT-01`, `EQ-SEC-01`, `EQ-TC-01`, `EQ-TP-01`, `EQ-PA-01`, `EQ-CEL-01`, `EQ-SSAA-01`).
   * Columnas: `CATEGORIA_EQUIPO`, `NOMBRE_ELEMENTO_ESTANDAR`, `SIGLAS_COMPONENTE`, `NIVELES_KV_TIPICOS`, `ACCIONES_OPERATIVAS_HABITUALES`, `CRITICIDAD_DEFECTO`.
3. **`CATALOGO_MAESTRO_ESTADOS_REGIONES.xlsx` (25 Entidades Federales):**
   * Llave: `COD_ESTADO_2` (`TA`, `ZU`, `DC`, etc.) / `COD_ESTADO_3` (`TAC`, `ZUL`, `DCA`, etc.).
   * Columnas: `NOMBRE_ESTADO`, `REGION_OPERATIVA`, `TOTAL_SUBESTACIONES`, `TOTAL_CIRCUITOS`.
4. **Catálogo de Niveles de Tensión Oficiales SEN:**
   * Valores discretos permitidos: `765`, `400`, `230`, `115`, `34.5`, `13.8`, `4.16` (en kV).

---

## 🔄 5. Diccionario Universal de Sinónimos de Cabeceras (Tolerancia a Variaciones Estadales)

Spark debe utilizar el siguiente mapeo para estandarizar cabeceras con variaciones tipográficas o formatos locales:

```json
{
  "SUBESTACION": ["SUBESTACION", "SUBESTACIÓN", "S/E", "SE", "SUB ESTACION", "NOMBRE DE SUBESTACION", "SUBESTACION ELECTRICA"],
  "NIVEL_KV": ["NIVEL KV", "TENSIÓN (KV)", "TENSION (KV)", "TENSION KV", "VOLTAGE_KV", "KV", "NIVEL DE TENSION", "VOLTAJE"],
  "COMPONENTE": ["COMPONENTE", "EQUIPO_COD", "CODIGO COMPONENTE", "TAG COMPONENTE", "ID COMPONENTE", "POSICION"],
  "ELEMENTO": ["TIPO DE ELEMENTO", "ELEMENTO", "TIPO ELEMENTO", "EQUIPO", "DESCRIPCION EQUIPO"],
  "ACCION": ["ACCIÓN OPERATIVA", "ACCION OPERATIVA", "ACCION", "ACCIÓN", "TRABAJO REQUERIDO", "ACTIVIDAD PROPUESTA"],
  "NOMENCLATURA": ["NOMENCLATURA", "CODIGO", "CÓDIGO", "NOMENCLADOR", "TAG", "IDENTIFICADOR"],
  "ESTATUS": ["ESTATUS", "ESTADO OPERATIVO", "CONDICION", "SITUACION", "STATUS"],
  "PRIORIDAD": ["PRIORIDAD", "CRITICIDAD", "NIVEL PRIORIDAD", "URGENCIA"],
  "CANTIDAD": ["CANTIDAD", "CANT", "QTY", "CANTIDAD REQUERIDA", "TOTAL EQUIPOS"],
  "PRECIO_EUR": ["PRECIO UNITARIO EUR", "PRECIO EUR", "COSTO UNITARIO EUR", "MONTO EUR", "COSTO EUR"],
  "PRESUPUESTO_EUR": ["PRESUPUESTO ASIGNADO EUR", "PRESUPUESTO EUR", "MONTO ASIGNADO EUR", "MONTO PRESUPUESTADO EUR"]
}
```

---

## 📊 6. Estructura del Consolidado Final Generado por Spark

Spark debe consolidar y entregar en `docs/catalogos_maestros_spark/` y en Google Drive el archivo:
📄 **`NAC_2026_GGPD_SCEIN_EQUIPOS_CONSOLIDADO_NORMALIZADO.xlsx`**

### **Hoja 1: `RESUMEN_EJECUTIVO`**
* Indicadores clave nacionales:
  * Total Equipos Indisponibles Nacional.
  * Desglose por Estatus (`PENDIENTE`, `EN EJECUCIÓN`, `RESUELTO`).
  * Desglose por Criticidad (`ALTA`, `MEDIA`, `BAJA`).
  * Inversión Total Estimada en Euros (€).
  * Matriz consolidada por los 25 Estados y 8 Regiones Operativas.

### **Hoja 2: `EQUIPOS_INDISPONIBLES_NACIONAL`**
* Tabla plana y normalizada con el 100% de los equipos reportados, vinculados a su `ID_ACTIVO_NORMALIZADO` de Subestación, con huella SHA-256 y score de calidad ISO 8000.

### **Hoja 3: `MATERIALES_CONSOLIDADOS`**
* Requerimientos de insumos, repuestos y presupuesto desglosado por familia y fabricante.

### **Hoja 4: `PLAN_INVERSION_PO`**
* Consolidado de metas y cronogramas de atención por subestación y estado.

---

## 🚀 7. Instrucción Operativa de Ejecución para Gemini Spark

Para ejecutar la normalización de SCEIN en Spark, sigue el siguiente flujo de procesamiento:

1. **Escanear** el directorio de Google Drive `02_SCEIN_EQUIPOS_INDISPONIBLES/` recorriendo las carpetas de los 25 estados.
2. **Clasificar** cada archivo en `LEV_EI_SE` o `PLA_EI_SE`.
3. **Mapear** cabeceras utilizando el Diccionario Universal de Sinónimos.
4. **Cruzar** los nombres de Subestación contra `CATALOGO_MAESTRO_SUBESTACIONES_SEN.xlsx` y normalizar tensiones contra `VOLTAGE_LEVELS_KV`.
5. **Calcular** la huella `Fingerprint SHA-256` y verificar duplicidad.
6. **Segregar** registros no conformes generando la planilla `[ORIGINAL]_REMEDIACION_ISO8000.xlsx` en `03_REMEDIACION_CUARENTENA/`.
7. **Consolidar** registros limpios en `NAC_2026_GGPD_SCEIN_EQUIPOS_CONSOLIDADO_NORMALIZADO.xlsx`.
8. **Calcular y Registrar** el reporte de calidad OTQR (ISO 8000) por estado.

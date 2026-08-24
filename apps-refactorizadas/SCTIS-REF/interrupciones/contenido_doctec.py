"""Contenido del DOCUMENTO TÉCNICO SCTIS — Arquitectura y Flujos de Proceso."""

TITULO = "DOCUMENTO TÉCNICO\nARQUITECTURA Y FLUJOS DE PROCESO"
SUBTITULO = "Sistema de Gestión de Tiras de Interrupción Eléctrica"
SISTEMA = "SCTIS v1.0"
DOC_CODIGO = "SCTIS-DOCTEC-001"
FECHA = "Agosto 2026"

CAUSAS = [
    ("1", "ACCIDENTAL", "Accidental"),
    ("2", "APERTURA_EMERGENCIA", "Apertura por Emergencia"),
    ("3", "ATMOSFERICA", "Atmosférica"),
    ("4", "ATRIBUIBLE_MANTENIMIENTO", "Atribuible a Mantenimiento"),
    ("5", "ATRIBUIBLE_COORD_PROT", "Atribuible a Coordinación de Protecciones"),
    ("6", "BAJA_TENSION", "Baja Tensión"),
    ("7", "COMPONENTE_DANADO", "Componente Dañado"),
    ("8", "ERROR_OPERACIONES", "Error de Operaciones"),
    ("9", "FALLA_EQUIPOS", "Falla de Equipos"),
    ("10", "FALLA_LINEA_115KV", "Falla en Línea ≥ 115 KV"),
    ("11", "MANIOBRA_MT", "Maniobra en Línea MT"),
    ("12", "OTRAS", "Otras"),
    ("13", "POR_TERCEROS", "Por Terceros"),
    ("14", "PROGRAMADA", "Programada"),
    ("15", "RACIONAMIENTO", "Racionamiento"),
    ("16", "SOBRECARGA", "Sobrecarga"),
    ("17", "SIN_TENSION_SE", "Sin Tensión S/E"),
    ("18", "SOBRECORRIENTE_FASE", "Sobrecorriente en Fase"),
    ("19", "SOBRECORRIENTE_NEUTRO", "Sobrecorriente en el Neutro"),
    ("20", "SOBRECORRIENTE_FASE_NEUTRO", "Sobrecorriente en Fase y Neutro"),
    ("21", "VEGETACION", "Vegetación"),
    ("22", "PAC", "PAC (Programación de Adecuación de Carga)"),
]

SUBCAUSAS = [
    ("1", "7", "Línea Rota en MT"),
    ("2", "7", "Puente Roto en MT"),
    ("3", "7", "Punto Roto en MT"),
    ("4", "14", "Poda (Control de Vegetación)"),
    ("5", "14", "Mantenimiento Programado Tipo Poda"),
    ("6", "3", "Descarga Atmosférica"),
    ("7", "3", "Fuertes Lluvias en la Zona"),
    ("8", "21", "Rama sobre Líneas de MT"),
    ("9", "13", "Terceros podando árbol"),
    ("10", "12", "Causa Desconocida"),
    ("11", "1", "Impacto de Ave sobre Líneas de MT"),
    ("12", "7", "Punto Caliente"),
    ("13", "4", "Ajuste de Tornillería"),
    ("14", "7", "Reemplazo de Cortacorriente"),
]

FORMATOS = [
    ("TIRAS", "Formato TIRAS Estándar", "Multi-estado", "Formato homologado base (21 columnas)"),
    ("F328", "Formato F328 — Sistema Eléctrico", "Multi-estado", "Formato oficial F328 del sistema eléctrico"),
    ("ANZOATEGUI", "Formato Anzoátegui / Nesparta", "ANZOÁTEGUI", "Formato propietario del estado (convertido vía script)"),
    ("CARABOBO", "Formato Carabobo", "CARABOBO", "Formato propietario del estado"),
    ("CAPITAL", "Formato Capital", "DISTRITO CAPITAL", "Formato propietario del Distrito Capital"),
    ("GUARICO_1", "Formato Guárico (Variante 1)", "GUÁRICO", "Variante 1 del estado Guárico"),
    ("GUARICO_2", "Formato Guárico (Variante 2)", "GUÁRICO", "Variante 2 del estado Guárico"),
    ("LARA", "Formato Lara", "LARA", "Formato propietario del estado"),
    ("MIRANDA_TUY", "Formato Miranda Tuy Barlovento", "MIRANDA", "Formato propietario de Miranda (Tuy/Barlovento)"),
    ("YARACUY", "Formato Yaracuy", "YARACUY", "Formato propietario del estado"),
    ("ZULIA", "Formato Zulia", "ZULIA", "Formato propietario del estado"),
]

BLOCKS = [
    ("h1", "1. Objeto y Alcance"),
    ("p", "El presente documento técnico describe la arquitectura, el modelo de datos y los flujos de proceso del Sistema de Gestión de Tiras de Interrupción Eléctrica (SCTIS) v1.0, desarrollado por la Gerencia General de Distribución de CORPOELEC en colaboración con la Unidad de Servicios de Automatización de Procesos de Distribución.\n\nEl sistema automatiza la carga de tiras de interrupción desde archivos Excel, homologa las causas reportadas por cada estado contra el catálogo oficial de causas, aplica controles de calidad de datos alineados con ISO 8000, genera auditoría completa de cada carga y provee tableros de control para seguimiento. El alcance funcional cubre los estados operadores que reportan a la Gerencia de Gestión de Planificación de Distribución."),

    ("h1", "2. Referencias Normativas"),
    ("table",
     ["Referencia", "Descripción"],
     [
         ["ISO 9001:2015", "Sistemas de gestión de la calidad — enfoque de procesos y mejora continua"],
         ["ISO 27001:2022", "Seguridad de la información — autenticación, autorización y trazabilidad"],
         ["ISO 8000-100", "Calidad de datos — principios de gestión y evaluación de la calidad de datos maestros"],
         ["ISO 8000-150", "Calidad de datos — evaluación de la calidad de datos maestros"],
         ["Marco eléctrico venezolano", "Normas internas CORPOELEC y MPPEE para reportes de interrupciones de servicio"],
     ]),

    ("h1", "3. Términos y Definiciones"),
    ("glossary", [
        ("Tira de interrupción", "Registro de un evento de interrupción de servicio eléctrico con datos de subestación, circuito, fechas, causa, duración y energía no suministrada."),
        ("TTI", "Tiempo Total de Interrupción, energía no suministrada durante el evento (MWh)."),
        ("Causa homologada", "Causa asignada a uno de los códigos oficiales del catálogo sctis.causa."),
        ("Activo", "Subestación o circuito registrado en el inventario CORPOELEC (common.assets)."),
        ("Formato homologado", "Plantilla Excel oficial de 21 columnas (Formato TIRAS Estándar) que deben usar los estados."),
        ("Catálogo de formatos", "Tabla sctis.formato_catalogo que registra 11 formatos por estado y sus reglas de parseo."),
        ("RLS", "Row Level Security. Mecanismo de PostgreSQL que restringe filas visibles por usuario."),
        ("Scoring ISO 8000", "Puntaje de calidad (0-100) de cada registro según 9 reglas de evaluación automática."),
        ("Homologación", "Proceso de mapear una causa reportada por un estado a una causa oficial del catálogo."),
        ("HojaMemoria", "Wrapper de openpyxl en modo read_only que optimiza el parseo de hojas grandes."),
        ("Alias de activo", "Sinónimo aprendido: nombre fuera de norma que el sistema resuelve automáticamente a un activo del catálogo (sctis.asset_alias)."),
        ("Cola de revisión de activos", "Bandeja de solicitudes de SE/CT reportados fuera de catálogo que requieren aprobación del administrador (sctis.asset_request)."),
        ("Backfill", "Actualización retroactiva de tiras ya cargadas para vincular su subestación/circuito al activo aprobado."),
    ]),

    ("pagebreak",),

    ("h1", "4. Arquitectura del Sistema"),
    ("h2", "4.1. Arquitectura general"),
    ("flow", [
        ("FRONTEND", "HTML · Vue.js 3 · Tailwind CSS · Chart.js · Plotly.js"),
        ("BACKEND", "Flask (Python 3) · API REST · Wizard de importación"),
        ("BASE DE DATOS", "PostgreSQL 17 · esquemas common/sctis/audit · RLS"),
        ("INTELIGENCIA ARTIFICIAL", "Google Gemini (gemini-2.5-flash) · causa, calidad, duplicados"),
        ("DESPLIEGUE", "Vercel Serverless Functions · alternativo Cloud Run/Docker"),
    ]),
    ("p", "La aplicación sigue una arquitectura de tres capas con una capa transversal de inteligencia artificial. El frontend consume endpoints REST JSON expuestos por Flask. La capa de datos está organizada en tres esquemas PostgreSQL: common (datos maestros compartidos), sctis (datos del sistema de interrupciones) y audit (auditoría y calidad). La capa de IA interviene en la homologación de causas, la evaluación de calidad y la detección de duplicados."),

    ("h2", "4.2. Stack tecnológico"),
    ("table",
     ["Capa", "Tecnología", "Versión", "Propósito"],
     [
         ["Lenguaje", "Python", "3.x", "Backend y scripts de conversión"],
         ["Framework web", "Flask", "2.x", "API REST y renderizado de plantillas"],
         ["Base de datos", "PostgreSQL", "17", "Persistencia con esquemas common/sctis/audit"],
         ["Cloud DB (objetivo)", "Supabase", "-", "PostgreSQL gestionado en la nube"],
         ["IA", "Google Gemini", "gemini-2.5-flash", "Homologación, calidad y duplicados"],
         ["Frontend", "Vue.js 3", "3.x", "Interactividad del wizard y formularios"],
         ["Estilos", "Tailwind CSS", "3.x", "Diseño de interfaz"],
         ["Gráficos", "Chart.js · Plotly.js", "-", "Dashboard y diagrama Sankey"],
         ["Parseo Excel", "openpyxl", "3.x", "Lectura de archivos .xlsx (modo read_only)"],
         ["Despliegue", "Vercel / Docker", "-", "Serverless Functions / contenedor"],
     ]),

    ("h2", "4.3. Esquema de base de datos"),
    ("p", "El sistema utiliza PostgreSQL 17 con tres esquemas principales."),
    ("bullets", [
        "common — datos maestros: states (estados), assets (subestaciones y circuitos, inventario CORPOELEC), process_codes.",
        "sctis — datos del sistema: tira_interrupcion (tabla principal), causa (22 causas oficiales), sub_causa (14 sub-causas), formato_catalogo (11 formatos), tarea_pendiente, asset_alias (diccionario aprendido de sinónimos SE/CT), asset_request (cola de revisión de activos nuevos), user_profiles, user_roles, despachador, tipo_operacion, duplicate_groups, duplicate_members, data_quality_rules.",
        "audit — auditoría y calidad: submissions (registro de cada carga), access_log, change_log, data_issues, quality_metrics.",
    ]),
    ("p", "Las tablas transaccionales incluyen claves foráneas (FK) e índices. common.assets usa parent_asset_id para la jerarquía subestación → circuito. Todas las tablas tienen timestamps de creación y modificación en zona horaria America/Caracas."),

    ("h2", "4.4. Seguridad"),
    ("bullets", [
        "Autenticación por sesión Flask con contraseña hasheada.",
        "Bloqueo por 5 intentos fallidos durante 30 minutos.",
        "Autorización por roles: admin (acceso total) y editor (solo su estado asignado).",
        "Row Level Security (RLS) en PostgreSQL: filtro de filas por estado a nivel de BD, no solo visual.",
        "Trazabilidad completa: cada acceso y cada carga queda registrada en audit.",
        "Configuración centralizada de secretos vía variables de entorno (Vercel @secret).",
    ]),

    ("pagebreak",),

    ("h1", "5. Flujos de Proceso"),
    ("h2", "5.1. Flujo de Importación Excel (Wizard de 3 pasos)"),
    ("flow", [
        ("PASO 1", "Subir archivo · seleccionar estado (admin) · elegir hoja si multi-hoja"),
        ("PASO 2", "Detectar formato · validar estructura · parsear · homologar causas · resolver activos"),
        ("PASO 3", "Previsualizar · confirmar · insertar en BD · auditar"),
    ]),
    ("p", "El flujo de importación es el proceso central del sistema. Consta de 3 pasos en la interfaz: subida, previsualización y confirmación. Internamente, la fase de previsualización ejecuta: detección de formato, validación de estructura, parseo de la hoja seleccionada, detección de activos inconsistentes y homologación de causas."),

    ("h3", "5.1.1. Subida del archivo"),
    ("p", "El usuario accede a 'Importar' y sube un archivo Excel (.xlsx). Si el archivo tiene varias hojas visibles, el sistema devuelve requires_sheet_selection con la lista de hojas y un token de sesión; el usuario debe seleccionar UNA sola hoja. No se cargan múltiples hojas: el responsable debe consolidar sus reportes en una sola hoja antes de subir. Esta decisión fue tomada deliberadamente para evitar cargas parciales sin control."),
    ("tech", "La subida genera un token UUID y guarda el archivo en /tmp/sctis_imports. Si hay varias hojas visibles se pide selección; en caso contrario se usa la primera hoja visible.", "NOTA TÉCNICA"),

    ("h3", "5.1.2. Detección y validación de formato"),
    ("p", "El sistema primero intenta validar la estructura contra la plantilla oficial (HEADERS_FORMATO_ESPERADOS). Si la estructura no coincide, consulta el catálogo sctis.formato_catalogo: filtra los formatos del estado del usuario (o el estado seleccionado por el admin) y compara las palabras clave de encabezado (header_keywords). El formato con mayor coincidencia (ratio ≥ 0.6) gana. Si no hay coincidencia, el archivo se rechaza con mensaje de formato no reconocido."),
    ("branch",
     "Resolución de formato:",
     ["Coincidencia con formato de catálogo → se aplica su mapeo_columnas y reglas de parseo"],
     ["Sin coincidencia → rechazo 422 con instructivo de corrección"],
     "Formato de catálogo", "Formato inválido"),

    ("h3", "5.1.3. Parseo y normalización"),
    ("p", "El parseo se realiza con openpyxl en modo read_only (data_only=True) a través del wrapper HojaMemoria, que resuelve el acceso por fila ws[row_idx] y los atributos max_row/max_column. Este wrapper redujo el tiempo de parseo de la hoja CARABOBO (6351×63 celdas) de ~100 segundos a ~6 segundos. Los valores se normalizan: fechas/horas se combinan en timestamps, la fecha de falla se deriva de la fecha de inicio, y los campos vacíos se limpian a NULL."),

    ("h3", "5.1.4. Homologación de causas"),
    ("p", "Cada causa original reportada por el estado se normaliza (mayúsculas, sin acentos) y se mapea a una de las 22 causas oficiales de sctis.causa. El mapeo lo define el usuario en el paso de previsualización (campo mapping). El sistema sugiere la causa oficial más cercana, incluyendo sugerencias generadas por IA (Google Gemini) cuando hay ambigüedad."),

    ("h3", "5.1.5. Resolución de activos inconsistentes"),
    ("p", "El sistema cruza cada par (subestación, circuito) contra common.assets del estado. Los activos que no coinciden se listan con sugerencias de emparejamiento y una preclasificación automática (probable typo, posible alias o probable activo nuevo). Para cada uno, el usuario puede tomar una de dos rutas:"),
    ("bullets", [
        "Mapear el nombre original a un activo existente del catálogo: el sistema guarda el par (nombre reportado → activo) en el diccionario sctis.asset_alias. En cargas futuras ese nombre se resuelve automáticamente, sin volver a preguntar. Es el mecanismo de aprendizaje del sistema, por estado y por tipo de activo.",
        "Reportar el activo como nuevo ('no está en catálogo'): se crea una solicitud en sctis.asset_request, la tira se ingresa con el nombre libre (subestacion_id/circuito_id en NULL) y queda pendiente de revisión del administrador. La resolución es en cascada: primero subestaciones, luego circuitos.",
    ]),
    ("p", "Los nombres se normalizan para matching (elimina voltajes, paréntesis, numerales romanos y sufijos numéricos). La preclasificación usa un comparador difuso (difflib) con umbrales de similitud: ratio ≥ 0.85 → probable typo; ≥ 0.60 → posible alias; en caso contrario → probable activo nuevo."),

    ("h3", "5.1.6. Confirmación e inserción"),
    ("p", "Tras la previsualización, el usuario confirma la importación. El sistema recorre las filas de la hoja seleccionada, inserta cada registro en sctis.tira_interrupcion (resolviendo activos y despachadores), y cuenta insertados vs. rechazados. Los registros rechazados se recogen con el motivo del error por fila."),

    ("h2", "5.2. Flujo de Auditoría de Cargas"),
    ("flow", [
        ("PREVIEW", "Inserta audit.submissions (PENDING) con formato, hoja, filas, usuario"),
        ("CONFIRMAR", "Actualiza accepted_count / rejected_count y validation_status"),
        ("¿RECHAZADOS?", "validation_status = VALIDATED (0) o PARTIAL (>0)"),
        ("CORREGIR", "Crea sctis.tarea_pendiente CORREGIR_DATOS + genera Excel de corrección"),
    ]),
    ("p", "Cada importación queda registrada en audit.submissions: process_code (sctis_import), estado, nombre de archivo, hoja seleccionada, hojas del libro, cantidad de filas, estado de validación, formato detectado y usuario que ingirió los datos. Cuando hay rechazados, se crea una tarea pendiente de tipo CORREGIR_DATOS asociada a la submission y se genera un archivo Excel de corrección con los registros rechazados."),
    ("tech", "common.process_codes contiene el proceso 'sctis_import' (minúsculas, requerido por el check constraint de lowercase).", "NOTA TÉCNICA"),

    ("h2", "5.3. Flujo de Control de Calidad (ISO 8000)"),
    ("p", "El trigger trg_tira_quality evalúa cada registro con 9 reglas de calidad (completitud, consistencia, precisión) y asigna un scoring 0-100. Los resultados se almacenan en record_quality_scores. La detección de duplicados (trg_tira_duplicate_check) identifica registros repetidos tras el INSERT usando combinaciones de fecha + circuito + hora. El trigger trg_set_mes auto-computa el campo mes desde fecha_falla."),
    ("table",
     ["Regla", "Descripción"],
     [
         ["Completitud", "Campos obligatorios no nulos (subestación, circuito, fecha, causa)"],
         ["Consistencia", "Coherencia entre fechas (inicio ≤ fin) y duraciones"],
         ["Precisión", "Valores numéricos en rango y formato esperado"],
         ["Integridad referencial", "FKs válidas: estado, subestación, circuito, causa, despachador"],
         ["Detalle de causa", "Causa no genérica sin sub-causa complementaria"],
         ["Observaciones", "Registros con observaciones relevantes"],
         ["Duplicados", "No repetición de evento (fecha + circuito + hora)"],
         ["Duración", "Coherencia entre duración reportada y horas calculadas"],
         ["Mes", "Campo mes auto-computado conforme a fecha_falla"],
     ]),

    ("h2", "5.4. Flujo de Dashboard y API de Datos"),
    ("p", "El dashboard (/dashboard) ofrece 4 perspectivas expertas: Ingeniero Eléctrico, Mantenimiento, Project Manager y Data Scientist. La API /api/dashboard expone 13 secciones de datos: causas, horas, tendencia, sistema, desglose OTRAS (Sankey), circuitos, subestaciones, estados, horario, calidad, entre otros. Los gráficos (Chart.js y Plotly.js) se pueden descargar como PNG."),

    ("h2", "5.5. Flujo de Tareas Pendientes"),
    ("p", "Las tareas pendientes (sctis.tarea_pendiente) gestionan el seguimiento de acciones. Hay dos tipos: CORREGIR_DATOS (cuando una carga tiene rechazados, se genera un Excel de corrección) y APROBAR_ACTIVO (cuando se reportan SE/CT nuevos que requieren revisión del administrador). En ambos casos la tarea nace en estado PENDIENTE, se lista en /admin/tareas y se completa o cancela desde el panel de administración."),

    ("h2", "5.6. Flujo de Aprendizaje del Diccionario de Activos (ISO 8000-110)"),
    ("flow", [
        ("DETECTAR", "Nombre fuera de norma identificado en la carga"),
        ("MAPEAR", "Usuario selecciona el activo oficial de referencia"),
        ("GUARDAR", "sctis.asset_alias registra el sinónimo por estado y tipo"),
        ("RESOLVER", "Cargas futuras resuelven automáticamente el nombre"),
    ]),
    ("p", "El diccionario de alias sctis.asset_alias materializa el principio ISO 8000-110 de 'identificador único por entidad': un mismo activo físico tiene un único registro maestro en common.assets, y todos los nombres reportados fuera de norma se remiten a él mediante sinónimos. La tabla guarda estado, tipo (SUBSTATION/CIRCUITO), nombre reportado, subestación de referencia (para circuitos), el activo destino y el usuario que lo definió. Un índice único (estado, tipo, nombre, se_referencia) evita sinónimos duplicados."),
    ("tech", "sctis.asset_alias se consulta en detectar_activos_inconsistentes antes del matching difuso y en confirmar_import durante la inserción. Los alias se registran automáticamente cuando el usuario mapea en la previsualización o cuando el administrador aprueba/asigna alias en la bandeja.", "NOTA TÉCNICA"),

    ("h2", "5.7. Flujo de Revisión y Aprobación de Activos Nuevos (Control de Cambios)"),
    ("flow", [
        ("ENCUADRAR", "SE/CT reportado como nuevo se inserta en sctis.asset_request (PENDIENTE)"),
        ("PRE-CLASIFICAR", "El sistema sugiere probable typo, alias o activo nuevo con activo candidato"),
        ("SUPERVISAR", "El administrador revisa la bandeja /admin/activos y decide"),
        ("DECIDIR", "Aprobar (crea activo + backfill + alias) · Es alias · Corregir · Rechazar"),
        ("RESOLVER", "Las tiras previas se vinculan (backfill) y las futuras se resuelven solas"),
    ]),
    ("p", "Las solicitudes de activos nuevos (sctis.asset_request) se someten a un control de cambios gobernado: solo el administrador materializa SE/CT en common.assets. Cada solicitud registra estado, tipo, nombre reportado, nombre canónico sugerido, subestación de referencia, filas afectadas, clasificación automática, activo sugerido, submission de origen y usuario solicitante. Al decidir se registran decided_by, decided_at y comentario (trazabilidad ISO 27001). Se crea una tarea pendiente APROBAR_ACTIVO para que la supervisión no quede en el aire; la tarea se completa automáticamente cuando no quedan solicitudes pendientes del estado."),
    ("table",
     ["Decisión", "Acción del sistema", "Efecto"],
     [
         ["Aprobar", "Crea el activo en common.assets (nombre normalizado, código y parent correctos)", "Backfill de tiras previas + alias automático para cargas futuras"],
         ["Es alias", "Vincula el nombre reportado a un activo existente (sctis.asset_alias)", "Renombrados y nombres viejos resueltos sin duplicar el catálogo"],
         ["Corregir", "Ajusta el nombre canónico sugerido antes de aprobar", "Evita tipeos y normaliza el nombre en catálogo"],
         ["Rechazar", "Marca RECHAZADO con comentario", "El nombre queda sin resolver y visible en reportes"],
     ]),
    ("p", "Con esta separación en dos zonas —ingestión de datos (no bloqueada) y gobierno del catálogo (supervisado)— se aplica el enfoque de procesos de ISO 9001:2015: el catálogo maestro se modifica únicamente mediante un procedimiento controlado, con evidencia y trazabilidad de cada decisión."),

    ("h2", "5.8. Flujo del Módulo de Monitoreo de Cargas y Matriz de Seguimiento"),
    ("flow", [
        ("CROSS-QUERY", "Consulta audit.submissions + sctis.audit_admin_carga_excepcional + sctis.tira_interrupcion"),
        ("CONSOLIDAR", "Obtiene última fecha de carga y totales por cada uno de los 24 estados"),
        ("EVALUAR", "Aplica métricas: Semanal (dias <= 4) y Mensual (dias <= 25 ó dia_mes <= 3)"),
        ("ALERTA & TAREAS", "Clasifica estados + genera listas de faltantes + emisión de tareas directas"),
    ]),
    ("p", "El endpoint `/api/admin/monitoreo-cargas/matriz` calcula en tiempo real el estado de cumplimiento de los 24 estados de Venezuela. Para garantizar una métrica fidedigna, consolida la última interacción registrada cruzando tres tablas:"),
    ("bullets", [
        "audit.submissions: Registros de importación de archivos subidos por operadores.",
        "sctis.audit_admin_carga_excepcional: Cargas de emergencia o correcciones excepcionales ejecutadas por administración.",
        "sctis.tira_interrupcion: Registros directos de eventos asociados a cada estado.",
    ]),
    ("table",
     ["Frecuencia", "Condición Algorítmica", "Estado Asignado", "Acción de Control"],
     [
         ["Semanal", "dias_desde_carga <= 4", "AL_DIA", "Carga dentro del ciclo semanal."],
         ["Semanal", "dia_semana en (Mié, Jue) y dias_desde_carga > 4", "EN_RIESGO", "Alerta: Carga Requerida Hoy."],
         ["Semanal", "dias_desde_carga > 4", "MOROSO", "Falta Carga Semanal → Incluye en lista de faltantes semanal."],
         ["Mensual", "dias_desde_carga <= 25", "AL_DIA", "Consolidado al día."],
         ["Mensual", "dia_mes <= 3", "EN_RIESGO", "En Plazo Mensual (Ventana abierta hasta el 3)."],
         ["Mensual", "dias_desde_carga > 25 y dia_mes > 3", "MOROSO", "Falta Consolidado Mensual → Incluye en lista de faltantes mensual."],
     ]),
    ("p", "Desde la matriz de control, el administrador puede accionar el botón 'Solicitar' que invoca la creación de una tarea en `sctis.tarea_pendiente` (tipos `SOLICITUD_CARGA_SEMANAL` o `SOLICITUD_CONSOLIDADO_MENSUAL`) asignada al usuario del estado con un plazo límite (24h ó 48h) de respuesta formal."),

    ("pagebreak",),

    ("h1", "6. Modelo de Datos Detallado"),
    ("h2", "6.1. Tabla principal: sctis.tira_interrupcion"),
    ("table",
     ["Columna", "Tipo", "Descripción"],
     [
         ["tira_id", "serial PK", "Identificador del registro"],
         ["estado_codigo", "text FK", "Estado (common.states)"],
         ["fecha_falla", "date", "Fecha de la falla (derivada de fecha inicio)"],
         ["mes", "text", "Mes auto-computado por trg_set_mes (ej: ENERO)"],
         ["sistema", "text", "Sistema eléctrico (distribución, transmisión)"],
         ["subestacion / subestacion_id", "text / FK", "Subestación y referencia a common.assets"],
         ["circuito / circuito_id", "text / FK", "Circuito y referencia a common.assets"],
         ["fecha_inicio / fecha_fin", "timestamp", "Inicio y fin del evento (combinados fecha+hora)"],
         ["causa / sub_causa", "text", "Causa original y sub-causa reportadas"],
         ["causa_id", "int FK", "Causa homologada (sctis.causa)"],
         ["despachador / despachador_id", "text / FK", "Despachador y referencia"],
         ["kva / horas", "numeric", "Potencia afectada y horas de interrupción"],
         ["duracion_calculada / horas_calculadas", "numeric", "Campos calculados automáticamente"],
         ["sectores / ciudad / observacion", "text", "Información complementaria"],
         ["created_by", "text", "Origen del registro (importacion_excel, formulario)"],
     ]),

    ("h2", "6.2. Catálogos y auditoría"),
    ("table",
     ["Tabla", "Esquema", "Descripción"],
     [
         ["sctis.causa", "sctis", "22 causas oficiales (causa_id, causa_codigo, causa_nombre)"],
         ["sctis.sub_causa", "sctis", "14 sub-causas asociadas a causas"],
         ["sctis.formato_catalogo", "sctis", "11 formatos con header_keywords, header_row, data_start_row, mapeo_columnas (jsonb), reglas"],
         ["sctis.tarea_pendiente", "sctis", "Tareas CORREGIR_DATOS y APROBAR_ACTIVO con estado, conteos y archivo de corrección"],
         ["sctis.asset_alias", "sctis", "Diccionario aprendido de sinónimos SE/CT por estado (nombre fuera de norma → activo)"],
         ["sctis.asset_request", "sctis", "Cola de revisión de activos nuevos con clasificación, decisiones y trazabilidad"],
         ["common.states", "common", "Catálogo de estados (24 registros)"],
         ["common.assets", "common", "Inventario: ~4.311 CT y ~838 SE activas"],
         ["common.process_codes", "common", "Códigos de proceso: sctis_import (lowercase)"],
         ["audit.submissions", "audit", "Registro de cada carga (PENDING/VALIDATED/PARTIAL)"],
         ["audit.data_issues", "audit", "Incidencia de calidad por registro"],
         ["sctis.record_quality_scores", "sctis", "Scores ISO 8000 por registro"],
         ["sctis.duplicate_groups / duplicate_members", "sctis", "Grupos de duplicados detectados"],
     ]),

    ("pagebreak",),

    ("h1", "7. Integración con Inteligencia Artificial"),
    ("p", "El sistema integra Google Gemini (modelo gemini-2.5-flash) como capa de IA transversal, activa cuando GEMINI_API_KEY está configurada. Sus funciones son:"),
    ("bullets", [
        "suggest_cause / suggest-causes-batch: homologa causas originales a las 22 oficiales con confianza (0-1) y justificación JSON.",
        "evaluate_quality_with_ai: evalúa calidad ISO 8000 de un registro (score 0-100, issues, suggestions).",
        "detect_duplicates_with_ai: analiza pares de registros para detectar duplicados potenciales.",
    ]),
    ("tech", "El acceso a Gemini usa el paquete google-genai. La API key se configura en GEMINI_API_KEY (variable de entorno). Si no está disponible, el sistema degrada elegantemente al matching determinístico.", "NOTA TÉCNICA"),

    ("h1", "8. Configuración y Despliegue"),
    ("table",
     ["Entorno", "Detalle"],
     [
         ["Local", "run.py (puerto 8080), load_dotenv() carga .env, APP_DEBUG=false evita el watchdog reloader"],
         ["Vercel", "vercel.json mapea rutas; @vercel/python; entry point api/index.py con dispatch a todas las rutas Flask"],
         ["Cloud Run / Docker", "Dockerfile, cloudbuild.yaml y deploy.sh como alternativa"],
         ["Base de datos", "PostgreSQL en BD local (ggpd_se_cto_v1); objetivo Supabase en la nube"],
         ["Migraciones", "migraciones/001-009: esquema, catálogos, homologación, ISO, campos de cálculo, formato_catalogo, auditoría, asset_alias, asset_request"],
     ]),

    ("h1", "9. Desarrollo con IA y Próximas Fases"),
    ("p", "El desarrollo del sistema se realizó con asistencia de modelos de inteligencia artificial en todas sus etapas: análisis de formatos, diseño de esquema, generación de código, documentación y verificación. Esta sección da crédito a los modelos que han intervenido y describe las fases siguientes."),
    ("table",
     ["Modelo / Plataforma", "Rol"],
     [
         ["Google Gemini (gemini-2.5-flash)", "Integración IA en producción: homologación, calidad, duplicados"],
         ["Modelos de asistencia al desarrollo", "A completar por el equipo (se listarán los que han intervenido)"],
     ]),
    ("bullets", [
        "Migración a Google AI Studio: potenciar la capa de IA con capacidades generativas ampliadas (pendiente de aprobación).",
        "Migración de la base de datos a Supabase: PostgreSQL gestionado en la nube.",
        "Despliegue en Vercel: versión beta con variables de entorno como secretos.",
    ]),

    ("pagebreak",),

    ("h1", "Anexo A — Catálogo de Causas Homologadas (22)"),
    ("table", ["ID", "Código", "Nombre"], CAUSAS),

    ("h1", "Anexo B — Catálogo de Sub-Causas (14)"),
    ("table", ["ID", "Causa", "Sub-causa"], SUBCAUSAS),

    ("h1", "Anexo C — Catálogo de Formatos (11)"),
    ("info", "Los códigos de formato listados son PROPUESTOS y deben revisarse y validarse con el equipo funcional antes de su uso oficial.", "AVISO"),
    ("table", ["Código propuesto", "Nombre", "Estado", "Observación"], [f[:4] for f in FORMATOS]),
]

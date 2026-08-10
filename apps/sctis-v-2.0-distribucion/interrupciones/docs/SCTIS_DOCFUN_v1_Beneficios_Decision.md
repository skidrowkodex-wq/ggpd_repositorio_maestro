# DOCUMENTO FUNCIONAL
BENEFICIOS Y DESCRIPCIÓN DEL SISTEMA

**Sistema de Gestión de Tiras de Interrupción Eléctrica**  
**SCTIS v1.0**  

---


## 1. Introducción

El Sistema de Gestión de Tiras de Interrupción Eléctrica (SCTIS) automatiza el proceso de recolección, validación y consolidación de las tiras de interrupción de servicio que reportan los estados operadores de CORPOELEC.

Hoy, cada estado prepara sus reportes en archivos Excel con formatos propios, los envía por correo y el equipo de seguimiento los consolida manualmente. Ese proceso es lento, propenso a errores y dificulta la trazabilidad.

Con SCTIS, el operador de cada estado sube su archivo Excel al sistema web, y este valida automáticamente la estructura, homologa las causas a las oficiales, verifica que las subestaciones y circuitos existan, detecta duplicados, mide la calidad de los datos y deja todo registrado para auditoría. El resultado es información confiable, disponible en tiempo real y respaldada por tableros de control.


### 1.1. Párrafo ejecutivo

> **EN LENGUAJE CLARO:** SCTIS convierte un proceso manual, descentralizado y propenso a errores en una plataforma centralizada, automatizada y auditable. Lo que antes tomaba días de trabajo y revisiones, ahora se hace en minutos con controles de calidad automáticos. El sistema fue desarrollado con asistencia de modelos de inteligencia artificial y sienta las bases para una futura migración a la nube (Supabase) y a Google AI Studio.


## 2. El Problema Actual (Antes)

| Dimensión | Situación actual |
| --- | --- |
| Formatos | Cada estado usa su propio formato de Excel; el mismo estado puede usar variantes distintas |
| Recolección | Los reportes se consolidan manualmente por correo, con demoras y extravíos |
| Errores | Errores de digitación, duplicados y causas mal escritas que no se detectan |
| Causas | Las causas se reportan con criterios distintos por estado; es difícil comparar |
| Activos | Subestaciones y circuitos escritos con nombres distintos para el mismo activo |
| Trazabilidad | No se sabe quién cargó qué, cuándo, ni con qué resultado |
| Consolidación | Los cálculos de horas y energía se hacen a mano o en hojas separadas |
| Visibilidad | No existe un tablero único de seguimiento por estado, causa o mes |


## 3. La Solución (Después)

| Dimensión | Situación con SCTIS |
| --- | --- |
| Formatos | El sistema detecta automáticamente el formato de cada estado (11 formatos registrados) |
| Recolección | Carga web centralizada; el operador sube el Excel y el sistema lo procesa |
| Errores | Validación automática de estructura, tipos y campos obligatorios |
| Causas | Homologación automática a las 22 causas oficiales, con sugerencias de IA |
| Activos | Emparejamiento con el inventario oficial; el sistema aprende los sinónimos y supervisa los activos nuevos |
| Trazabilidad | Auditoría completa de cada carga: usuario, fecha, hoja, aceptados y rechazados |
| Consolidación | Cálculo automático de horas, duración y mes; calidad ISO 8000 por registro |
| Visibilidad | Dashboard con 4 perspectivas expertas, monitoreo de cargas por estado y gráficos descargables |
| Seguimiento de Cargas | Matriz en tiempo real que identifica qué estados han cumplido y quiénes están en mora (semanal y mensual) |


## 4. Beneficios Concretos

| Beneficio | Descripción | Impacto |
| --- | --- | --- |
| Ahorro de tiempo | La carga de un archivo completo pasa de horas a minutos | Alto |
| Menos errores | Validaciones automáticas reducen errores de digitación y duplicados | Alto |
| Información confiable | Causas y activos homologados permiten comparar entre estados | Alto |
| Trazabilidad total | Cada carga queda auditada; se genera tarea de corrección automática | Alto |
| Monitoreo de Cargas en Vivo | Matriz clara que indica quién falta por cargar data por semana (Mié/Jue) y mes (día 3), con emisión directa de requerimientos | Alto |
| Calidad medible | Scoring ISO 8000 (0-100) por registro con 9 reglas | Medio |
| Catálogo que aprende | Los sinónimos de SE/CT se memorizan por estado; cada carga resuelve más rápido que la anterior | Alto |
| Inventario gobernado | Los activos nuevos pasan por aprobación del administrador con trazabilidad completa | Alto |
| Decisiones basadas en datos | Dashboard en tiempo real con tendencias, causas y horas | Alto |
| Base para la nube | Preparado para migrar a Supabase y Google AI Studio | Medio |


---


## 5. Descripción Funcional del Software


### 5.1. Acceso y roles

El sistema se accede por un navegador web con usuario y contraseña. Existen dos roles: el administrador (accede a todos los estados y gestiona usuarios, auditoría y tareas) y el operador/editor (solo ve y carga su estado asignado). La seguridad limita el acceso a nivel de base de datos: un operador no puede ver ni modificar datos de otros estados.


### 5.2. Carga de datos desde Excel

El operador sube su archivo Excel desde la opción 'Importar'. Si el archivo tiene varias hojas, el sistema le pide que seleccione una sola. Luego procesa la hoja y le muestra un resumen: cantidad de registros, formato detectado, causas a homologar y activos sin resolver. El operador revisa y confirma; solo entonces los datos se guardan en la base de datos.


### 5.3. Formato inteligente

El sistema reconoce automáticamente el formato de cada estado comparando los encabezados de la hoja contra un catálogo de 11 formatos. Si el archivo no coincide con ninguno, lo rechaza con un mensaje claro de qué está mal y cómo corregirlo.


### 5.4. Homologación de causas

Cada estado reporta las causas a su manera. El sistema las asigna automáticamente a las 22 causas oficiales del catálogo, mostrando el resultado en la previsualización para que el operador lo confirme o ajuste. Cuando hay ambigüedad, la inteligencia artificial sugiere la causa más probable.


### 5.5. Resolución de activos

El sistema verifica que cada subestación y circuito del archivo exista en el inventario oficial del estado. Si un nombre no coincide (por ejemplo por diferencias de tildes o numerales), lo marca y ofrece opciones de emparejamiento. El sistema aprende de cada decisión: cuando el operador señala a qué activo se refiere, guarda esa referencia y en las cargas siguientes el nombre se resuelve automáticamente.

Si un activo no está en el inventario, el operador puede reportarlo como nuevo. La tira se carga igual (sin bloqueos), y la solicitud queda en una bandeja de revisión para que el administrador la apruebe, la asocie a un activo existente o la rechace. Así el inventario se mantiene íntegro y gobernado.


### 5.6. Control de calidad

Cada registro recibe un puntaje de calidad (0-100) basado en completitud, consistencia y precisión. Los duplicados se detectan automáticamente. Los registros con problemas no se descartan, pero quedan marcados para revisión, porque en el sector eléctrico la información disponible suele ser la única que existe.


### 5.7. Auditoría y tareas

Cada carga queda registrada con usuario, fecha, archivo, hoja, cantidad de aceptados y rechazados. Si hay registros rechazados, el sistema genera automáticamente una tarea de corrección y un archivo Excel con los errores por fila para que el operador los revise y recargue.


### 5.8. Tablero de control

El dashboard presenta 4 perspectivas: Ingeniero Eléctrico (causas, horas, tendencia), Mantenimiento, Project Manager y Data Scientist. Incluye gráficos de causas, horas, tendencias, sistemas, circuitos, subestaciones, estados y horarios, más un diagrama Sankey que desglosa las causas 'OTRAS' en su causa original.


### 5.9. Aprendizaje del sistema y supervisión de activos

El SCTIS incorpora dos mecanismos complementarios para mantener íntegro el inventario maestro de subestaciones y circuitos:

- Diccionario aprendido: cuando un nombre fuera de norma se asocia a un activo oficial, el sistema lo memoriza por estado y lo aplica automáticamente en las cargas futuras. Elimina el trabajo repetitivo de re-mapear los mismos nombres cada semana.
- Supervisión de activos nuevos: los SE/CT reportados que no existen en el catálogo se encolan y el administrador decide aprobar (creándolos en el inventario con su nombre normalizado), asociarlos como alias de uno existente, corregir el nombre o rechazarlos con un comentario. Al aprobar, las tiras ya cargadas se vinculan automáticamente (backfill).

Todo queda registrado: quién reportó, quién decidió, cuándo y con qué comentario. Este control de cambios es clave para la trazabilidad y la confiabilidad de los datos bajo normas ISO.


### 5.10. Módulo de Monitoreo de Cargas y Matriz de Seguimiento

El sistema cuenta con un Módulo Especializado de Monitoreo de Cargas que elimina la incertidumbre sobre el cumplimiento de entregas de datos por parte de los 24 estados operadores de Venezuela:

- Transparencia Total por Estado: Evalúa en tiempo real la última fecha de carga registrada combinando las tres fuentes de ingesta (auditoría de archivos subidos por el operador, cargas excepcionales administrativas e inserciones directas de tiras).
- Control Semanal (Miércoles / Jueves): Evalúa si el estado ha subido data en los últimos 4 días. Alerta de forma inmediata sobre la carga requerida semanalmente.
- Control Mensual (Consolidado hasta el Día 3): Mantiene la disciplina del cierre de mes, otorgando plazo activo entre el día 1 y 3 del mes posterior, marcando como moroso a quien sobrepase este límite.
- Filtros Rápidos y Paneles de Alerta: Permite aislar en un clic a los estados con 'Falta Semanal', 'Falta Mes' o visualizar a los estados que están 'Al Día'.
- Emisión Directa de Requerimientos: Permite al supervisor enviar con un solo clic tareas de solicitud urgente (24h/48h) directo al perfil del operador correspondiente.

Todo el proceso de seguimiento queda completamente documentado y automatizado sin dejar espacio a dudas sobre quién falta por entregar su información.


---


## 6. Diagrama de Flujo General

> Flujo: **OPERADOR → SCTIS → HOMOLOGACIÓN → REVISIÓN → GUARDADO → TABLERO**
> - **OPERADOR**: Sube Excel con sus tiras
> - **SCTIS**: Detecta formato y valida estructura
> - **HOMOLOGACIÓN**: Causas a las 22 oficiales · activos verificados
> - **REVISIÓN**: Operador confirma o corrige en previsualización
> - **GUARDADO**: Datos insertados · auditoría y calidad
> - **TABLERO**: Dashboards y reportes

El proceso completo, desde subir el archivo hasta ver los datos en el tablero, se realiza en la misma sesión web y queda registrado para auditoría.


## 7. Impacto Esperado

| Indicador | Antes | Con SCTIS |
| --- | --- | --- |
| Tiempo de carga de un reporte mensual | Horas (consolidación manual) | Minutos (subida + confirmación) |
| Errores de digitación | Frecuentes, sin detección | Detectados y rechazados con detalle |
| Duplicados | No detectados | Detectados automáticamente |
| Comparabilidad entre estados | Baja (formatos y causas distintos) | Alta (homologación a 22 causas) |
| Re-mapeo de nombres de activos | Repetitivo en cada carga | Automático (diccionario que aprende por estado) |
| Control del inventario maestro | Sin supervisión | Bandeja de aprobación con trazabilidad |
| Trazabilidad | Limitada (correo) | Total (auditoría por carga) |
| Calidad de datos | No medible | Score ISO 8000 por registro |
| Acceso a la información | Reportes estáticos | Dashboard en tiempo real |


## 8. Próximos Pasos

- Revisión de esta propuesta por los ingenieros y ajuste del software según sus observaciones.
- Migración de la base de datos a Supabase (PostgreSQL en la nube).
- Migración de la capa de inteligencia artificial a Google AI Studio para potenciar el análisis.
- Despliegue en Vercel en versión beta con acceso por estados.
- Actualización de la documentación tras cada ajuste y prueba.


## 9. Desarrollo con Inteligencia Artificial

El SCTIS fue desarrollado íntegramente con asistencia de modelos de inteligencia artificial, desde el análisis de formatos y el diseño del esquema de datos hasta la generación de código y documentación. En producción, la IA (Google Gemini, modelo gemini-2.5-flash) apoya la homologación de causas, la evaluación de calidad y la detección de duplicados. La fase siguiente migra esta capacidad a Google AI Studio.

> **IA APLICADA AL SEN:** Este proyecto demuestra que la IA aplicada al sector eléctrico venezolano permite automatizar procesos complejos, reducir errores y liberar tiempo del personal técnico para tareas de mayor valor. Los modelos de asistencia al desarrollo serán listados en detalle por el equipo.


---


## Anexo A — Glosario

| Término | Definición |
| --- | --- |
| Tira de interrupción | Registro de un evento de interrupción del servicio eléctrico. |
| TTI | Tiempo Total de Interrupción: energía no suministrada durante el evento. |
| Causa homologada | Causa asignada a uno de los códigos oficiales del catálogo. |
| Activo | Subestación o circuito registrado en el inventario oficial. |
| Homologación | Proceso de llevar la causa reportada por un estado a una causa oficial. |
| Scoring ISO 8000 | Puntaje de calidad de datos (0-100) de cada registro. |
| Alias de activo | Sinónimo aprendido por el sistema: nombre fuera de norma que se resuelve automáticamente a un activo del catálogo. |
| Bandeja de revisión | Lista de SE/CT reportados como nuevos que esperan decisión del administrador (aprobar, alias, corregir o rechazar). |
| Backfill | Vinculación automática y retroactiva de tiras ya cargadas al activo recién aprobado. |
| Dashboard | Tablero de control con gráficos y estadísticas en tiempo real. |
| RLS | Filtro de seguridad a nivel de base de datos que limita lo que ve cada usuario. |
| Formato homologado | Plantilla Excel oficial que deben usar los estados. |


## Anexo B — Catálogo de Formatos

> **AVISO:** Los códigos de formato son PROPUESTOS y deben revisarse con el equipo funcional.

| Código propuesto | Nombre | Estado |
| --- | --- | --- |
| TIRAS | Formato TIRAS Estándar | Multi-estado |
| F328 | Formato F328 — Sistema Eléctrico | Multi-estado |
| ANZOATEGUI | Formato Anzoátegui / Nesparta | ANZOÁTEGUI |
| CARABOBO | Formato Carabobo | CARABOBO |
| CAPITAL | Formato Capital | DISTRITO CAPITAL |
| GUARICO_1 | Formato Guárico (Variante 1) | GUÁRICO |
| GUARICO_2 | Formato Guárico (Variante 2) | GUÁRICO |
| LARA | Formato Lara | LARA |
| MIRANDA_TUY | Formato Miranda Tuy Barlovento | MIRANDA |
| YARACUY | Formato Yaracuy | YARACUY |
| ZULIA | Formato Zulia | ZULIA |


---
*Fin del documento.*
# INSTRUCTIVO OPERATIVO
PROCEDIMIENTO DE CARGA DE TIRAS DE INTERRUPCIÓN

**Sistema de Gestión de Tiras de Interrupción Eléctrica — Guía de uso para estados operadores**  
**SCTIS v1.0**  

---


## 1. Propósito y Alcance

Este instructivo describe el procedimiento completo de uso de la aplicación SCTIS por parte de los estados operadores: desde el ingreso al sistema hasta la carga de tiras de interrupción, la corrección de rechazados y la consulta de información.

Va dirigido a los operadores y planificadores de cada estado que reportan las tiras de interrupción a la Gerencia de Gestión de Planificación de Distribución.


## 2. Requisitos previos

- Una cuenta de usuario activa asignada por el administrador (usuario y contraseña).
- El estado al que está asignado el usuario.
- Un archivo Excel con el formato de su estado (o el Formato TIRAS Estándar homologado).
- Un navegador web moderno (Chrome, Edge, Firefox).

> **RECORDATORIO:** Si no tiene usuario o lo olvidó, contacte a la Coordinación de SCTIS o al administrador del sistema.


## 3. Ingreso al sistema

> Flujo: **ABRIR → INGRESAR → SESIÓN**
> - **ABRIR**: Acceda a la URL del sistema en su navegador
> - **INGRESAR**: Digite usuario y contraseña
> - **SESIÓN**: El sistema lo dirige al menú principal

- Si la contraseña es incorrecta 5 veces, la cuenta queda bloqueada por 30 minutos.
- Cierre sesión al terminar, especialmente en equipos compartidos.


## 4. Preparación del archivo Excel


### 4.1. Formatos aceptados

El sistema acepta el Formato TIRAS Estándar homologado (21 columnas) y los formatos propios de cada estado registrados en el catálogo. La detección es automática. Si su archivo tiene un formato no registrado, el sistema lo rechazará con un mensaje de 'formato no reconocido'.


### 4.2. Consolidación en una sola hoja

El sistema procesa UNA sola hoja por carga. Si su archivo tiene varias hojas, el sistema le pedirá que seleccione una. Antes de subir, consolide sus reportes en una sola hoja con la estructura correcta.


### 4.3. Verificación de la estructura

- La hoja debe tener encabezados en la primera fila (ESTADO, SISTEMA, CIRCUITO, FECHA, CAUSA, SUB, OBSERVACION como mínimo).
- No agregue, elimine ni reordene columnas respecto a su plantilla.
- No combine celdas ni agregue formatos condicionales.
- Verifique que las fechas sean reales y las horas estén en formato HH:MM.


### 4.4. Plazos y frecuencia de entrega

- Reporte Semanal: Debe subir las tiras de la semana al menos los días Miércoles o Jueves. Cargas con más de 4 días de antigüedad se marcan como morosas.
- Consolidado Mensual: Debe garantizar la carga del consolidado completo antes del día 3 del mes posterior.
- Requerimientos Directos: Si incurre en mora, el administrador emitirá una tarea en su perfil con plazo urgente (24h/48h) que deberá atender a la brevedad.


---


## 5. Procedimiento de carga paso a paso


### Paso 1 — Subir el archivo

- En el menú principal seleccione 'Importar'.
- Haga clic en 'Subir' y seleccione su archivo .xlsx.
- Si es administrador, seleccione el estado destino.
- Si el archivo tiene varias hojas, seleccione la hoja correcta en la lista que se muestra.


### Paso 2 — Revisar la previsualización

El sistema procesa la hoja y muestra un resumen con:

- Cantidad de registros detectados.
- Formato detectado (TIRAS, F328 o el de su estado).
- Causas originales a homologar y su asignación a las causas oficiales.
- Activos inconsistentes (subestaciones o circuitos no encontrados).
- Advertencias de calidad o duplicados.

Revise cada sección. Para cada activo inconsistente, elija una de dos opciones:

- Emparejarlo con un activo del catálogo: seleccione la subestación o circuito correcto de la lista. El sistema memorizará esa referencia y en las próximas cargas ese nombre se resolverá solo.
- Reportarlo como nuevo: marque la casilla 'Reportar como nueva' si el activo no existe en el inventario. La carga no se bloquea: la tira se guarda con el nombre tal cual y la solicitud pasa a revisión del administrador.

El sistema muestra una etiqueta de preclasificación (probable nuevo, probable typo o posible alias) para orientar la decisión. Confirme las homologaciones de causa sugeridas o ajuste la causa oficial de cada una.


### Paso 3 — Confirmar la carga

- Haga clic en 'Confirmar importación' para guardar los registros en la base de datos.
- El sistema mostrará el resultado: registros insertados y registros rechazados.
- Si hubo rechazados, el sistema crea una tarea de corrección y genera un archivo Excel con el detalle de errores por fila.

> **EN LENGUAJE CLARO:** Antes de confirmar nada se guarda en la base de datos. La previsualización es una vista previa: puede corregir el Excel y subirlo de nuevo sin dejar datos huérfanos.


## 6. Manejo de registros rechazados

> Flujo: **RESULTADO → DESCARGAR → CORREGIR → RECARGAR**
> - **RESULTADO**: Revisa la lista de errores por fila
> - **DESCARGAR**: Descarga el Excel de corrección generado
> - **CORREGIR**: Corrige los datos en el archivo original
> - **RECARGAR**: Vuelve a subir el archivo corregido

Los errores más comunes son: causa sin mapeo a causa oficial, estado no determinado, fechas inválidas y duplicados. Corrija en su Excel y vuelva a subir. El administrador puede ver las tareas pendientes y sus archivos de corrección en 'Admin → Tareas'.


---


## 7. Subestaciones y circuitos no catalogados

Cuando un archivo contiene una subestación (SE) o un circuito (CT) que no está en el inventario oficial, el sistema le pedirá que decida qué hacer con ese nombre.


### 7.1. Si el activo existe con otro nombre

- Seleccione el activo correcto en la lista de sugerencias (aunque el nombre reportado sea distinto: siglas, tildes, numerales, nombre anterior).
- El sistema guarda esa referencia como sinónimo del estado. En las próximas cargas, ese nombre se reconocerá automáticamente y no se volverá a preguntar.


### 7.2. Si el activo es realmente nuevo

- Marque 'Reportar como nueva' en la previsualización.
- La tira se carga sin bloquearse, con el nombre tal como aparece en el archivo.
- La solicitud queda pendiente en la bandeja del administrador ('Admin → Activos'), quien decidirá aprobarla, asociarla a un activo existente o rechazarla.
- Al aprobarla, el activo entra al catálogo con su nombre normalizado y las tiras ya cargadas se vinculan automáticamente.

> **IMPORTANTE:** Reportar como nueva NO crea la subestación ni el circuito automáticamente: solo la encola. La creación final la hace siempre el administrador, después de verificar el nombre. Esto protege el inventario oficial de errores de tipeo.


## 8. Carga manual de una tira

Para registrar una tira individual (por ejemplo una corrección puntual), use la opción 'Nuevo registro':

> Flujo: **NUEVO → ESTADO → SUBESTACIÓN → CIRCUITO → DATOS → GUARDAR**
> - **NUEVO**: Selecciona 'Nuevo' en el menú
> - **ESTADO**: Fijado según su perfil
> - **SUBESTACIÓN**: Selecciona del listado filtrado por estado
> - **CIRCUITO**: Selecciona del listado filtrado por subestación
> - **DATOS**: Completa fechas, causa, sub-causa, horas, KVA y observaciones
> - **GUARDAR**: Valida y guarda

> **LENGUAJE CLARO:** El formulario es guiado: las listas se actualizan automáticamente según la selección anterior, lo que evita errores de referencia.


## 9. Consulta de registros

- Use la opción 'Consulta' para buscar tiras por estado, fecha, subestación o circuito.
- Puede ver, editar o eliminar registros de su estado.
- Los registros se muestran filtrados según su perfil (solo su estado).


## 10. Tablero de control

El 'Dashboard' presenta estadísticas y gráficos: causas más frecuentes, horas de interrupción, tendencia mensual, sistemas afectados, circuitos y subestaciones con más fallas, distribución horaria y calidad de datos. Incluye 4 perspectivas (Ingeniero Eléctrico, Mantenimiento, Project Manager, Data Scientist). Cada gráfico se puede descargar como imagen (PNG).


## 11. Errores frecuentes y solución

| Error | Causa probable | Solución |
| --- | --- | --- |
| Formato no reconocido | El archivo no coincide con ningún formato registrado | Verifique que use la plantilla de su estado o el Formato TIRAS Estándar |
| Columna 'X': se esperaba '...' | Encabezado modificado o desplazado | Compare con la plantilla oficial; restaure el encabezado |
| Debe seleccionar una hoja | El archivo tiene varias hojas visibles | Seleccione la hoja correcta o consolide en una sola |
| Fila N: causa sin mapeo | La causa no está asociada a una causa oficial | Asigne la causa oficial en la previsualización |
| Fila N: no se pudo determinar el estado | La columna ESTADO no tiene un estado válido | Escriba el nombre del estado correctamente (sin abreviar) |
| Duplicado detectado | Mismo evento cargado dos veces | Verifique fecha, circuito y hora; elimine el duplicado |
| Cuenta bloqueada | 5 intentos fallidos en 30 minutos | Espere 30 minutos o contacte al administrador |
| Subestación/circuito no catalogado | El activo no existe o está escrito con otro nombre | Empatéjelo con el activo correcto o repórtelo como nuevo para revisión |


## 12. Buenas prácticas

- Consolide siempre sus reportes en una sola hoja antes de subir.
- Use la plantilla oficial proporcionada por la Coordinación de SCTIS.
- Escriba los nombres de subestaciones y circuitos tal como aparecen en el inventario.
- Revise la previsualización antes de confirmar cada carga.
- Descargue y corrija los registros rechazados de inmediato para mantener la información al día.
- Empareje los nombres fuera de norma con el activo correcto para que el sistema los memorice.
- Registre observaciones completas en cada tira para facilitar la auditoría.


---


## 13. Contacto y soporte

- Coordinación de SCTIS — soporte y capacitación.
- Ing. Catherina Favio — Responsable del Proceso de Interrupciones.
- Administrador del sistema — gestión de usuarios y permisos.


## Anexo A — Glosario

| Término | Definición |
| --- | --- |
| Tira de interrupción | Registro de un evento de interrupción del servicio eléctrico. |
| TTI | Tiempo Total de Interrupción: energía no suministrada durante el evento. |
| Causa homologada | Causa asignada a uno de los códigos oficiales del catálogo. |
| Activo | Subestación o circuito registrado en el inventario oficial. |
| Sub-causa | Detalle complementario de la causa de la interrupción. |
| Homologación | Proceso de llevar la causa reportada a una causa oficial. |
| Scoring ISO 8000 | Puntaje de calidad de datos (0-100) de cada registro. |
| Alias de activo | Sinónimo aprendido por el sistema: nombre fuera de norma que se resuelve automáticamente a un activo del catálogo. |
| Bandeja de revisión | Lista de SE/CT reportados como nuevos que esperan decisión del administrador. |
| Backfill | Vinculación automática y retroactiva de tiras ya cargadas al activo recién aprobado. |
| KVA | Kilovoltamperio: potencia aparente afectada durante el evento. |


## Anexo B — Catálogo de Formatos por Estado

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
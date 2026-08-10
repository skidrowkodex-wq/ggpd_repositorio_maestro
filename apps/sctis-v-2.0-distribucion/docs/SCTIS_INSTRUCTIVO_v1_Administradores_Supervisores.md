# INSTRUCTIVO ISO PARA ADMINISTRADORES
Y SUPERVISORES DEL SISTEMA

**Sistema de Gestión de Tiras de Interrupción Eléctrica — Guía de administración y supervisión**  
**SCTIS v1.0**  

---


## 1. Propósito y Alcance

Este instructivo describe los procedimientos de administración y supervisión del Sistema de Gestión de Tiras de Interrupción Eléctrica (SCTIS): gestión de usuarios, revisión de auditoría de cargas, gestión de tareas pendientes y, de forma destacada, la supervisión de subestaciones (SE) y circuitos (CT) reportados fuera del catálogo oficial.

Va dirigido a los administradores y supervisores del sistema. Por ahora el perfil Supervisor comparte las mismas funciones del Administrador; cuando los roles se diferencien, este documento deberá actualizarse para reflejar los alcances de cada perfil.

> **NOTA DE ROLES:** Mientras no se indique lo contrario, en este documento 'administrador' y 'supervisor' son intercambiables: ambos acceden a los mismos módulos de gestión y supervisión.


## 2. Referencias Normativas

| Referencia | Descripción |
| --- | --- |
| ISO 9001:2015 | Sistemas de gestión de la calidad — enfoque de procesos, control de cambios y toma de decisiones basada en evidencia |
| ISO 27001:2022 | Seguridad de la información — autenticación, autorización y trazabilidad de las acciones |
| ISO 8000-110 | Calidad de datos — identificador único por entidad (un registro maestro por activo físico) |
| ISO 8000-150 | Calidad de datos — evaluación de la calidad de datos maestros |


## 3. Responsabilidades del administrador/supervisor

- Gestionar las cuentas de usuario de los estados operadores (crear, editar, restablecer contraseñas, desactivar).
- Supervisar en tiempo real la Matriz de Monitoreo de Cargas por estado (entregas semanales y consolidados mensuales).
- Emitir requerimientos inmediatos de carga (SOLICITUD_CARGA_SEMANAL y SOLICITUD_CONSOLIDADO_MENSUAL) a estados morosos.
- Revisar la auditoría de cargas y verificar que cada importación cumpla con la estructura y las homologaciones.
- Atender y cerrar las tareas pendientes (CORREGIR_DATOS, APROBAR_ACTIVO y SOLICITUD_CARGA) dentro del plazo establecido.
- Supervisar la bandeja de activos nuevos: decidir aprobar, asociar como alias, corregir o rechazar cada solicitud.
- Garantizar que el inventario maestro (common.assets) solo se modifique mediante el procedimiento controlado.


---


## 4. Gestión de usuarios

El módulo 'Admin → Usuarios' permite administrar las cuentas de los estados operadores.


### 4.1. Crear un usuario

- Seleccione 'Admin → Usuarios' y haga clic en 'Nuevo'.
- Registre usuario, nombre completo, rol y estado asignado.
- Asigne una contraseña temporal y entregue el acceso al operador, quien deberá cambiarla en su primer ingreso.
- Cada usuario solo ve y carga los datos de su estado (filtro a nivel de base de datos).


### 4.2. Editar, restablecer contraseña y desactivar

- Use 'Editar' para cambiar nombre, rol o estado asignado.
- Use 'Restablecer contraseña' cuando el operador la olvide o quede bloqueado.
- Desactive la cuenta cuando el operador deje el puesto; no la elimine, para conservar la trazabilidad de sus cargas.

> **SEGURIDAD:** La cuenta se bloquea automáticamente tras 5 intentos fallidos durante 30 minutos. Solo el administrador puede restablecerla antes.


## 5. Auditoría de cargas

El módulo 'Admin → Auditoría' muestra el registro de todas las importaciones: usuario, estado, archivo, hoja, cantidad de registros intentados, aceptados y rechazados, formato detectado y estado de validación.

- Revise periódicamente las cargas con estado PARTIAL (hubo rechazados) para confirmar que se generó la tarea de corrección.
- Use el resumen por estado y por usuario para detectar estados que reportan tarde o con errores recurrentes.
- Si una carga parece incorrecta, descargue el archivo de corrección asociado y coordine con el operador.


## 6. Monitoreo de cargas y matriz de cumplimiento por estado

El módulo 'Admin → Monitoreo' permite evaluar en tiempo real la disciplina de entrega de los 24 estados de Venezuela, clasificando de forma transparente quiénes han cumplido y quiénes están en mora tanto en la frecuencia semanal como en el consolidado mensual.


### 6.1. Criterios de evaluación de cumplimiento

| Frecuencia | Criterio de Evaluación | Estados de Cumplimiento | Descripción |
| --- | --- | --- | --- |
| Semanal | Entrega requerida cada Miércoles / Jueves (Carga en ≤ 4 días) | Al Día / Carga Requerida Hoy / Falta Carga Semanal | Verifica que el estado haya ingresado tiras recientes en los últimos 4 días. Los miércoles y jueves se activa la alerta de carga requerida hoy. |
| Mensual | Consolidado entregado antes del día 3 del mes posterior (Carga en ≤ 25 días) | Consolidado Al Día / En Plazo Mensual / Falta Consolidado Mensual | Garantiza el cierre estadístico mensual. Entre el día 1 y 3 de cada mes se otorga ventana activa. |


### 6.2. Paneles de alerta y acción directa

- Paneles de alerta superior: Muestra tarjetas destacadas con los contadores de estados al día en entrega semanal y mensual, junto con las cifras de entidades morosas.
- Listas dinámicas de faltantes: Destacan directamente los nombres de los estados que no han cargado data esta semana o este mes.
- Botón 'Solicitar': Permite al administrador emitir inmediatamente un requerimiento directo de carga con plazo de respuesta configurable (24h o 48h) que genera una tarea formal en el perfil del operador del estado.
- Filtros rápidos de matriz: Botones directos para filtrar la tabla de 24 estados por 'Falta Semanal', 'Falta Mes', 'Al Día' o buscar por nombre de estado.


---


## 7. Gestión de tareas pendientes

El módulo 'Admin → Tareas' centraliza las tareas que requieren acción. Tipos de tareas:

| Tipo | Origen | Acción del administrador / operador |
| --- | --- | --- |
| CORREGIR_DATOS | Carga con registros rechazados | Coordinar con el operador; descargar el Excel de corrección; marcar completada cuando se recargue. |
| APROBAR_ACTIVO | SE/CT reportados como nuevos | Resolver en la bandeja de Activos; la tarea se completa sola cuando no quedan solicitudes del estado. |
| SOLICITUD_CARGA_SEMANAL | Emitida desde Monitoreo por mora semanal | El operador debe subir el reporte semanal pendiente. Plazo habitual: 24 horas. |
| SOLICITUD_CONSOLIDADO_MENSUAL | Emitida desde Monitoreo por mora mensual | El operador debe subir el consolidado mensual pendiente. Plazo habitual: 48 horas. |

- Filtre por estado y por tipo de tarea para priorizar.
- Monitoree las tareas vencidas (destacadas con indicador de alerta cuando transcurre más tiempo del límite asignado).
- Marque 'Completada' solo cuando la acción se haya concretado; use 'Cancelar' cuando la tarea ya no aplique.


---


## 8. Bandeja de revisión de activos

Cuando un operador marca una subestación o circuito como 'no está en catálogo', la solicitud llega a la bandeja 'Admin → Activos'. El sistema la preclasifica automáticamente y el administrador/supervisor decide. Esta es la función de supervisión más crítica del sistema: protege la integridad del inventario maestro.


### 8.1. Revisar la bandeja

- Filtre por estado y por estado de revisión (Pendientes, En revisión, Aprobados, Es alias, Rechazados).
- Revise: nombre reportado, nombre sugerido, subestación referida (para CT), número de filas afectadas, clasificación y activo sugerido.
- Las clasificaciones orientan la decisión: Probable nuevo (no existe nada similar), Probable typo (muy similar a uno existente) y Posible alias (parecido pero distinto).


### 8.2. Aprobar (crear el activo en el catálogo)

- Verifique el nombre canónico en el campo 'Nombre canónico en catálogo'; corríjalo si tiene errores de tipeo.
- Para SE, indique el voltaje (kV) si se conoce.
- Haga clic en 'Aprobar y crear'. El sistema crea el activo con nombre normalizado, código y jerarquía correctos, vincula las tiras ya cargadas (backfill) y memoriza el nombre como sinónimo.
- Para CT, la SE padre debe estar aprobada o tener alias antes de aprobar el circuito.


### 8.3. Asignar como alias (existe con otro nombre)

- Cuando el nombre reportado corresponde a un activo que ya existe (renombrado, siglas, nombre anterior), seleccione el activo correcto del catálogo.
- El sistema vincula el nombre reportado a ese activo y las cargas futuras lo resuelven automáticamente, sin duplicar el catálogo.


### 8.4. Corregir el nombre sugerido

- Si el nombre reportado es válido pero el sugerido está mal escrito, corrija el nombre canónico antes de aprobar.
- La corrección no crea el activo: solo ajusta el nombre propuesto para la posterior aprobación.


### 8.5. Rechazar

- Use 'Rechazar' cuando el nombre sea ilegible, no corresponda a un activo real o no se pueda determinar.
- Registre siempre el motivo: queda en el comentario y permite reportar los nombres sin resolver.

> **NOTA TÉCNICA:** Cada decisión queda auditada: quién decidió, cuándo y con qué comentario (trazabilidad ISO 27001). La creación del activo usa source_process = 'sctis_import' y created_by del administrador.


## 9. Decisiones de la bandeja (resumen)

| Situación | Decisión recomendada | Efecto |
| --- | --- | --- |
| No existe nada similar en el catálogo | Aprobar | Crea el activo, vincula tiras previas y resuelve cargas futuras |
| Existe un activo con otro nombre (renombrado/abreviado) | Es alias | Asocia el nombre reportado al activo existente sin duplicar |
| El nombre tiene un error corregible | Corregir y aprobar | Normaliza el nombre antes de crear el activo |
| Nombre ilegible o no determinable | Rechazar | Queda sin resolver con comentario justificado |


## 10. Buenas prácticas de supervisión

- Revise la bandeja de Activos al menos una vez al día para no acumular solicitudes pendientes.
- Compare siempre el nombre reportado contra el activo sugerido antes de aprobar.
- Prefiera 'Es alias' sobre crear un activo duplicado: el catálogo debe tener un solo registro por activo físico.
- Escriba comentarios claros en los rechazos para que el estado pueda corregir el origen.
- Verifique el estado y la jerarquía (SE padre) antes de aprobar circuitos.
- Mantenga la disciplina de no editar el catálogo por fuera del sistema (nunca por SQL directo).


---


## 11. Errores frecuentes de supervisión

| Situación | Causa | Acción correcta |
| --- | --- | --- |
| No se puede aprobar un CT | La SE padre no está aprobada ni tiene alias | Resuelva primero la SE asociada en la bandeja |
| El activo creado aparece duplicado | Se creó sin verificar el alias o el nombre | Use 'Es alias' si el activo ya existe; corrija el nombre si es necesario |
| Tarea APROBAR_ACTIVO queda pendiente | Hay solicitudes del estado sin resolver | Resuelva todas las solicitudes del estado; la tarea se completa sola |
| Un estado reporta los mismos nombres cada semana | Los operadores no emparejan o no se aprobó la solicitud | Apruebe o asigne alias para que las cargas futuras se resuelvan solas |


## 12. Contacto y soporte

- Coordinación de SCTIS — soporte técnico y funcional.
- Ing. Catherina Favio — Responsable del Proceso de Interrupciones.
- Desarrollador del sistema — gestión de la plataforma y base de datos.


## Anexo A — Glosario

| Término | Definición |
| --- | --- |
| Alias de activo | Sinónimo aprendido por el sistema: nombre fuera de norma que se resuelve automáticamente a un activo del catálogo (sctis.asset_alias). |
| Bandeja de revisión | Módulo 'Admin → Activos' con las solicitudes de SE/CT nuevos pendientes de decisión (sctis.asset_request). |
| Backfill | Vinculación automática y retroactiva de tiras ya cargadas al activo aprobado o asociado. |
| Preclasificación | Clasificación automática de la solicitud: probable nuevo, probable typo o posible alias. |
| Tarea pendiente | Acción requerida registrada en el sistema (CORREGIR_DATOS o APROBAR_ACTIVO). |
| Corrección de datos | Excel generado con los registros rechazados de una carga y el motivo por fila. |


## Anexo B — Referencias al modelo de datos

| Tabla | Esquema | Uso en supervisión |
| --- | --- | --- |
| sctis.asset_alias | sctis | Diccionario de sinónimos SE/CT por estado; se alimenta al aprobar o asignar alias |
| sctis.asset_request | sctis | Solicitudes de activos nuevos con clasificación, decisiones y trazabilidad |
| sctis.tarea_pendiente | sctis | Tareas CORREGIR_DATOS y APROBAR_ACTIVO con estado y plazos |
| audit.submissions | audit | Registro de cada importación con aceptados/rechazados y formato |
| common.assets | common | Inventario maestro de SE/CT; solo se modifica desde la bandeja |


---
*Fin del documento.*
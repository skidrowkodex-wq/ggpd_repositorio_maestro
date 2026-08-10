# CRONOGRAMA DE IMPLEMENTACIÓN
DEL PILOTO SCTIS

**Actividades, entregables y fechas probables de entrega del piloto**  
**SCTIS v1.0**  

---


## 1. Propósito y Alcance

Este cronograma define la planificación de la implementación del piloto del Sistema de Gestión de Tiras de Interrupción Eléctrica (SCTIS): las actividades, su duración estimada, los entregables, las fechas probables de inicio y fin, y los hitos de control.

El proyecto es atendido por un único programador, por lo que las actividades se ejecutan en forma SECUENCIAL, sin paralelismo. Al finalizar este piloto se iniciarán los otros dos desarrollos pendientes, que dependen de él.


## 2. Contexto y Supuestos


### 2.1. Estado actual

- Los 4 documentos de propuesta fueron entregados el 02 de agosto de 2026: técnico, funcional, instructivo de estados e instructivo de administradores.
- El software está desarrollado y verificado en ambiente local sobre PostgreSQL (ggpd_se_cto_v1).
- El despliegue público está preparado para Vercel; la base de datos se migrará a Supabase.
- La capa de inteligencia artificial (Gemini) se migrará a Google AI Studio.


### 2.2. Supuestos de planificación

- Calendario de días hábiles: lunes a viernes. El lunes 03 de agosto fue declarado no laborable en la empresa.
- La aprobación de los documentos por los ingenieros es la variable crítica que dispara las actividades siguientes.
- Un solo programador atiende el proyecto: las fases se ejecutan en secuencia estricta, sin paralelismo.
- Los dos desarrollos adicionales se planifican para después del cierre de este piloto.
- No se consideran feriados adicionales del mes de agosto; si existen, las fechas se corren al día hábil siguiente.


## 3. Metodología de Estimación

Las duraciones se estimaron a partir del avance real del proyecto, de las actividades pendientes registradas en la planificación y de la experiencia del responsable. Cada fase define su entregable y su hito de control.

> **NOTA:** Las fechas son PROBABLES, no contractuales. El hito de aprobación lo fijan los ingenieros; a partir de él las fechas se recalculan con la regla indicada en la sección 7.

> Flujo: **ENTREGA → REVISIÓN → APROBACIÓN → IMPLEMENTACIÓN**
> - **ENTREGA**: Cronograma presentado al equipo
> - **REVISIÓN**: Ingenieros leen y aprueban los documentos
> - **APROBACIÓN**: Hito crítico que dispara el desarrollo restante
> - **IMPLEMENTACIÓN**: Fases secuenciales hasta el GO-LIVE


---


## 4. Fases del Cronograma

Las fases se ejecutan en forma estrictamente secuencial. La duración de cada fase se expresa en días hábiles.

| Fase | Actividad | Duración | Salida / Entregable |
| --- | --- | --- | --- |
| F1 | Revisión y aprobación de documentos + tareas pendientes (bandeja de activos, corrección de datos rechazados, alcance de transformaciones) | 3 días | Acta de aprobación y observaciones documentadas |
| F2 | Ajustes del software según observaciones | 2 días | Código ajustado y migraciones actualizadas |
| F3 | Pruebas integrales (carga real, calidad, auditoría) | 2 días | Acta de pruebas y casos de prueba |
| F4 | Iteraciones y correcciones finales | 2 días | Versión candidata (release candidate) |
| F5 | Migración de la capa de IA a Google AI Studio | 1 día | Integración de IA operativa en Google AI Studio |
| F6 | Migración de la base de datos a Supabase y actualización | 1 día | BD en Supabase con migraciones 001-009 y seguridad activa |
| F7 | Despliegue en Vercel y validación en producción | 2 días | Piloto en línea con acceso por estados |

> **TOTAL:** Duración total estimada: 13 días hábiles desde el inicio de la fase F1. La fase F1 comienza el día hábil siguiente a la entrega del cronograma.


## 5. Cronograma con Fechas Probables

Suponiendo el inicio de la fase F1 el martes 04 de agosto de 2026 (primer día hábil tras el lunes no laborable), las fechas son:

| Fase | Actividad | Inicio | Fin | Responsable |
| --- | --- | --- | --- | --- |
| F1 | Revisión, aprobación y tareas pendientes | Mar 04 Ago | Jue 06 Ago | Ingenieros + responsable |
| F2 | Ajustes según observaciones | Vie 07 Ago | Lun 10 Ago | Responsable (con IA) |
| F3 | Pruebas integrales | Mar 11 Ago | Mié 12 Ago | Responsable + usuarios piloto |
| F4 | Iteraciones y correcciones finales | Jue 13 Ago | Vie 14 Ago | Responsable (con IA) |
| F5 | Migración IA a Google AI Studio | Lun 17 Ago | Lun 17 Ago | Responsable (con IA) |
| F6 | Migración BD a Supabase | Mar 18 Ago | Mar 18 Ago | Responsable |
| F7 | Despliegue en Vercel y validación | Mié 19 Ago | Jue 20 Ago | Responsable |

> **HITO PRINCIPAL:** GO-LIVE del piloto (fecha probable): JUEVES 20 DE AGOSTO DE 2026.


## 6. Hitos de Control

| Hito | Descripción | Fecha probable |
| --- | --- | --- |
| M0 | Elaboración del cronograma | Lun 03 Ago |
| M1 | Entrega del cronograma e inicio de revisión | Mar 04 Ago |
| M2 | APROBACIÓN de los documentos por los ingenieros | Jue 06 Ago |
| M3 | Software ajustado según observaciones | Lun 10 Ago |
| M4 | Pruebas integrales completadas | Mié 12 Ago |
| M5 | Correcciones finales aplicadas | Vie 14 Ago |
| M6 | IA operativa en Google AI Studio | Lun 17 Ago |
| M7 | Base de datos en Supabase | Mar 18 Ago |
| M8 | GO-LIVE del piloto | Jue 20 Ago |


---


## 7. Regla de Recálculo tras la Aprobación

La fecha de GO-LIVE depende de la fecha real de aprobación. Desde la aprobación restan 10 días hábiles de trabajo (fases F2 a F7):

> Flujo: **APROBACIÓN → F2 + F3 + F4 → F5 + F6 → F7 → GO-LIVE**
> - **APROBACIÓN**: Hito definido por los ingenieros
> - **F2 + F3 + F4**: Ajustes + pruebas + correcciones (6 días)
> - **F5 + F6**: IA Google AI Studio + Supabase (2 días)
> - **F7**: Despliegue y validación (2 días)
> - **GO-LIVE**: Fecha de aprobación + 10 días hábiles

| Escenario | Fecha de aprobación | GO-LIVE probable |
| --- | --- | --- |
| Óptimo | Jue 06 Ago | Jue 20 Ago |
| Conservador | Vie 07 Ago | Vie 21 Ago |
| Con demora | Lun 10 Ago | Lun 24 Ago |

> **RECÁLCULO:** Si la aprobación ocurre en una fecha distinta, aplique la regla: GO-LIVE = fecha de aprobación + 10 días hábiles.


## 8. Entregables por Fase

| Fase | Entregable | Contenido |
| --- | --- | --- |
| F1 | Acta de aprobación | Observaciones documentadas y decisiones de alcance |
| F2 | Software ajustado | Cambios aplicados y migraciones actualizadas |
| F3 | Acta de pruebas | Casos de prueba, resultados y registros de prueba |
| F4 | Versión candidata | Release candidate lista para despliegue |
| F5 | Integración de IA | Homologación, calidad y duplicados en Google AI Studio |
| F6 | BD en Supabase | Migraciones 001-009, catálogos, RLS y seguridad |
| F7 | Piloto en línea | URL de acceso, credenciales por estado y validación con datos reales |


## 9. Riesgos y Supuestos de Fechas

| Riesgo / supuesto | Impacto | Mitigación |
| --- | --- | --- |
| La aprobación se retrasa | Se corre la fecha de GO-LIVE | Aplicar la regla de recálculo (aprobación + 10 días hábiles) |
| Observaciones que exigen cambios estructurales | +1 a 2 días en la fase F2 | Separar cambios estructurales de ajustes menores |
| Feriados o ferias de agosto no previstos | Desplazamiento de fechas | Correr al día hábil siguiente y notificar |
| Pruebas con datos reales destapan defectos | Mayor esfuerzo en F4 | El margen de la fase F4 absorbe las correcciones |
| Demora en cuentas o permisos de Google AI Studio o Supabase | Retraso en F5-F6 | Solicitar los accesos desde la aprobación de documentos |
| Un solo programador | Sin paralelismo: el proyecto toma más semanas que un equipo | Secuenciación estricta y foco único en el piloto |


## 10. Nota sobre los Desarrollos Adicionales

Existen dos desarrollos adicionales planificados que dependen de este proyecto. Por política de gestión y por contar con un único programador, no es recomendable atender varios proyectos en paralelo, especialmente cuando están enlazados entre sí. Ambos desarrollos se iniciarán al cierre del piloto SCTIS, siguiendo la misma metodología de planificación y control aquí descrita.


---


## Anexo A — Vista Resumida del Cronograma

Representación visual simplificada de la secuencia de fases sobre los 13 días hábiles del calendario (▓▓ = día de actividad, · = día sin actividad):

```
   Día:   1   2   3   4   5   6   7   8   9  10  11  12  13
Fecha:  04  05  06  07  10  11  12  13  14  17  18  19  20  Ago
F1     ▓▓  ▓▓  ▓▓  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
F2     ·   ·   ·   ▓▓  ▓▓  ·   ·   ·   ·   ·   ·   ·   ·
F3     ·   ·   ·   ·   ·   ▓▓  ▓▓  ·   ·   ·   ·   ·   ·
F4     ·   ·   ·   ·   ·   ·   ·   ▓▓  ▓▓  ·   ·   ·   ·
F5     ·   ·   ·   ·   ·   ·   ·   ·   ·   ▓▓  ·   ·   ·
F6     ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▓▓  ·   ·
F7     ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▓▓  ▓▓
```


## Anexo B — Glosario

| Término | Definición |
| --- | --- |
| Piloto | Implementación controlada del sistema con un grupo de estados antes de la generalización. |
| GO-LIVE | Puesta en operación del piloto: el sistema queda disponible para su uso real. |
| Hito | Punto de control con fecha definida que marca la finalización de una fase. |
| Día hábil | Día de trabajo de lunes a viernes; los feriados y fines de semana no se cuentan. |
| Release candidate | Versión del software considerada lista para despliegue si las pruebas son exitosas. |
| Backlog | Conjunto de actividades o correcciones pendientes por ejecutar. |
| Supabase | Plataforma PostgreSQL en la nube que alojará la base de datos del sistema. |
| Google AI Studio | Plataforma de Google para la capa de inteligencia artificial del sistema. |
| Vercel | Plataforma de despliegue (hosting) de la aplicación web. |


---
*Fin del documento.*
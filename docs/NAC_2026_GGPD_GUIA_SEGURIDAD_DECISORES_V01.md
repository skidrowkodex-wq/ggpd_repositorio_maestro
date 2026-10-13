# REPÚBLICA BOLIVARIANA DE VENEZUELA
# MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)
# CORPORACIÓN ELÉCTRICA NACIONAL, S.A. (CORPOELEC)
## GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)

---

```text
====================================================================================================
GUÍA PEDAGÓGICA DE SEGURIDAD PARA DECISORES Y DUEÑOS DE LA PLATAFORMA (LENGUAJE SENCILLO)
====================================================================================================
CÓDIGO INSTITUCIONAL : GGPD-SGM-GUD-001 (v1.0 ISO)
NOMENCLATURA ARCHIVO : NAC_2026_GGPD_GUIA_SEGURIDAD_DECISORES_V01.md
CÓDIGO DOCUMENTAL    : DOC-GGPD-2026-SEC-GUID-001
DIRIGIDO A           : Ministros y Viceministros | Gerentes Generales | Dueños funcionales de la plataforma
                       (audiencia de alto nivel, NO técnica — no requiere ser de ATIT)
CLASIFICACIÓN        : USO INSTITUCIONAL AMPLIO · Contenido pedagógico (sin secretos técnicos)
AUTOR / ELABORACIÓN  : Equipo de Automatización, Analítica de Datos e Inteligencia Artificial (GGPD)
MARCO NORMATIVO      : ISO/IEC 27001:2022 · ISO 55000/55001 · ISO 8000-110 · ISO 9001:2015
FECHA DE EMISIÓN     : 12 de Octubre de 2026
ÚLTIMA ACTUALIZACIÓN : 12 de Octubre de 2026 — 2.º ciclo de seguridad completado (8 apps blindadas y verificadas)
ESTADO DE APLICACIÓN : Vigente · Material de preparación para reuniones de alto nivel
====================================================================================================
```

---

## 📋 1. IDENTIFICACIÓN Y CONTROL DEL DOCUMENTO

| Parámetro Institucional | Especificación |
| :--- | :--- |
| **Organización Emisora:** | Corporación Eléctrica Nacional, S.A. (CORPOELEC) |
| **Órgano Rector / Adscripción:** | Ministerio del Poder Popular para la Energía Eléctrica (MPPEE) |
| **Gerencia Responsable:** | Gerencia General de Planificación de Distribución (GGPD) |
| **Título del Instrumento:** | **Guía Pedagógica de Seguridad para Decisores y Dueños de la Plataforma SEN** |
| **Naturaleza del Documento:** | Instrumento de **educación y preparación**: explica en lenguaje sencillo cómo quedó asegurada la plataforma, qué decir en reuniones de alto nivel y cómo responder preguntas frecuentes **sin necesidad de ser especialista técnico**. |
| **Clasificación:** | **USO INSTITUCIONAL AMPLIO** — no contiene claves, contraseñas ni detalles de vulnerabilidades. Puede circular libremente en reuniones. |
| **Código Nomenclatura Oficial:** | `NAC_2026_GGPD_GUIA_SEGURIDAD_DECISORES_V01` (Base `GGPD-SGM-GUD-001 v1.0 ISO`) |
| **Fecha de Aprobación:** | 12 de Octubre de 2026 |
| **Próxima Revisión Ordinaria:** | Cada 6 meses o tras cambio significativo de arquitectura |
| **Aprobado y Autorizado por:** | Gerencia General de Planificación de Distribución (GGPD) |

---

## 📄 2. RESUMEN EJECUTIVO — LO QUE CUALQUIER DECISOR DEBE SABER (1 PÁGINA)

> **¿La plataforma del SEN está segura? → Sí, y esto es lo esencial para responderlo con propiedad.**

**Qué tenemos:**
* **Ocho (8) aplicaciones estratégicas del SEN** — SIGAD, SIGA-SEN, SIGI, SCTIS, SCMTP, SCPPE, SCEIN y SCGCC — que concentran la información real de la red eléctrica nacional (activos, tiras de interrupción, planificación, tareas/minutas y correspondencia corporativa) y están desplegadas en la nube de forma oficial.

**Qué se hizo para protegerlas (en una frase):** la aplicación pasó de tener *"la puerta abierta con la llave a la vista"* a tener *"una puerta blindada, con llave personal para cada funcionario y un vigilante que registra cada entrada y cada movimiento"*.

**Los 4 pilares de la protección (para recordar fácil):**
1. **Identidad:** solo entra quien tiene usuario corporativo y contraseña institucional, verificada contra el padrón central (38 cuentas, mismo estilo que el padrón oficial de la Corporación).
2. **Permiso por fila (RLS):** cada usuario ve **solo lo que le corresponde por cargo**; un analista estadal no ve ni puede tocar datos de otra región.
3. **Cifrado y llaves bien guardadas:** todo viaja cifrado (HTTPS); la llave "maestra" de la base de datos ya **no viaja dentro de la aplicación** visible al público; fue **rotada** (renovada) con fecha de expiración controlada.
4. **Registro y trazabilidad:** cada acción queda asociada al funcionario; así se puede auditar qué se hizo, cuándo y por quién.

**Estado de las 8 aplicaciones:** todas las aplicaciones (SIGAD, SIGA-SEN, SIGI, SCTIS, SCMTP, SCPPE, SCEIN y SCGCC) recibieron el **mismo blindaje el 12-10-2026**: renovación de credenciales (sin llave maestra expuesta en el navegador), **permisos por fila activos (RLS)** y **autenticación centralizada** contra el padrón oficial. Ninguna quedó en «fase de espera»: las 8 están verificadas.

**Compromiso de integridad:** se ejecutaron **dos ciclos de prueba de penetración (pentest) autorizados y no destructivos el 12-10-2026** (PENT-001: SIGAD/SIGA-SEN · PENT-002: las 6 aplicaciones restantes), bajo reglas de enfrentamiento estrictas. Ambos ciclos se **cerraron con la remediación ejecutada** (permisos por fila, autenticación centralizada y rotación de la llave maestra) y sus reportes están a disposición de ATIT y Auditoría. **No ocultamos nada: decimos qué está hecho y qué sigue** (rotación de una credencial en el proyecto BCI y saneamiento documental).

---

## 🎯 3. OBJETIVO DE ESTA GUÍA

Que los **decisores** y **dueños de la plataforma** puedan:
1. **Entender** cómo quedó asegurada la aplicación, sin necesidad de ser ingenieros de sistemas.
2. **Defender** el tema de seguridad en reuniones de alto nivel (Ministros, Gerentes Generales, auditorías), **desde su nivel** de responsabilidad.
3. **Responder** preguntas frecuentes con seguridad y honestidad (incluida la de *"¿ya le hicieron pruebas de penetración?"*).

---

## 🏫 4. EXPLICACIÓN PEDAGÓGICA — COMO QUEDÓ SEGURA LA APLICACIÓN

### 4.1. La analogía de la bóveda bancaria 🏦

Imaginemos que los datos del SEN (subestaciones, circuitos, horas de interrupción) son el **dinero** de un banco.

| Antes (riesgo corregido) | Ahora (estado actual) |
| :--- | :--- |
| La **llave maestra** del banco estaba colgada en la puerta de entrada (visitable por cualquiera que abriera la aplicación). | La llave maestra **se retiró de la puerta** y se guardó en la cámara central; a la puerta solo llegan **llaves de visitante** (públicas, sin poderes especiales). |
| Cualquiera que abriera la puerta podía **ver y tocar todo** (incluso el padrón interno de empleados). | Cada empleado tiene su **credencial propia** y solo ve **su bóveda asignada** (su estado, su región). |
| No quedaba registro de quién entró. | Hay un **vigilante electrónico** que **anota cada visita** y cada movimiento; se auditan eventos. |
| La puerta se abría con **una sola contraseña genérica** compartida. | La puerta pide **usuario corporativo + contraseña institucional**, validados contra el padrón central. |

### 4.2. Las 4 cerraduras (capas de seguridad)

1. **Cerradura 1 — Persona (Login):** la aplicación exige identificarse. Nadie entra "de incógnito"; el sistema además **bloquea tras varios intentos fallidos** (como un cajero que se traga la tarjeta).
2. **Cerradura 2 — Permiso (Lo que cada uno puede ver):** la base de datos está programada para que **cada función vea solo sus filas**. Un plano de una subestación de un estado **no aparece** para quien no tiene ese territorio asignado.
3. **Cerradura 3 — Cifrado (Conducto seguro):** toda la información viaja **cifrada** entre la oficina y la nube; una copia leída "por el camino" no sirve porque está codificada.
4. **Cerradura 4 — Llaves (Secretos bien guardados):** las credenciales especiales de la base de datos **se renovaron** y **se retiraron del código visible**; ahora solo queda en el navegador una credencial pública sin poderes administrativos.

### 4.3. ¿Qué pasa si falla internet? (Contingencia local)

Existe un **modo de contingencia local**: si la conexión a la nube se cae (apagón de comunicación), la instalación puede operar en **modo local** contra una base de datos interna, con **las mismas credenciales institucionales** y el **mismo registro de auditoría**. No se "abre" por emergencia: la seguridad se mantiene.

---

## 🗣️ 5. MENSAJES CLAVE PARA REUNIONES DE ALTO NIVEL (TALKING POINTS)

> Frases listas para usar, alineadas con la evidencia técnica del reporte:

1. **"Las ocho aplicaciones estratégicas del SEN fueron blindadas bajo el estándar ISO/IEC 27001 — el estándar internacional de seguridad de la información —, eliminando los riesgos críticos identificados en la auditoría."**
2. **"Retiramos la llave maestra de la vista pública: las credenciales de administración ya no viajan dentro de la aplicación que ve el ciudadano; se rotaron y quedaron bajo control institucional."**
3. **"Cada funcionario accede con su credencial corporativa y solamente ve la información de su competencia territorial. Todo queda registrado y auditable."**
4. **"Hemos sido rigurosos y transparentes: ejecutamos dos ciclos de prueba de penetración autorizados y no destructivos el 12-10-2026 y cerramos los hallazgos; el protocolo formal queda listo para futuros retests con un equipo acreditado."**
5. **"Esto no es un módulo más: es la plataforma de datos del SEN con Inteligencia Artificial, en la que la seguridad es condición de base para su institucionalización en las salas situacionales de las 24 entidades federales."**

---

## ❓ 6. PREGUNTAS FRECUENTES EN REUNIONES (FAQ) Y RESPUESTAS SUGERIDAS

**P1. ¿Ya le hicieron un pentest (pruebas de ataque)?**
→ *"Sí. El 12-10-2026 ejecutamos **dos ciclos de pentest autorizados y no destructivos** (uno sobre SIGAD/SIGA-SEN y otro sobre las 6 aplicaciones restantes), usando solo la credencial pública que vería un atacante y sin tocar datos reales. Los hallazgos críticos se **corrigieron y cerraron** ese mismo día (permisos por fila, autenticación centralizada y rotación de la llave maestra). Los reportes están disponibles para ATIT y Auditoría."* (Honestidad = credibilidad.)

**P2. ¿Alguien de afuera puede ver la base de datos, como antes?**
→ *"No. Antes la aplicación incluía una credencial administrativa visible en el código del navegador — era un riesgo real. Ya se retiró y se rotó. El navegador solo emplea una credencial pública sin privilegios de administración, y la base de datos tiene reglas por fila que limitan cada consulta."*

**P3. ¿Podría un funcionario ver datos de otros estados?**
→ *"Los permisos están definidos por cargo y territorio (RLS). La base de datos está configurada para ocultar filas ajenas; las vistas federadas no exponen la lógica interna. Y cada modificación queda asociada al funcionario."*

**P4. ¿Qué pasa si se pierde la conexión con la nube?**
→ *"Existe modo de contingencia local con las mismas credenciales y auditoría; la operación puede continuar sin internet sin degradar la seguridad."*

**P5. ¿Quién vigila que nadie haga un uso indebido?**
→ *"El sistema registra eventos (enfoque COBIT MEA02) y las acciones de mutación quedan trazadas al identificador del funcionario, habilitando auditoría interna y sanciones administrativas con evidencia."*

**P6. ¿Y las otras seis aplicaciones?**
→ *"Quedaron blindadas el mismo 12-10-2026 con el mismo estándar que SIGAD y SIGA-SEN (credencial pública sin privilegios, permisos por fila activos y login contra el padrón central), y fueron verificadas con el **segundo ciclo de pentest (PENT-002)**, también cerrado."*

---

## 🎓 7. SECCIÓN DE APRENDIZAJE (AUTO-EVALUACIÓN PARA EL DECISOR)

> Para prepararse en 5 minutos antes de una reunión. Responda mentalmente:

1. **¿Cuántas aplicaciones del SEN quedaron blindadas y verificadas?** → *Las 8: SIGAD, SIGA-SEN, SIGI, SCTIS, SCMTP, SCPPE, SCEIN y SCGCC.*
2. **¿Cuántos usuarios hay en el padrón central?** → *38 cuentas institucionales (bcrypt, no texto plano).*
3. **¿Qué elimina el riesgo de "vernos todo"?** → *La política de permisos por fila (RLS): cada usuario ve solo su competencia.*
4. **¿Qué se hizo con la llave maestra expuesta?** → *Se retiró de todos los bundles y se rotó (renovada, con vencimiento controlado el 15-10-2026).*
5. **¿Qué se responde si preguntan por pentest?** → *Ver FAQ P1: dos ciclos ejecutados y cerrados el 12-10-2026; protocolo listo para retests con equipo acreditado.*
6. **¿Modo contingencia sin internet?** → *Sí: modo local con las mismas credenciales y auditoría.*

**Regla de oro del decisor:** *"No invento números ni prometo lo que no está hecho: digo qué está blindado, qué se verificó y qué sigue (el pentest formal bajo protocolo)."*

---

## 📌 8. REFERENCIAS Y ACCESO

* **Reporte técnico detallado (para ATIT/auditoría):** `docs/NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md`.
* **Pruebas de penetración ejecutadas (12-10-2026):**
  * `docs/NAC_2026_GGPD_PENTEST_SIGAD_SIGASEN_V01.md` (GGPD-SGM-PENT-001 · SIGAD/SIGA-SEN).
  * `docs/NAC_2026_GGPD_PENTEST_SEIS_APPS_V01.md` (GGPD-SGM-PENT-002 · las 6 aplicaciones restantes) — ambos **cerrados con remediación ejecutada**.
* **Postura consolidada de las 8 apps:** `docs/NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01.md`.
* **Instructivos operativos:** `NAC_2026_GGPD_INS_OPERATIVO_SIGAD_V01.md` y `NAC_2026_GGPD_INS_OPERATIVO_SIGA_SEN_V01.md` (incluyen rutas de acceso a la nube).
* **Acceso real de la plataforma (producción):**
  * SIGAD: https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space
  * SIGA-SEN: https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space

---

*Fin del documento — NAC_2026_GGPD_GUIA_SEGURIDAD_DECISORES_V01 · Rev. 0 · 2026-10-12 · GGPD.*
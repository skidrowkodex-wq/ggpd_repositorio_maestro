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
* Dos aplicaciones estratégicas — **SIGAD** (activos de distribución) y **SIGA-SEN** (activos del SEN) — que ya concentran la información real de la red eléctrica nacional y están desplegadas en la nube de forma oficial.

**Qué se hizo para protegerlas (en una frase):** la aplicación pasó de tener *"la puerta abierta con la llave a la vista"* a tener *"una puerta blindada, con llave personal para cada funcionario y un vigilante que registra cada entrada y cada movimiento"*.

**Los 4 pilares de la protección (para recordar fácil):**
1. **Identidad:** solo entra quien tiene usuario corporativo y contraseña institucional, verificada contra el padrón central (38 cuentas, mismo estilo que el padrón oficial de la Corporación).
2. **Permiso por fila (RLS):** cada usuario ve **solo lo que le corresponde por cargo**; un analista estadal no ve ni puede tocar datos de otra región.
3. **Cifrado y llaves bien guardadas:** todo viaja cifrado (HTTPS); la llave "maestra" de la base de datos ya **no viaja dentro de la aplicación** visible al público; fue **rotada** (renovada) con fecha de expiración controlada.
4. **Registro y trazabilidad:** cada acción queda asociada al funcionario; así se puede auditar qué se hizo, cuándo y por quién.

**Estado de las demás aplicaciones:** las otras 6 aplicaciones (SIGI, SCTIS, SCMTP, SCPPE, SCEIN, SCGCC) ya recibieron la **renovación de credenciales** (sin llave maestra expuesta en el navegador) y están en **fase de aseguramiento de calidad (QA)** para replicar el mismo nivel de blindaje de SIGAD y SIGA-SEN.

**Compromiso de integridad:** en esta fase se hicieron **pruebas de verificación internas** (acceso, permisos, cifrado). No se han realizado pruebas de "ataque" (pentest) sobre los sistemas desplegados; para ello ya existe un **protocolo formal aprobado en el reporte técnico**, listo para ejecutarse con un equipo acreditado cuando la institución lo disponga. **No ocultamos nada: decimos qué está hecho y qué sigue.**

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

1. **"La plataforma SIGAD y SIGA-SEN fueron blindadas bajo el estándar ISO/IEC 27001 — el estándar internacional de seguridad de la información —, eliminando los riesgos críticos identificados en la auditoría."**
2. **"Retiramos la llave maestra de la vista pública: las credenciales de administración ya no viajan dentro de la aplicación que ve el ciudadano; se rotaron y quedaron bajo control institucional."**
3. **"Cada funcionario accede con su credencial corporativa y solamente ve la información de su competencia territorial. Todo queda registrado y auditable."**
4. **"Hemos sido rigurosos y transparentes: se ejecutaron verificaciones internas y existe un protocolo formal aprobado para la prueba de penetración independiente, listo para cuando la institución lo disponga con un equipo acreditado."**
5. **"Esto no es un módulo más: es la plataforma de datos del SEN con Inteligencia Artificial, en la que la seguridad es condición de base para su institucionalización en las salas situacionales de las 24 entidades federales."**

---

## ❓ 6. PREGUNTAS FRECUENTES EN REUNIONES (FAQ) Y RESPUESTAS SUGERIDAS

**P1. ¿Ya le hicieron un pentest (pruebas de ataque)?**
→ *"No hemos ejecutado pruebas ofensivas sobre los sistemas desplegados, por política de no experimentar sobre el sistema en producción sin autorización. Sí realizamos una auditoría y verificación interna exhaustiva (accesos, permisos, cifrado, respuestas del servidor). El protocolo formal de pentest ya está redactado y aprobado en el reporte técnico, listo para ejecutarse con un equipo acreditado y bajo reglas claras."* (Honestidad = credibilidad.)

**P2. ¿Alguien de afuera puede ver la base de datos, como antes?**
→ *"No. Antes la aplicación incluía una credencial administrativa visible en el código del navegador — era un riesgo real. Ya se retiró y se rotó. El navegador solo emplea una credencial pública sin privilegios de administración, y la base de datos tiene reglas por fila que limitan cada consulta."*

**P3. ¿Podría un funcionario ver datos de otros estados?**
→ *"Los permisos están definidos por cargo y territorio (RLS). La base de datos está configurada para ocultar filas ajenas; las vistas federadas no exponen la lógica interna. Y cada modificación queda asociada al funcionario."*

**P4. ¿Qué pasa si se pierde la conexión con la nube?**
→ *"Existe modo de contingencia local con las mismas credenciales y auditoría; la operación puede continuar sin internet sin degradar la seguridad."*

**P5. ¿Quién vigila que nadie haga un uso indebido?**
→ *"El sistema registra eventos (enfoque COBIT MEA02) y las acciones de mutación quedan trazadas al identificador del funcionario, habilitando auditoría interna y sanciones administrativas con evidencia."*

**P6. ¿Y las otras seis aplicaciones?**
→ *"Ya recibieron la renovación de credenciales (sin llave maestra expuesta) y están en fase de QA para replicar el mismo blindaje de SIGAD y SIGA-SEN, que es nuestro patrón de referencia."*

---

## 🎓 7. SECCIÓN DE APRENDIZAJE (AUTO-EVALUACIÓN PARA EL DECISOR)

> Para prepararse en 5 minutos antes de una reunión. Responda mentalmente:

1. **¿Cuáles son las dos aplicaciones de prioridad nacional ya blindadas?** → *SIGAD (activos de distribución) y SIGA-SEN (activos del SEN).*
2. **¿Cuántos usuarios hay en el padrón central?** → *38 cuentas institucionales (bcrypt, no texto plano).*
3. **¿Qué elimina el riesgo de "vernos todo"?** → *La política de permisos por fila (RLS): cada usuario ve solo su competencia.*
4. **¿Qué se hizo con la llave maestra expuesta?** → *Se retiró del bundle y se rotó (renovada, con vencimiento controlado el 15-10-2026).*
5. **¿Qué se responde si preguntan por pentest?** → *Ver FAQ P1: verificación interna hecha, protocolo formal listo, ejecución con equipo acreditado cuando la institución lo disponga.*
6. **¿Modo contingencia sin internet?** → *Sí: modo local con las mismas credenciales y auditoría.*

**Regla de oro del decisor:** *"No invento números ni prometo lo que no está hecho: digo qué está blindado, qué se verificó y qué sigue (el pentest formal bajo protocolo)."*

---

## 📌 8. REFERENCIAS Y ACCESO

* **Reporte técnico detallado (para ATIT/auditoría):** `docs/NAC_2026_GGPD_REPORTE_SEGURIDAD_SIGAD_SIGASEN_V01.md`.
* **Prueba de penetración ejecutada (12-10-2026):** `docs/NAC_2026_GGPD_PENTEST_SIGAD_SIGASEN_V01.md` — para decisores: «se ejecutó el **primer ciclo de pentest autorizado, no destructivo**, con plan de retest; sin hallazgos críticos».
* **Postura consolidada de las 8 apps:** `docs/NAC_2026_GGPD_REPORTE_SEGURIDAD_8_APLICACIONES_V01.md`.
* **Instructivos operativos:** `NAC_2026_GGPD_INS_OPERATIVO_SIGAD_V01.md` y `NAC_2026_GGPD_INS_OPERATIVO_SIGA_SEN_V01.md` (incluyen rutas de acceso a la nube).
* **Acceso real de la plataforma (producción):**
  * SIGAD: https://corpoelec-sigad-corpoelec-ggpd-hosting-apps.vibehost.space
  * SIGA-SEN: https://corpoelec-siga-sen-corpoelec-ggpd-hosting-apps.vibehost.space

---

*Fin del documento — NAC_2026_GGPD_GUIA_SEGURIDAD_DECISORES_V01 · Rev. 0 · 2026-10-12 · GGPD.*
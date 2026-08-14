# INFORME TÉCNICO NORMATIVO ISO / DIRECTIVA DE GOBIERNO TIC

```
========================================================================================================
REPÚBLICA BOLIVARIANA DE VENEZUELA
MINISTERIO DEL PODER POPULAR PARA LA ENERGÍA ELÉCTRICA (MPPEE)
CORPORACIÓN ELÉCTRICA NACIONAL S.A. (CORPOELEC)
GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD)
========================================================================================================
CÓDIGO NORMATIVO:       GGPD-DIR-ISO-2026-008
NOMENCLATURA MAESTRA:   NAC_2026_GGPD_INFORME_ARQUITECTURA_GOBERNANZA_ACCESOS_SIGI_V01.md
CLASIFICACIÓN:          CONFIDENCIAL / USO INSTITUCIONAL EXCLUSIVO
ESTÁNDARES APLICADOS:   ISO/IEC 27001:2022 (A.9 / A.9.4.2), ISO 8000-110, ISACA COBIT 2019 (DSS05 / DSS06)
FECHA DE ENTRADA EN VIGOR: 15 DE AGOSTO DE 2026
VERSIÓN:                1.0 (REVISIÓN EJECUTIVA)
RESPONSABLE:            ÁREA DE TECNOLOGÍA, DESARROLLO Y ARQUITECTURA DIGITAL (GGPD)
========================================================================================================
```

---

## 1. CONTROL DE IDENTIFICACIÓN Y TRAZABILIDAD DOCUMENTAL (ISO 9001 / ISO 27001)

| Metadato Técnico | Especificación Institucional |
| :--- | :--- |
| **Título Oficial** | Directiva de Gobernanza, Gestión de Accesos y Arquitectura de Autenticación No Invasiva del SIGI |
| **Órgano Emisor** | Gerencia General de Planificación de Distribución (GGPD) |
| **Órganos Destinatarios** | Coordinaciones Generales de Área, Jefaturas de División, Salas Situacionales Regionales (25 Estados) |
| **Nivel de Seguridad** | Nivel 3 - Datos de Infraestructura Crítica del Sistema Eléctrico Nacional (SEN) |
| **Régimen de Auditoría** | Semestral / Supervisión de Logs Cifrados y Roles RBAC |

---

## 2. EXPOSICIÓN DE MOTIVOS Y ALCANCE ESTRATÉGICO

En cumplimiento de las directrices del **Ministerio del Poder Popular para la Energía Eléctrica (MPPEE)** y el **Plan de la Patria**, la Gerencia General de Planificación de Distribución (GGPD) ha dispuesto la consolidación del **SIGI (Sistema Integrado de Gestión de la Información)** como el epicentro unificado de gobernanza de datos y administración de identidades para el **Repositorio Maestro de Distribución**.

El inicio de la **Fase de Aseguramiento de Calidad (QA) y Pruebas Operativas (15 de Agosto de 2026)** demanda un modelo de gestión que combine:
1. **Cero impacto y cero disrupción operativa** sobre los desarrollos y despliegues ya ejecutados.
2. **Centralización soberana de accesos y padrón de usuarios** en el SIGI.
3. **Cumplimiento estricto de los estándares internacionales de seguridad** (ISO 27001) y calidad de datos (ISO 8000).

---

## 3. ARQUITECTURA DE AUTENTICACIÓN NO INVASIVA: PRINCIPIO DE DESACOPLAMIENTO

Para garantizar la estabilidad de los procesos sin interferir con los cronogramas de entrega de las aplicaciones operativas, se establece el siguiente **Modelo Arquitectural Desacoplado**:

```
+----------------------------------------------------------------------------------------------------+
|                                      PORTAL CORPORATIVO SIGI                                       |
|             (Sistema Integrado de Gestión de la Información - Gerencia General GGPD)               |
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   |                       MÓDULO DE GOBIERNO E IDENTIDADES MAESTRAS (IAM)                      |   |
|   |   • Catálogo Centralizado de Usuarios (24 Estados + Guayana Esequiba + Nivel Central)      |   |
|   |   • Matriz RBAC (Visor, Operador, Analista, Gerencia, Administrador)                      |   |
|   |   • Control de Políticas de Contraseñas Robustas ISO 27001 (ej. admin2026!., Correa2026!.)|   |
|   |   • Auditoría y Trazabilidad de Accesos en Tiempo Real                                     |   |
|   +--------------------------------------------------------------------------------------------+   |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                         (Navegación / Lanzador Unificado de Grado Industrial)
                                                  |
           +--------------------+-----------------+--------------------+--------------------+
           |                    |                                      |                    |
           v                    v                                      v                    v
+--------------------+ +--------------------------------+ +--------------------+ +--------------------+
|    SCTIS V 2.0     | |        SGTA MINUTAS            | |  PLANIFICACIÓN SEN | |    REMIX SCEIN     |
| (Interrupciones)   | |     (Tareas y Acuerdos)        | |  (Proyectos / POA) | | (Equipos Indisp.)  |
|                    | |                                | |                    |                    |
| • Despliegue Indep.| | • Despliegue Independiente     | | • Despliegue Indep.| | • Despliegue Indep.|
| • Auth Local intact| | • Auth Local intacta           | | • Auth Local intact| | • Auth Local intact|
| • Credenciales QA: | | • Credenciales QA:             | | • Credenciales QA: | | • Credenciales QA: |
|   Lunes35., etc.   | |   Usuarios @asignados          | |   Pacheco2026., etc| |   Lunes35., etc.   |
+--------------------+ +--------------------------------+ +--------------------+ +--------------------+
```

### 3.1. Premisas Fundamentales del Modelo
1. **Preservación Total del Código Fuente de las Aplicaciones Satélites:** Las cuatro (4) aplicaciones maestras (**SCTIS**, **Gestor de Tareas y Minutas**, **Planificación POA/PRTSEN** y **REMIX SCEIN**) mantienen inalterados sus esquemas de autenticación local, rutas API y despliegues en servidores independientes.
2. **El SIGI como Repositorio de la Verdad (Single Source of Truth):** El SIGI mantiene el registro integral y actualizado de todo el personal que interviene en la operación nacional, asociando sus roles, correos corporativos y permisos a nivel de módulo.
3. **Acceso Dual de Contingencia durante la Fase de QA:**
   - **Acceso Vía SIGI (Canal Oficial):** Permite al usuario autenticarse en el portal institucional con sus credenciales robustecidas y operar con visión unificada del SEN.
   - **Acceso Vía Enlaces Externos Directos (Canal de Respaldo):** Permite a los equipos especializados acceder a sus herramientas específicas utilizando las credenciales iniciales notificadas en el Memorándum `GGPD-SGM-INS-005`.

---

## 4. MATRIZ DE CUENTAS DE USUARIO Y GESTIÓN DE ROLES (RBAC)

A continuación se detalla la configuración y homologación de perfiles corporativos entre el SIGI y las herramientas operativas:

### 4.1. Cuentas de Nivel Directivo y Administración Central

| Usuario (`username`) | Nombre Completo | Rol SIGI | Clave Institucional SIGI | Clave Apps Satélite (Memo QA) | Cobertura Operativa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ggpd_admin`** | Administrador General GGPD | `ADMINISTRADOR` | `admin2026!.` | `Lunes35.` | Acceso Global a las 5 Aplicaciones |
| **`a_correa`** | Adrian Correa | `GERENCIA` | `Correa2026!.` | `Correa2026.` | Planificación Estratégica, POA y Minutas |
| **`j_pacheco`** | Josue Pacheco | `ADMINISTRADOR` | `Pacheco2026!.` | `Pacheco2026.` | Tecnología, Backend y Control Nacional |
| **`c_favio`** | Catherina Favio | `ADMINISTRADOR` | `Favio2026!.` | `Favio2026.` | Ingesta SCTIS, Minutas y Planificación |

### 4.2. Cuentas de Coordinaciones Territoriales (25 Entidades)

* **Formato de Contraseña Institucional SIGI:** `[NombreEstado]2026!.` (Ejemplos: `Tachira2026!.`, `Zulia2026!.`, `Miranda2026!.`, `Esequibo2026!.`).
* **Ámbito:** Acceso acotado a los circuitos, subestaciones e interrupciones pertenecientes a su jurisdicción territorial (Filtro por `StateCode`).

---

## 5. BENEFICIOS Y CUMPLIMIENTO DE MARCOS INTERNACIONALES

| Estándar Internacional | Cláusula / Control | Impacto en la Implementación |
| :--- | :--- | :--- |
| **ISO/IEC 27001:2022** | **A.9.2 / A.9.4:** Gestión de accesos y contraseñas | Estandarización de claves con complejidad criptográfica (`!.`), erradicando contraseñas por defecto o inseguras. |
| **ISO 8000-110** | **Calidad de Datos:** Trazabilidad e Identidad | Cada registro de falla, minuta o equipo indisponible queda vinculado a un operador plenamente identificado. |
| **ISACA COBIT 2019** | **DSS05 / DSS06:** Seguridad y Gestión de Procesos | Registro de auditoría centralizado en SIGI para inspecciones de conformidad interna y externa. |
| **Directiva Zero-WhatsApp** | **Soberanía y Seguridad de Datos** | Sustitución de canales no corporativos por flujos de trabajo centralizados en la nube de CORPOELEC. |

---

## 6. INSTRUCCIONES OPERATIVAS PARA LA COMUNICACIÓN DE QA (15 DE AGOSTO)

1. **Instrucción a Coordinadores de Área:** Se ratifica el contenido del Memorándum `GGPD-SGM-INS-005`. Los enlaces y credenciales distribuidos para cada una de las 4 aplicaciones continúan plenamente operativos y válidos.
2. **Promoción del SIGI como Plataforma Oficial:** Se instruye a los líderes de equipo a priorizar el ingreso a través del SIGI (`https://ais-dev-nejbftsy5s2im6wuwazryk-254934984747.us-west1.run.app`), donde encontrarán el consolidado nacional y acceso asistido.
3. **Mantenimiento y Administración Continua:** Cualquier incorporación de nuevos analistas territoriales o modificación de privilegios será tramitada exclusivamente a través del módulo de **Gestión de Usuarios del SIGI**.

---

```
========================================================================================================
DOCUMENTO APROBADO PARA SU SINCRONIZACIÓN Y ARCHIVO INSTITUCIONAL
GERENCIA GENERAL DE PLANIFICACIÓN DE DISTRIBUCIÓN (GGPD) — CORPOELEC
========================================================================================================
```

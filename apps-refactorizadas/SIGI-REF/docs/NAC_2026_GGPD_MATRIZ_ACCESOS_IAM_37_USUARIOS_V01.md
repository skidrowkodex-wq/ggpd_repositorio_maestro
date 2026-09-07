# NAC_2026_GGPD_MATRIZ_ACCESOS_IAM_37_USUARIOS_V01

**Repositorio Maestro CORPOELEC (GGPD)** · Gestión de Accesos y Credenciales Canónicas IAM

> **Clasificación:** USO RESTRINGIDO INTERNO · **Normativa:** ISO/IEC 27001:2022 · ISO 8000-110 · OWASP ASVS v4.0 · ISACA COBIT 2019 (MEA02)

---

## 1. Resumen Ejecutivo

La matriz única de accesos IAM de las **seis (6) aplicaciones refactorizadas** del Repositorio Maestro GGPD (SCGCC · SIGI · SCMTP · SCPPE · SCEIN · SCTIS) se gestiona de forma **centralizada en InsForge** (`ggpd-data-maestra-0002`) mediante la tabla maestra `core.mae_usuarios_sistema` y la RPC única `public.verificar_credencial_sistema(p_identifier, p_password, p_app)` — **una sola clave institucional por usuario**, válida en todas las apps donde tenga permiso. Un mismo usuario inicia sesión con el **mismo usuario y contraseña** en las aplicaciones a las que está autorizado; el permiso por aplicación se valida en el servidor.

Contiene **37 cuentas** habilitadas (estatus `ACTIVO`).

## 2. Patrón Canónico de Credenciales

| Tipo de cuenta | Usuario | Contraseña |
|---|---|---|
| Administrador General GGPD | `admin.ggpd` | `admin2026!.` |
| Cuentas personales | `nombre.apellido` | `Apellido2026!.` |
| Cuentas estadales (Coordinación de Distribución) | `distribucion.<estado>` | `<Estado>2026!.` |

> **Regla de desambiguación de homónimos (migración 07 IAM):** la primera persona registrada conserva `nombre.apellido`; la segunda homónima recibe `nombre.apellido2`; la tercera `nombre.apellido3`, y así sucesivamente. La **cédula de identidad** (`core.mae_usuarios_sistema.cedula`, UNIQUE) es el ancla canónica de identidad (ISO 8000-110) que distingue a dos personas con el mismo nombre. El generador `public.sugerir_username_unico` propone el username único en tiempo real (desde SIGI) al registrar usuarios.

## 3. RPC Única de Verificación de Credenciales

```text
POST /api/database/rpc/verificar_credencial_sistema
Body: { "p_identifier": "<usuario | correo | cédula>", "p_password": "<clave>", "p_app": "SCGCC|SIGI|SCMTP|SCPPE|SCEIN|SCTIS" }

-> Valida: cuenta ACTIVA + permiso por aplicación + hash bcrypt (pgcrypto).
-> Audita ultimo_acceso y devuelve SOLO campos seguros (nunca el hash).
```

## 4. Matriz de Accesos de los 37 Usuarios

**Leyenda de permiso por app:** `SCGCC` (Correspondencia) · `SIGI` (Consola Central) · `SCMTP` (Tareas/Minutas) · `SCPPE` (Planificación SEN) · `SCEIN` (Equipos Indisponibles) · `SCTIS` (Tiras de Interrupción).

| # | Usuario | Nombre Completo | Rol | Cargo / Unidad | Contraseña | SCGCC | SIGI | SCMTP | SCPPE | SCEIN | SCTIS | Verif¹ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `admin.ggpd` | Administrador General GGPD | ADMINISTRADOR | Administrador de Sistemas · Gerencia General de Planificación de Distribución | `admin2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | ✔ |
| 2 | `adrian.correa` | Ing. Adrián Correa | GERENCIA | Gerente General de Planificación de Distribución · Gerencia General de Planificación de Distribución (GGPD) | `Correa2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | ✔ |
| 3 | `blanca.gonzalez` | Blanca González | ANALISTA | Analista de Gestión · Asistencia de Gerencia General | `Gonzalez2026!.` | Sí | Sí | Sí | — | — | — | ✔ |
| 4 | `carlos.mendoza` | Carlos Mendoza | OPERADOR | Operador de Despacho · Centro de Despacho Capital | `Mendoza2026!.` | — | Sí | — | — | — | Sí | — |
| 5 | `catherina.favio` | Catherina Favio | GERENCIA | Jefe de División de Planificación · División de Planificación de Distribución | `Favio2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | ✔ |
| 6 | `diana.rivero` | Diana Rivero | ANALISTA | Analista de Estadísticas y Reportes · Planificación y Control de Gestión | `Rivero2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | — |
| 7 | `distribucion.amazonas` | Coordinación de Distribución Amazonas | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Amazonas2026!.` | — | Sí | Sí | Sí | — | Sí | ✔ |
| 8 | `distribucion.anzoategui` | Coordinación de Distribución Anzoátegui | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Anzoategui2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 9 | `distribucion.apure` | Coordinación de Distribución Apure | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Apure2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 10 | `distribucion.aragua` | Coordinación de Distribución Aragua | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Aragua2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 11 | `distribucion.barinas` | Coordinación de Distribución Barinas | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Barinas2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 12 | `distribucion.bolivar` | Coordinación de Distribución Bolívar | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Bolivar2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 13 | `distribucion.carabobo` | Coordinación de Distribución Carabobo | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Carabobo2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 14 | `distribucion.cojedes` | Coordinación de Distribución Cojedes | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Cojedes2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 15 | `distribucion.deltaamacuro` | Coordinación de Distribución Delta Amacuro | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Deltaamacuro2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 16 | `distribucion.distritocapital` | Coordinación de Distribución Distrito Capital | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Distritocapital2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 17 | `distribucion.esequibo` | Coordinación de Distribución Guayana Esequiba | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Esequibo2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 18 | `distribucion.falcon` | Coordinación de Distribución Falcón | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Falcon2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 19 | `distribucion.guarico` | Coordinación de Distribución Guárico | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Guarico2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 20 | `distribucion.laguaira` | Coordinación de Distribución La Guaira | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Laguaira2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 21 | `distribucion.lara` | Coordinación de Distribución Lara | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Lara2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 22 | `distribucion.merida` | Coordinación de Distribución Mérida | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Merida2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 23 | `distribucion.miranda` | Coordinación de Distribución Miranda | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Miranda2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 24 | `distribucion.monagas` | Coordinación de Distribución Monagas | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Monagas2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 25 | `distribucion.nuevaesparta` | Coordinación de Distribución Nueva Esparta | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Nuevaesparta2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 26 | `distribucion.portuguesa` | Coordinación de Distribución Portuguesa | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Portuguesa2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 27 | `distribucion.sucre` | Coordinación de Distribución Sucre | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Sucre2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 28 | `distribucion.tachira` | Coordinación de Distribución Táchira | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Tachira2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 29 | `distribucion.trujillo` | Coordinación de Distribución Trujillo | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Trujillo2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 30 | `distribucion.yaracuy` | Coordinación de Distribución Yaracuy | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Yaracuy2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 31 | `distribucion.zulia` | Coordinación de Distribución Zulia | VISOR_ESTADAL | Coordinador Estadal de Distribución · Coordinación Estadal de Distribución | `Zulia2026!.` | — | Sí | Sí | Sí | — | Sí | — |
| 32 | `jaime.bencomo` | Jaime Bencomo | ESPECIALISTA | Especialista de Redes · Redes de Distribución / PRTSEN | `Bencomo2026!.` | Sí | Sí | Sí | Sí | — | Sí | — |
| 33 | `jorge.jimenez` | Ing. Jorge Jiménez | GERENCIA | Gerente de Operaciones · Gerencia de Operaciones del SEN | `Jimenez2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | — |
| 34 | `josue.pacheco` | T.S.U. Josué Pacheco | ADMINISTRADOR | Ingeniero de Automatización y Desarrollo · Equipo de Automatización e Ingeniería de Productos con IA | `Pacheco2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | ✔ |
| 35 | `marina.torres` | Marina Torres | AUDITOR | Auditora Líder ISO 27001 / COBIT · Unidad de Auditoría Interna y Cumplimiento Normativo | `Torres2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | — |
| 36 | `walter.prato` | Walter Prato | ESPECIALISTA | Especialista de Planificación · División de Planificación | `Prato2026!.` | Sí | Sí | Sí | Sí | — | — | — |
| 37 | `yvan.cipiran` | Yván M. Cipiran N. | ADMINISTRADOR | Líder de Arquitectura e Inteligencia Artificial · Equipo de Automatización e Ingeniería de Productos con IA | `Cipiran2026!.` | Sí | Sí | Sí | Sí | Sí | Sí | ✔ |

¹ **Verif:** ✔ = credencial validada end-to-end contra la RPC de producción. El resto sigue el patrón canónico y se recomienda verificar en la primera auditoría de accesos.

## 5. Cuentas con Acceso Total (6 aplicaciones)

Solo **4 cuentas** poseen los seis (6) permisos de aplicación a la vez:

| Usuario | Nombre |
|---|---|
| `admin.ggpd` | Administrador General GGPD |
| `adrian.correa` | Ing. Adrián Correa (Gerente General GGPD) |
| `josue.pacheco` | T.S.U. Josué Pacheco (Automatización e IA) |
| `yvan.cipiran` | Yván M. Cipiran N. (Arquitectura e IA) |

Las cuentas estadales `distribucion.<estado>` tienen acceso a SIGI/SCTIS/SCMTP/SCPPE y NO a SCEIN/SCGCC.

## 6. Gobernanza, Auditoría y Seguridad

- **Kill-switch:** suspender (`status != ACTIVO`) bloquea login inmediato en las 6 apps (validado por la RPC).
- **Matriz por app:** los permisos se otorgan por columna `permiso_<app>`; el rechazo por app es verificable (`blanca.gonzalez` sin SCTIS devuelve *"cuenta sin permiso para esta aplicación"*).
- **Auditoría:** la RPC registra `ultimo_acceso`; SIGI registra eventos ISO 27001 (otorgar/revocar/kill-switch).
- **Credenciales:** hash bcrypt exclusivamente (-`$2`); nunca texto plano ni exposición del hash.
- **Calidad ISO 8000-110:** username, email y cédula son UNIQUE; desambiguación automática de homónimos con la RPC `sugerir_username_unico`.

---

_Documento generado el 07-Sep-2026 · Fuente: `core.mae_usuarios_sistema` (InsForge ggpd-data-maestra-0002) · Repositorio Maestro CORPOELEC GGPD._

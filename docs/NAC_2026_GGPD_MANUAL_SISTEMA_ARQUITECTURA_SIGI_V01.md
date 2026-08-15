# MANUAL TÉCNICO Y DE ARQUITECTURA: SISTEMA INTEGRADO DE GESTIÓN Y PLANIFICACIÓN DE DISTRIBUCIÓN (SIGI)

**NOMENCLATURA NORMATIVA:** `NAC_2026_GGPD_MANUAL_SISTEMA_ARQUITECTURA_SIGI_V01.md`  
**CÓDIGO INSTRUCTIVO INSTITUCIONAL:** GGPD-SGM-INS-005 (v3.0 ISO)  
**FECHA DE EMISIÓN:** 14 de Agosto de 2026  
**PROPIEDAD:** Corporación Eléctrica Nacional (CORPOELEC) — Gerencia General de Planificación de Distribución (GGPD)  
**ESTÁNDARES DE CUMPLIMIENTO:** ISO 8000-110, ISO 9001:2015, ISO 55000/55001, ISO/IEC 27001:2022 e ISACA COBIT 2019  

---

## 🏛️ 1. INTRODUCCIÓN Y ALCANCE ESTRATÉGICO

El **Sistema Integrado de Gestión y Planificación de Distribución (SIGI)** constituye la plataforma central, integradora y portal maestro de la **Gerencia General de Planificación de Distribución (GGPD)** de CORPOELEC.

El SIGI articula el ecosistema tecnológico unificando la gobernanza de datos de las cuatro (4) aplicaciones estratégicas del Sistema Eléctrico Nacional (SEN), los recursos de almacenamiento seguro en la nube (Google Cloud Drive), las automatizaciones en vivo mediante webhooks, y el monitoreo gerencial en tiempo real de las 25 entidades territoriales del país.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          PORTAL MAESTRO CENTRAL SIGI (CORPOELEC)                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐               │
│   │ ⚡ SCTIS V2.0       │   │ 🏭 SCEIN V3.0       │   │ 📈 SCPPE V3.0       │               │
│   │ Interrupciones & ENS│   │ Equipos Indisp. S/E │   │ Planes, POA & Viát. │               │
│   └──────────┬──────────┘   └──────────┬──────────┘   └──────────┬──────────┘               │
│              │                         │                         │                          │
│              └─────────────────────────┼─────────────────────────┘                          │
│                                        ▼                                                    │
│                       ┌─────────────────────────────────┐                                   │
│                       │ 📋 SCMTP V2.0                   │                                   │
│                       │ Minutas, Tareas & Acuerdos GGPD │                                   │
│                       └────────────────┬────────────────┘                                   │
│                                        │                                                    │
│              ┌─────────────────────────┴─────────────────────────┐                          │
│              ▼                                                   ▼                          │
│   ┌─────────────────────┐                             ┌─────────────────────┐               │
│   │ ☁️ GOOGLE DRIVE      │                             │ 🤖 WEBHOOKS NUBE    │               │
│   │ Repositorio Oficial │                             │ Orquestación Apps   │               │
│   └─────────────────────┘                             └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 2. ARQUITECTURA VISUAL: "CORPOELEC INDUSTRIAL GLASSMORPHISM"

La interfaz del SIGI implementa el estándar visual institucional de alta ingeniería diseñado para salas de control y despachos operativos:

1. **Paleta Base Corporativa:**
   * **Modo Oscuro (Dark Theme):** Fondo Azul Medianoche Profundo (`#041426`, `#072146`, `#002b49`) con tarjetas flotantes en vidrio esmerilado (`#0b172c` / `#0c1626`) y bordes nítidos `border-slate-800`.
   * **Modo Claro (Light Theme):** Fondos blancos y grises de alta luminiscencia (`#f8fafc` / `#f1f5f9`) con tarjetas blancas puras y bordes `border-slate-200`.
2. **Matriz de Puntos Reflectivos:** Micro-patrón técnico en banners (`bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)]`) que evoca telemetría de subestaciones.
3. **Chevrons Reflectivos de Ingeniería:** Marcas de agua angulares en los laterales de módulos y tarjetas.
4. **Badge Oficial CORPOELEC:** Contenedor blanco nítido con el logotipo oficial de CORPOELEC elongado horizontalmente un 5% (`scale-x-[1.05]`) para máxima fidelidad gráfica.
5. **Tipografía Técnica:** *Inter* para textos administrativos y *Roboto Mono / JetBrains Mono* para códigos de activos, cifras de potencia (kVA / MVA), energía (MWh) y porcentajes.

---

## 🔐 3. ARQUITECTURA DE AUTENTICACIÓN Y REGLAS DE NEGOCIO (RBAC)

El SIGI implementa un modelo de **Control de Acceso Basado en Roles (RBAC)** y **Single Sign-On (SSO)** conforme a **ISO/IEC 27001:2022** e **ISACA COBIT 2019**:

### Regla 1: Acceso Total Automatizado para Administradores y Gerencia
* Usuarios con rol `ADMINISTRADOR` o `GERENCIA` (ej. `ggpd_admin`, `j_pacheco`, `a_correa`, `c_favio`) poseen acceso irrestricto y sin fricción a todas las aplicaciones maestras, consolas de webhook y repositorios.
* Al hacer clic en *"Ejecutar Aplicación"*, el sistema genera un enlace SSO transparente (`?sso=true&user=...&role=...&state=...`) que los autentica en las aplicaciones satélites sin solicitar contraseñas adicionales.

### Regla 2: Acceso Condicionado a Aplicaciones para Especialistas y Operadores de Estado
* Los usuarios con rol `ESPECIALISTA`, `ANALISTA` u `OPERADOR` asignados a una entidad federal (ej. `w_prato` [Miranda], `j_bencomo` [Carabobo], `r_cipiran` [Zulia]) solo pueden ejecutar aquellas aplicaciones para las cuales hayan sido **expresamente autorizados** por un Administrador en su ficha de usuario.
* Si el permiso está activo, ingresan vía SSO directo con su estado preseleccionado. Si no está activo, la tarjeta muestra el candado institucional (`🔒 Requiere Permiso`) con opción de solicitar acceso a la Gerencia.

### Regla 3: Aislamiento Operativo de Cuentas Estadales de Solo Visualización (`coord_*`)
* Las 25 cuentas nominales de coordinación estadal (ej. `coord_capital`, `coord_tachira`, `coord_zulia`) poseen el rol exclusivo `VISOR_ESTADAL`.
* Están configuradas exclusivamente para **consultar tableros, indicadores, mapas de activos y minutas consolidadas dentro del SIGI**, con todos los accesos a aplicaciones maestras transaccionales externas bloqueados (`permissions: false`), garantizando que no se puedan modificar registros operativos de forma anónima o no trazable.

### Regla 4: Fijación Territorial Automática (State-Lock)
* La jurisdicción territorial se resuelve automáticamente a partir del perfil del usuario autenticado (`matchedUser.stateCode`).
* Se erradica el ComboBox manual de selección de estado en el login, impidiendo que un usuario suplante o visualice por error una coordinación ajena a la asignada.

### Regla 5: Blindaje de Credenciales y Trazabilidad ISO 27001
* Eliminación total de contraseñas visibles en pantalla y botones de acceso rápido pre-rellenados.
* Formulario estandarizado de dos campos: **Usuario Corporativo** y **Contraseña Institucional** (con botón de alternancia ver/ocultar).
* Registro criptográfico inmutable de todos los intentos de acceso autorizados y denegados en la bitácora de auditoría (`logSecurityAuditEvent`).

---

## 🚀 4. MAPA DE MÓDULOS DEL SIGI

| Módulo / Sección | Identificador | Descripción Funcional | Nivel de Acceso |
| :--- | :--- | :--- | :--- |
| **1. Landing Showcase SEN** | `landing` | Portada institucional ejecutiva, métricas de alto impacto (2,480+ circuitos, -45% MTTR), gemelo digital y enlace directo a sistemas. | Público / Todos |
| **2. Lanzador de Aplicaciones** | `launcher` | Catálogo centralizado de las 4 aplicaciones maestras, Google Cloud Drive y Consola de Automatizaciones Nube con soporte SSO. | Todos (con RBAC) |
| **3. Tableros & Mapa de Activos** | `dashboards` | Visor geoespacial interactivo de las 838 Subestaciones y circuitos por Estado, con métricas consolidadas de SCTIS, SCEIN y SCPPE. | Todos los usuarios |
| **4. Repositorio de Minutas** | `minutario` | Buscador y visualizador de minutas de reuniones de planificación, compromisos y acuerdos ministeriales. | Todos los usuarios |
| **5. Gestión de Usuarios & Webhook**| `users` | Panel administrativo de creación de cuentas, asignación de permisos por app, aprobación de solicitudes de Drive y monitoreo del Webhook Google Apps Script. | `ADMINISTRADOR` / `GERENCIA` |

---

## 🔗 5. INTEGRACIÓN Y PROTOCOLO SINGLE SIGN-ON (SSO)

Cuando un usuario autenticado en SIGI pulsa sobre una aplicación satélite, el lanzador invoca la función `getAppLaunchUrl`:

```typescript
const getAppLaunchUrl = (app: AppItem) => {
  if (app.isCloud || app.id === 'gdrive-ggpd' || !app.url.startsWith('http')) {
    return app.url;
  }
  try {
    const urlObj = new URL(app.url);
    if (session.authenticated) {
      urlObj.searchParams.set('sso', 'true');
      urlObj.searchParams.set('sso_auth', 'true');
      const effectiveUser = session.userCode === 'usr-001' 
        ? 'ggpd_admin' 
        : (matchedUser?.username || session.userCode || 'ggpd_admin');
      urlObj.searchParams.set('user', effectiveUser);
      urlObj.searchParams.set('role', session.role);
      urlObj.searchParams.set('state', session.stateCode);
    }
    return urlObj.toString();
  } catch {
    const sep = app.url.includes('?') ? '&' : '?';
    return `${app.url}${sep}sso=true&sso_auth=true&user=${encodeURIComponent(session.userCode || 'ggpd_admin')}&role=${encodeURIComponent(session.role)}&state=${encodeURIComponent(session.stateCode)}`;
  }
};
```

Las aplicaciones receptoras (`SCPPE V3.0`, `SCMTP V2.0`, `SCEIN V3.0`, `SCTIS V2.0`) leen estos parámetros en su arranque y fijan la sesión de forma inmediata.

---

## 🌐 6. INTEGRACIÓN NUBE GOOGLE DRIVE & WEBHOOK OFICIAL

* **Cuenta Oficial de Almacenamiento:** `bk.ggpd.corpoelec@gmail.com`
* **ID de Carpeta Raíz Google Drive:** `1mnnChue2IUqOh5Or99_v2LiJ3TaRJvy7`
* **Endpoint Webhook Google Apps Script:** `https://script.google.com/macros/s/AKfycbxonVU31GBXuVCfu_5G8hmADkYFB7yriPJVt2nS9w7uMjsERu5_WPzpQSVbuB2kvtQkqA/exec`
* **Estado Operativo:** Verificado en vivo con `HTTP 200 OK` respondiendo `{ status: "ONLINE", cuenta: "bk.ggpd.corpoelec@gmail.com" }`.

---

## 📂 7. ESPECIFICACIONES TÉCNICAS Y REPOSITORIOS

* **Stack:** React 18, TypeScript 5, Vite 6, Tailwind CSS 3.4, Leaflet Maps, Lucide Icons, Supabase Auth / PostgreSQL.
* **Puerto de Desarrollo Local:** `3001`
* **Repositorio Maestro GGPD:** [`https://github.com/skidrowkodex-wq/ggpd_repositorio_maestro.git`](https://github.com/skidrowkodex-wq/ggpd_repositorio_maestro.git)
* **Repositorio Standalone de Innovación:** [`https://github.com/distribucion-corpoelec-automatizacion/corpoelec-sigi-gestion-planificacion-distribucion.git`](https://github.com/distribucion-corpoelec-automatizacion/corpoelec-sigi-gestion-planificacion-distribucion.git)
* **Autor Git Oficial:** `distribucion-corpoelec-automatizacion <ggpd.automatizacion.corpoelec@gmail.com>`

---

## 📱 8. ARQUITECTURA RESPONSIVA Y ERGONOMÍA MULTI-DISPOSITIVO

La interfaz de usuario del SIGI incorpora un sistema de diseño adaptable de grado industrial optimizado para tres perfiles de pantalla:

| Perfil de Dispositivo | Rango de Resolución | Dimensiones Logo CORPOELEC | Header / Navbar | Experiencia de Navegación |
| :--- | :--- | :--- | :--- | :--- |
| **Escritorio / PC** | `lg+` (1024px – 4K) | `h-5` (20px alto / 88px ancho max) | `h-16` con títulos completos | Sidebar fijo expandible + Mapas `520px` |
| **Tablets** | `sm:` a `md:` (640px – 1023px) | `h-4` (16px alto / 70px ancho max) | `h-14` con título abreviado | Sidebar colapsable + Mapas `460px` |
| **Smartphones Móviles** | `<sm` (320px – 639px) | `h-3.5` (14px alto / 50px ancho max) | `h-12` con SIGI/GGPD badges | Drawer lateral táctil + Bottom Nav fija (`pb-safe`) + Mapas `360px` |

### Principios de Adaptabilidad Implementados:
1. **Anclaje Inflexible de Controles (`shrink-0`):** Los botones de inicio de sesión, conmutador de tema y badges permanecen protegidos contra desbordamientos horizontales.
2. **Safe-Area Insets para Móviles:** Soporte nativo para notch y barras de navegación por gestos en iOS y Android (`viewport-fit=cover`).
3. **Mapas GIS Fluidos:** Los lienzos Leaflet de Subestaciones y Circuitos escalan su altura vertical para permitir desplazamiento natural por la pantalla del celular sin bloquear el scroll del usuario.

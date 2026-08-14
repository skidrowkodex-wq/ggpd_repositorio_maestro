# 🏛️ MANUAL DE ESTILO Y PROMPT UNIVERSAL — GOOGLE AI STUDIO
## Sistema de Diseño Institucional CORPOELEC (GGPD) & Estandarización de Apps

Este documento contiene la arquitectura visual, el sistema de acentos cromáticos por proceso (para evitar el "efecto carnaval" y mantener coherencia corporativa) y el **Prompt Maestro Copiar y Pegar** para actualizar cualquier aplicación en **Google AI Studio**.

---

## 🎨 1. Arquitectura Visual: "CORPOELEC Industrial Glassmorphism"

Para que todas las aplicaciones del SEN luzcan con la misma calidad de alta ingeniería sin perder consistencia, se define una **Base Común Invariable (85%)** y un **Acento de Proceso Específico (15%)**:

### Base Común Invariable (Compartida por el 100% de las Apps):
- **Modo Oscuro Predeterminado:** Fondos en Azul Medianoche Profundo (`#041426`, `#072146`, `#002b49`) combinados con superficies de vidrio esmerilado (`bg-slate-900/80 backdrop-blur-md`).
- **Modo Claro Institucional:** Fondos blancos puros y grises técnicos (`#f8fafc`, `#f1f5f9`) con bordes ultra nítidos (`border-slate-200`).
- **Micro-patrón Industrial:** Matriz de puntos técnicos reflectivos (`bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]`).
- **Chevrons Reflectivos:** Marca de agua técnica con flechas de ingeniería en esquinas de tarjetas y banners.
- **Tipografía:** *Inter / Roboto Mono* para códigos, metadatos y cifras técnicas.
- **Logo Institucional:** Badge blanco de alta resolución con el logo oficial de CORPOELEC elongado +5% (`scale-x-[1.05]`).

---

## 🚦 2. Espectro Cromático por Proceso Operativo (Evitar el "Carnaval")

En lugar de colores arbitrarios, agrupamos las 30+ posibles aplicaciones en **6 Familias Funcionales**, donde cada familia tiene asignada su **Banda Técnica de Proceso** y su acento lumínico:

| Familia Funcional | Aplicaciones de Ejemplo | Color de Acento | Código HEX | Elemento Distintivo en Login |
| :--- | :--- | :--- | :--- | :--- |
| **1. Interrupciones & Redes** | **SCTIS V2.0**, Desconexiones, Tiras de Falla | **Cian Eléctrico** | `#00f2fe` / `#0284c7` | Banda superior Cian con icono de Telemetría/Circuito. |
| **2. Equipos & Subestaciones** | **SCEIN V3.0**, Transformadores, Bahías | **Ámbar Industrial** | `#f59e0b` / `#d97706` | Banda superior Ámbar con icono de Transformador/Alerta. |
| **3. Planificación & Proyectos** | **SCPPE V3.0**, POA, PRTSEN, Viáticos SAMC | **Dorado Energía** | `#eab308` / `#ffd700` | Banda superior Dorada con icono de Gráfica/Metas Físicas. |
| **4. Gobernanza & Minutas** | **SCMTP V2.0**, Minutas, Tareas, Compromisos | **Esmeralda Auditoría** | `#10b981` / `#059669` | Banda superior Esmeralda con icono de Check/COBIT. |
| **5. Comercial & Pérdidas** | Balance de Energía, Facturación, Grandes Usuarios | **Azul Índigo** | `#6366f1` / `#4f46e5` | Banda superior Índigo con icono de Medición. |
| **6. Seguridad & Automatización** | Webhooks Nube, Bots Telegram, Auditoría ISO | **Púrpura Blindado** | `#a855f7` / `#9333ea` | Banda superior Violeta con icono de Escudo/Bot. |

---

## 🔐 3. Estructura del Login Distintivo

En la pantalla de inicio de sesión de cada aplicación satélite:
1. **Banda Superior Reflectiva (Process Strip):** Una franja superior de 4px con el color del proceso (`bg-cyan-500`, `bg-amber-500`, `bg-emerald-500`, etc.).
2. **Badge del Sistema:** Un chip técnico en la cabecera: `[ SCTIS V2.0 · DISTRIBUCIÓN ]` o `[ SCEIN V3.0 · SUBESTACIONES ]`.
3. **Formulario Limpio ISO 27001:** 
   - Campo 1: *Usuario Corporativo*
   - Campo 2: *Contraseña Institucional* (con botón de visibilidad ojo/ojo tachado).
   - Botón de Ingreso: Con el degradado del color de proceso de la aplicación.
4. **Soporte SSO Silencioso:** Si en la URL viene `?sso=true&user=...`, el login se omite y la app ingresa de inmediato.

---

## 📋 4. PROMPT MAESTRO PARA GOOGLE AI STUDIO (Copiar y Pegar)

> **Instrucciones para Google AI Studio:**
> Copia el bloque de texto que está a continuación y pégalo en el chat de Google AI Studio en la app que deseas transformar.

```markdown
Por favor rediseña completamente la interfaz de usuario (UI/UX) de esta aplicación para que adopte el sistema de diseño oficial de alta tecnología "CORPOELEC Industrial Glassmorphism" del Repositorio Maestro GGPD (estilo SIGI).

### 🎯 ESPECIFICACIONES DE IDENTIDAD Y ESTILO:

1. **PALETA BASE CORPORATIVA:**
   - Modo Oscuro: Fondos principales en `#072146`, `#002b49` y `#041426` con tarjetas en `#0b172c` o `#0c1626` y bordes sutiles `border-slate-800`.
   - Modo Claro: Fondos `#f8fafc` / `#f1f5f9` con tarjetas blancas puras `#ffffff` y bordes nítidos `border-slate-200`.
   - Micro-patrón: Integra en los banners superiores la matriz de puntos reflectivos (`bg-[radial-gradient(#00f2fe_1.5px,transparent_1.5px)] [background-size:16px_16px]`) con opacidad sutil (15%).
   - Chevrons: Inserta marcas de agua técnicas con chevrons angulados en los extremos derechos de los banners.

2. **COLOR Y BANDA DISTINTIVA DE ESTA APLICACIÓN:**
   - Asigna el color de acento según la familia funcional de esta app:
     * Si es SCTIS / Interrupciones: Cian Eléctrico (#00f2fe / #0284c7)
     * Si es SCEIN / Subestaciones: Ámbar Industrial (#f59e0b / #d97706)
     * Si es SCPPE / Planificación / POA: Dorado Energía (#eab308 / #ffd700)
     * Si es SCMTP / Minutas / Tareas: Esmeralda Auditoría (#10b981 / #059669)
   - Agrega una "Banda Técnica de Proceso" en el borde superior del modal de Login y un Badge en el Header con el acrónimo oficial y el nombre del proceso.

3. **NAVBAR INSTITUCIONAL:**
   - Contenedor de logo de CORPOELEC con fondo blanco nítido, padding `px-3.5 py-1.5`, esquinas redondeadas `rounded-2xl` y logo oficial elongado horizontalmente un 5% (`scale-x-[1.05]`).
   - Selector de modo Claro/Oscuro (Sun/Moon).
   - Indicador de estado de conexión y badge de versión ISO 8000 / 27001.
   - Perfil de usuario con avatar en chip redondeado y botón de cierre de sesión.

4. **BLINDAJE DEL LOGIN (ISO/IEC 27001):**
   - Retira cualquier botón de acceso rápido con claves escritas en texto claro.
   - Solicita exclusivamente: "Usuario Corporativo" y "Contraseña Institucional" (con botón para alternar ver/ocultar contraseña).
   - Retira selectores innecesarios de Estado en el login (el estado se auto-asigna según el usuario).
   - **Soporte Single Sign-On (SSO):** Al inicializar la app, verifica si existen parámetros URL (`?sso=true&user=...&role=...&state=...`). Si existen, auto-inicia la sesión del usuario inmediatamente sin mostrar el formulario de login.

5. **TABLEROS Y TARJETAS (KPIs & TABLAS):**
   - Tarjetas de indicadores con borde dinámico que reaccione al hover (`hover:border-[#00f2fe]`).
   - Cifras en fuente monoespaciada de alto contraste (`font-mono font-black text-2xl`).
   - Tablas de datos con cabeceras en mayúsculas pequeñas (`text-[11px] font-mono tracking-wider`), filas con hover suave y badges de estado redondeados con borde coloreado.

Mantén intacta toda la lógica de negocio, cálculos y modelos de datos existentes, aplicando esta transformación sobre los componentes visuales (CSS/Tailwind, Header, Login, Sidebar, Tarjetas y Tablas).
```

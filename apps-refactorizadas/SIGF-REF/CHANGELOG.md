# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y
este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.1.0] — 2026-10-15

### Añadido
- **Mapa geopolítico de Venezuela** en el Cuadro de Mando Gerencial (`tab_gerencia`),
  construido 100 % en SVG y **sin dependencias externas**: contorno georreferenciado,
  hidrografía (lago de Maracaibo, Orinoco, delta), retícula, entorno de países vecinos,
  rótulos de agua, rosa de los vientos y escala gráfica de 300 km.
- Nuevo módulo `src/data/venezuelaGeoOutline.ts` con el contorno proyectado mediante la
  **misma función de proyección** que los nodos de Estados y Centros de Servicios
  (alineación exacta), más la tabla de anclajes `ENTITY_LABEL_ANCHORS`.
- **Rotulación permanente** de las entidades federales (25 rótulos) con anclajes
  individuales, líneas guía en las regiones densas y `★ CARACAS` como capital.
- Conmutador de capa **«Rótulos»** (sustituye al antiguo «Esequiba»).
- Guía canónica de la **API de tasa de cambio (USD/EUR)** en el Repositorio Maestro:
  `docs/NAC_2026_GGPD_GUIA_API_TASA_CAMBIO_DOLARAPI_V01.md`.

### Cambiado
- **Tratamiento político del mapa:** el territorio nacional usa relleno uniforme y borde
  sólido. La **Guayana Esequiba** queda integrada con **idéntico tratamiento tipográfico**
  que el resto de las entidades.
- `venezuelaRegions.ts`: `'Estado Guayana Esequiba'` → **`'Guayana Esequiba'`**, lo que
  corrige el rótulo duplicado **«Estado Estado Guayana Esequiba»** del selector de conexión
  territorial (ahora: *«Estado Guayana Esequiba (ESQ) · Tumeremo (Administrativa)»*).
- Leyenda del mapa: «División político-territorial de Venezuela».

### Eliminado
- Del mapa: el grupo `zona-reclamacion`, la trama diagonal, el gradiente del Esequibo, el
  perímetro discontinuo, la línea de frontera administrada, el trazo del río Essequibo y
  los rótulos verticales «ZONA EN RECLAMACIÓN».

### Corregido
- Retrocompatibilidad: alias `'ESTADO GUAYANA ESEQUIBA'` en `regionAdapter.ts` para valores
  previamente persistidos con el nombre antiguo.

### Verificado
- `tsc --noEmit` limpio y `vite build` OK en los dos árboles (`app flota/...` y `SIGF-REF`).
- 26 nodos y 25 rótulos de entidad renderizados, `zona-reclamacion`/`esequibaHatch` ausentes,
  **0 errores de consola**; verificación geométrica sin solapamientos de rótulos.

---

## [1.0.0] — 2026-10-15

### Añadido
- **Módulo de Control de Permisos por Rol (RBAC SEN):** página administrativa
  (`tab_permisos`) con matriz rol × acción para 17 acciones y 4 roles
  (`admin`, `nacional`, `gerente`, `estado`).
- Persistencia híbrida de permisos: caché `localStorage` (`corpoelec_flota_permissions_v1`)
  + sincronización a InsForge (`public.flota_permisos_roles`) — *offline-first*.
- Tabla InsForge `flota_permisos_roles` con RLS y políticas para rol `anon`.
- Registro de auditoría de la acción `CAMBIO_PERMISOS`.
- Imagen corporativa CORPOELEC en el login (`src/assets/logo-corpoelec.png`).
- Documentación: `README.md`, `GUIA_MIGRACION_IA_INSFORGE.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `CODE_OF_CONDUCT.md`.

### Cambiado
- **Login en blanco por defecto:** sin usuario ni estado pre-seleccionados.
- Eliminado del login el bloque "⚡ Seleccionar Perfil" (accesos rápidos).
- Eliminado del header el bloque de marca duplicado (se conserva en el navbar lateral).
- Ajuste del filtro `in.(...)` de InsForge (valores SIN comillas) en `insforgeService.ts`.

### Seguridad
- RLS habilitado en `flota_permisos_roles` (ISO/IEC 27001).
- La columna del rol `admin` permanece bloqueada (control total).

---

<!--
Plantilla:
## [X.Y.Z] — AAAA-MM-DD
### Añadido
### Cambiado
### Corregido
### Eliminado
### Seguridad
-->

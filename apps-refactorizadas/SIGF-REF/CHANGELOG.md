# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y
este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

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

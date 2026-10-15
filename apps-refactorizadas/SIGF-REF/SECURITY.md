# Política de Seguridad — SIGF

## Versiones soportadas

| Versión | Soportada |
| :--- | :--- |
| 1.0.x | ✅ |

## Reporte de vulnerabilidades

**No abras un issue público para reportar vulnerabilidades de seguridad.**

Reporta de forma privada a:

- **Correo:** ggpd.automatizacion.corpoelec@gmail.com
- **Asunto:** `[SECURITY][SIGF] <descripción breve>`

Incluye, si es posible:

1. Descripción de la vulnerabilidad y su impacto.
2. Pasos de reproducción.
3. Versión / commit afectado.
4. Evidencia (capturas, registros) sin datos sensibles.
5. Posible mitigación sugerida.

**Compromiso de respuesta:** acuse de recibo en un máximo de 5 días hábiles.

## Alcance y controles

Este sistema se rige por:

- **ISO/IEC 27001:2022** — Seguridad de la información y sesiones auditadas.
- **OWASP ASVS v4.0 Level 2 / Top 10** — Inyección, XSS, control de acceso.
- **ISACA COBIT 2019 (MEA02)** — Auditoría de eventos.
- **Row Level Security (RLS)** habilitado en las tablas de InsForge.

## Buenas prácticas para el despliegue

- Nunca exponer la *service key* de InsForge en el cliente.
- Mantener las variables sensibles fuera del control de versiones (`.env*`).
- Auditar los cambios de permisos por rol (`CAMBIO_PERMISOS`).

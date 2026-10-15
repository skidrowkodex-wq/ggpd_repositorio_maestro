# Guía de Contribución — SIGF (Sistema de Ingesta y Gestión de Flota)

Gracias por contribuir al **Sistema de Ingesta y Gestión de Flota Vehicular** de CORPOELEC · GGPD.

## Requisitos previos

- Node.js 20 o superior
- Git
- Cuenta autorizada en la organización `distribucion-corpoelec-automatizacion`

## Puesta en marcha

```bash
git clone https://github.com/distribucion-corpoelec-automatizacion/SIGF-REF.git
cd SIGF-REF
npm install
cp .env.example .env.development   # completar variables reales (nunca commitearlas)
npm run dev
```

## Flujo de trabajo (GitFlow simplificado)

1. Actualiza `main`: `git pull origin main`
2. Crea una rama descriptiva:
   - `feat/<descripcion>` — nuevas funcionalidades
   - `fix/<descripcion>` — correcciones
   - `docs/<descripcion>` — documentación
   - `refactor/<descripcion>` — refactorización
3. Realiza cambios **pequeños y atómicos**.
4. Verifica antes de commitear:

   ```bash
   npm run lint     # tsc --noEmit
   npm run build    # vite build
   ```

5. Commit con mensajes claros (se recomienda *Conventional Commits* en español o inglés).
6. Abre un *Pull Request* hacia `main` usando la plantilla.

## Estándares de código

- **TypeScript** estricto; evitar `any` injustificado.
- **React 19** con componentes funcionales y *hooks*.
- **Tailwind CSS v4** para estilos; respetar la identidad institucional.
- No romper objetos existentes: los cambios de esquema de base de datos deben ser **aditivos** (sin `DROP`/`ALTER` destructivos).
- Toda acción crítica debe registrarse en la auditoría (`auditService`).

## Seguridad (obligatorio)

- **Nunca** commitear secretos ni claves (`.env`, `service key`, tokens).
- Solo se permite la clave **pública** `anon` de InsForge en el frontend.
- Reportar vulnerabilidades según [`SECURITY.md`](SECURITY.md), no vía issues públicos.

## Documentación

- Actualizar `README.md`, `CHANGELOG.md` y `handoff.md` cuando corresponda.
- Documentar decisiones de arquitectura relevantes.

## Licencia

Al contribuir aceptas los términos de [`LICENSE`](LICENSE).

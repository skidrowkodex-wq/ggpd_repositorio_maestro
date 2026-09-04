import { PlantillaCorporativa } from '../types';

// NOTA DE REFACTORIZACIÓN (data maestra InsForge):
//  - `INITIAL_CORRESPONDENCIAS` fue ELIMINADO. Las correspondencias provienen SIEMPRE de la base
//    de datos real InsForge (vista `public.v_scgcc_correspondencias_activas` / tabla
//    `scgcc.mae_correspondencias`) vía `src/services/insforgeService.ts`. La app arranca vacía.
//  - `INITIAL_USERS` fue ELIMINADO. La autenticación valida contra la tabla maestra
//    `core.mae_usuarios_sistema` mediante el RPC `verificar_credencial_sistema`
//    (ver `src/lib/authContext.tsx`). No se mantiene directorio local de usuarios.
//  - `CORPORATE_TEMPLATES` se CONSERVA como constantes locales legítimas: son parámetros de
//    negocio/estilo (formatos institucionales 2026), no data operativa transaccional.
export const CORPORATE_TEMPLATES: PlantillaCorporativa[] = [
  {
    id: 'tmpl-01',
    nombre: 'Formato Institucional Memorando Nuevo 2026',
    tipo: 'MEMORANDO',
    tamanoKB: 285.24,
    driveId: '1wv1WyoYHHs1vP2FR1XcEN4l3sryvBXdM',
    driveUrl: 'https://docs.google.com/document/d/1wv1WyoYHHs1vP2FR1XcEN4l3sryvBXdM/edit',
    formato: 'DOCX'
  },
  {
    id: 'tmpl-02',
    nombre: 'Formato Institucional Oficio Nuevo 2026',
    tipo: 'OFICIO',
    tamanoKB: 282.65,
    driveId: '1jhVJLpE3fHf7ccSRVNDK7ADFdDEfRGVW',
    driveUrl: 'https://docs.google.com/document/d/1jhVJLpE3fHf7ccSRVNDK7ADFdDEfRGVW/edit',
    formato: 'DOCX'
  },
  {
    id: 'tmpl-03',
    nombre: 'Formato Planilla de Vacaciones Nuevo Logo 2026',
    tipo: 'VACACIONES',
    tamanoKB: 289.60,
    driveId: '1G2Dup6mOLXjjgsEDmXmpm_UE9Dcer4tl',
    driveUrl: 'https://docs.google.com/document/d/1G2Dup6mOLXjjgsEDmXmpm_UE9Dcer4tl/edit',
    formato: 'DOCX'
  }
];
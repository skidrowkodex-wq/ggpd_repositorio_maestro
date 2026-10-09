// ==============================================================================
// 🛡️ CORPOELEC - SIGAD: Tipos de Autenticación y Usuarios IAM
// ==============================================================================

export type UserRole = 'ADMIN_NACIONAL' | 'ANALISTA_ESTATAL' | 'AUDITOR';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  state_code: string | null;  // 'TA', 'ZU', 'DCA', etc. o null para nacional
  is_active: boolean;
  last_login_at?: string | null;
}

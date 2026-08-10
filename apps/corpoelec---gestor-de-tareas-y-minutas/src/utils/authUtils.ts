import { TareaCompromiso, UserProfile } from '../types';

/**
 * Checks if a task is assigned to the current user or if the user has full access (admin/supervisor).
 * - Admin and Supervisor: Can see all commitments.
 * - Analistas / Non-admins: Can ONLY see commitments assigned to them.
 */
export function isTaskAssignedToUser(taskResponsable: string | undefined | null, profile: UserProfile): boolean {
  if (!profile) return false;
  
  // Administrators and Supervisors see EVERYTHING
  if (profile.role === 'admin' || profile.role === 'supervisor') {
    return true;
  }

  if (!taskResponsable || taskResponsable.trim() === '') {
    return false;
  }

  const respLower = taskResponsable.toLowerCase();
  const nameLower = profile.name ? profile.name.toLowerCase() : '';
  const usernameLower = profile.username ? profile.username.toLowerCase() : '';

  // 1. Direct match with full name or username
  if ((nameLower && respLower.includes(nameLower)) || (usernameLower && respLower.includes(usernameLower))) {
    return true;
  }

  // 2. Match individual words in the full name (e.g. "Caterina", "Fabio", "Prato", "Correa")
  if (nameLower) {
    const nameParts = nameLower.split(' ').filter(part => part.length >= 3);
    for (const part of nameParts) {
      if (respLower.includes(part)) {
        return true;
      }
    }
  }

  // 3. Match username suffix (e.g. "c_fabio" -> "fabio", "k_fabio" -> "fabio", "w_prato" -> "prato")
  if (usernameLower) {
    const usernameClean = usernameLower.replace(/^[a-z]_/, '');
    if (usernameClean.length >= 3 && respLower.includes(usernameClean)) {
      return true;
    }
  }

  return false;
}

/**
 * Helper to filter list of compromisos according to user's permissions.
 */
export function getVisibleCompromisos(compromisos: TareaCompromiso[], profile: UserProfile): TareaCompromiso[] {
  if (!profile) return [];
  if (profile.role === 'admin' || profile.role === 'supervisor') {
    return compromisos;
  }
  return compromisos.filter(task => isTaskAssignedToUser(task.responsable, profile));
}

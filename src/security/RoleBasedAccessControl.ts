export type UserRole = 'admin' | 'editor' | 'viewer';

export class RoleBasedAccessControlService {
  public hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    if (userRole === 'admin') {
      return true;
    }
    if (userRole === 'editor' && (requiredRole === 'editor' || requiredRole === 'viewer')) {
      return true;
    }
    if (userRole === 'viewer' && requiredRole === 'viewer') {
      return true;
    }
    return false;
  }
}

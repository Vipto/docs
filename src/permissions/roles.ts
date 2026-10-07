import { UserRole } from '@/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Viewer: 1,
  Editor: 2,
  Admin: 3,
  Owner: 4,
};

export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 1) >= (ROLE_HIERARCHY[requiredRole] || 1);
}

export function canCreatePage(role: UserRole): boolean {
  return hasMinimumRole(role, 'Editor');
}

export function canEditPage(role: UserRole): boolean {
  return hasMinimumRole(role, 'Editor');
}

export function canDeletePage(role: UserRole, isAuthor: boolean = false): boolean {
  if (hasMinimumRole(role, 'Admin')) return true;
  if (isAuthor && hasMinimumRole(role, 'Editor')) return true;
  return false;
}

export function canCreateSpace(role: UserRole): boolean {
  return hasMinimumRole(role, 'Admin');
}

export function canManageSpace(role: UserRole, isSpaceOwner: boolean = false): boolean {
  if (hasMinimumRole(role, 'Admin')) return true;
  if (isSpaceOwner) return true;
  return false;
}

export function canManageMembers(role: UserRole): boolean {
  return hasMinimumRole(role, 'Admin');
}

export function canComment(role: UserRole): boolean {
  return hasMinimumRole(role, 'Viewer'); // Viewers can comment by default
}

export function canUploadAttachment(role: UserRole): boolean {
  return hasMinimumRole(role, 'Editor');
}

export function canViewAuditLogs(role: UserRole): boolean {
  return hasMinimumRole(role, 'Admin');
}

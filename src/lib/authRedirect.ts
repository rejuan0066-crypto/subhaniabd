import { isAdminRole } from '@/lib/roles';

type AuthRedirectState = {
  role: string | null | undefined;
  userStatus: string | null | undefined;
};

type ProtectedRouteState = AuthRedirectState & {
  pathname: string;
};

export const hasResolvedAuthRedirectState = ({ role, userStatus }: AuthRedirectState): boolean => {
  return isAdminRole(role) || typeof userStatus === 'string';
};

export const getAuthenticatedHomePath = ({ role, userStatus }: AuthRedirectState): string => {
  if (isAdminRole(role)) return '/admin';
  if (userStatus === 'pending') return '/waiting-approval';
  return '/staff-dashboard';
};

export const getProtectedRouteRedirect = ({ pathname, role, userStatus }: ProtectedRouteState): string | null => {
  if (!hasResolvedAuthRedirectState({ role, userStatus })) {
    return null;
  }

  if (userStatus === 'pending' && !isAdminRole(role)) {
    return pathname === '/waiting-approval' ? null : '/waiting-approval';
  }

  if (isAdminRole(role)) {
    return pathname === '/staff-dashboard' ? '/admin' : null;
  }

  if (pathname.startsWith('/admin')) {
    return '/staff-dashboard';
  }

  return null;
};

export const getWaitingApprovalRedirect = ({ role, userStatus }: AuthRedirectState): string | null => {
  if (!hasResolvedAuthRedirectState({ role, userStatus })) {
    return null;
  }

  if (isAdminRole(role) || userStatus === 'pending') {
    return null;
  }

  return '/staff-dashboard';
};
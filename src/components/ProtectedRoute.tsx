import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/PageLoader';
import { getProtectedRouteRedirect, hasResolvedAuthRedirectState } from '@/lib/authRedirect';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, role, userStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasResolvedAuthRedirectState({ role, userStatus })) {
    return <PageLoader />;
  }

  const redirectPath = getProtectedRouteRedirect({
    pathname: location.pathname,
    role,
    userStatus,
  });

  if (redirectPath && redirectPath !== location.pathname) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

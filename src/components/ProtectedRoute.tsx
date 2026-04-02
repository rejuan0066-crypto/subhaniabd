import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Paths that are always accessible to any authenticated user
const ALWAYS_ALLOWED = [
  '/admin',           // dashboard
  '/admin/profile',   // own profile
];

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, role } = useAuth();
  const { canView, isLoading: permLoading } = usePermissions();
  const location = useLocation();

  // Load dynamic access control from website_settings
  const { data: accessControl, isLoading: acLoading } = useQuery({
    queryKey: ['admin-only-paths'],
    queryFn: async () => {
      const { data } = await supabase
        .from('website_settings')
        .select('value')
        .eq('key', 'admin_only_paths')
        .maybeSingle();
      if (data?.value) {
        const val = data.value as any;
        if (val.access_map && typeof val.access_map === 'object') {
          return { accessMap: val.access_map as Record<string, Record<string, boolean>>, paths: val.paths as string[] || [] };
        }
        if (Array.isArray(val.paths)) {
          return { accessMap: null, paths: val.paths as string[] };
        }
      }
      return null;
    },
    staleTime: 60000,
  });

  if (loading || permLoading || acLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;
  const isAdminRoute = path.startsWith('/admin');

  // Admin has full access
  if (role === 'admin') {
    return <>{children}</>;
  }

  // Non-admin on admin routes: DEFAULT IS BLOCK
  if (isAdminRoute) {
    // Always-allowed paths (dashboard, profile)
    const isAlwaysAllowed = ALWAYS_ALLOWED.some(p => path === p || path.startsWith(p + '/'));
    if (isAlwaysAllowed) {
      return <>{children}</>;
    }

    // For non-admin users: check access control first, then permissions
    if (accessControl?.accessMap) {
      // New format: check per-role access map
      const roleAccess = accessControl.accessMap[path];
      const userBaseRole = role as string;
      const roleAllowed = roleAccess && roleAccess[userBaseRole];
      
      if (!roleAllowed) {
        // Role not allowed by access control - check individual user_permissions
        if (!canView(path)) {
          return <Navigate to="/staff-dashboard" replace />;
        }
      }
      // Role allowed by access control - still check view permission
      if (!canView(path)) {
        return <Navigate to="/staff-dashboard" replace />;
      }
    } else if (accessControl?.paths) {
      // Old format: paths listed = admin-only, non-admin BLOCKED
      const isAdminOnly = accessControl.paths.some(p => path === p || path.startsWith(p + '/'));
      if (isAdminOnly) {
        // Check if user has individual user_permissions override
        if (!canView(path)) {
          return <Navigate to="/staff-dashboard" replace />;
        }
      }
    } else {
      // No access control data loaded - block ALL admin routes for non-admin
      return <Navigate to="/staff-dashboard" replace />;
    }

    // Final safety: if no explicit view permission, block
    if (!canView(path)) {
      return <Navigate to="/staff-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

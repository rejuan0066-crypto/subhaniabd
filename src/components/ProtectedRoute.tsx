import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Non-admin users trying to access admin routes → redirect to staff dashboard
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute && role !== 'admin') {
    // Allow staff/teacher to access specific pages if they have permissions (handled by ModuleGuard)
    // But block admin-only pages like settings, user-management, permissions, etc.
    const staffAllowedPaths = [
      '/admin', '/admin/profile', '/admin/students', '/admin/staff',
      '/admin/divisions', '/admin/subjects', '/admin/results',
      '/admin/notices', '/admin/fees', '/admin/fee-receipts',
      '/admin/expenses', '/admin/donors', '/admin/attendance',
      '/admin/salary', '/admin/reports', '/admin/posts',
      '/admin/resign-letters', '/admin/joining-letters',
      '/admin/admission-letters',
    ];
    
    const isAllowed = staffAllowedPaths.some(p => 
      location.pathname === p || location.pathname.startsWith(p + '/')
    );
    
    if (!isAllowed) {
      return <Navigate to="/staff-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

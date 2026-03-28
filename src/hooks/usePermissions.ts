import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Permission {
  menu_path: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const { role } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      if (!role) return [];
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', role);
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!role,
  });

  const hasPermission = (menuPath: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    // Admin role has full access by default
    if (role === 'admin') return true;

    const perm = permissions.find(p => p.menu_path === menuPath);
    if (!perm) return false;

    switch (action) {
      case 'view': return perm.can_view;
      case 'add': return perm.can_add;
      case 'edit': return perm.can_edit;
      case 'delete': return perm.can_delete;
      default: return false;
    }
  };

  const canView = (menuPath: string) => hasPermission(menuPath, 'view');
  const canAdd = (menuPath: string) => hasPermission(menuPath, 'add');
  const canEdit = (menuPath: string) => hasPermission(menuPath, 'edit');
  const canDelete = (menuPath: string) => hasPermission(menuPath, 'delete');

  return { permissions, isLoading, hasPermission, canView, canAdd, canEdit, canDelete, role };
};

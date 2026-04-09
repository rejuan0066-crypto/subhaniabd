import { createContext, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  userStatus: string | null;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolvePrimaryRole = (roles: Array<string | null | undefined>): string | null => {
  const normalizedRoles = roles.filter((value): value is string => Boolean(value));
  if (normalizedRoles.includes('super_admin')) return 'super_admin';
  if (normalizedRoles.includes('admin')) return 'admin';
  return normalizedRoles[0] ?? null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const fetchedForUser = useRef<string | null>(null);

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setRole(null);
    setUserStatus(null);
    fetchedForUser.current = null;
    setLoading(false);
  };

  const fetchRoleAndStatus = async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (fetchedForUser.current === userId) {
      setLoading(false);
      return;
    }
    fetchedForUser.current = userId;
    setLoading(true);

    try {
      const rolesResult = await supabase.from('user_roles').select('role').eq('user_id', userId);
      if (rolesResult.error) {
        console.error('Failed to fetch user roles:', rolesResult.error);
      }

      const profileResult = await supabase.from('profiles').select('status').eq('id', userId).maybeSingle();
      if (profileResult.error) {
        console.error('Failed to fetch user status:', profileResult.error);
      }

      const resolvedRole = resolvePrimaryRole((rolesResult.data ?? []).map(({ role }) => role));
      setRole(resolvedRole);
      setUserStatus(profileResult.data?.status ?? 'pending');
    } catch (error) {
      console.error('Failed to resolve auth state:', error);
      setRole(null);
      setUserStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const processSession = (nextSession: Session | null, options?: { forceRefetch?: boolean }) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        clearAuthState();
        return;
      }

      if (options?.forceRefetch) {
        fetchedForUser.current = null;
      }

      void fetchRoleAndStatus(nextSession.user.id);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      window.setTimeout(() => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          clearAuthState();
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          return;
        }

        processSession(nextSession, {
          forceRefetch: event === 'SIGNED_IN' || event === 'USER_UPDATED',
        });
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      processSession(currentSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      role,
      userStatus,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        clearAuthState();
      },
    }),
    [user, session, loading, role, userStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

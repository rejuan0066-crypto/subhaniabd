import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  userStatus: string | null; // 'pending' | 'approved'
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

  const fetchRoleAndStatus = async (userId: string) => {
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
    let initialDone = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      // Skip the initial INITIAL_SESSION event — we handle it via getSession below
      if (!initialDone) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        void fetchRoleAndStatus(nextSession.user.id);
      } else {
        setRole(null);
        setUserStatus(null);
        setLoading(false);
      }
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      initialDone = true;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        void fetchRoleAndStatus(currentSession.user.id);
      } else {
        setRole(null);
        setUserStatus(null);
        setLoading(false);
      }
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
        setUser(null);
        setSession(null);
        setRole(null);
        setUserStatus(null);
      },
    }),
    [user, session, loading, role, userStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

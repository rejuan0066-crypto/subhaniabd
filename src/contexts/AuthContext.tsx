import { createContext, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  ready: boolean;
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
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const fetchedForUser = useRef<string | null>(null);

  const clearResolvedUserState = () => {
    fetchedForUser.current = null;
    setProfileLoading(false);
    setRole(null);
    setUserStatus(null);
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    clearResolvedUserState();
    setAuthReady(true);
  };

  useEffect(() => {
    let mounted = true;

    const syncSessionState = (nextSession: Session | null, options?: { resetResolvedUser?: boolean }) => {
      if (!mounted) return;

      if (options?.resetResolvedUser) {
        fetchedForUser.current = null;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        clearResolvedUserState();
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        clearAuthState();
        return;
      }

      syncSessionState(nextSession, {
        resetResolvedUser: event === 'SIGNED_IN' || event === 'USER_UPDATED',
      });
      setAuthReady(true);
    });

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        syncSessionState(currentSession);
        setAuthReady(true);
      })
      .catch((error) => {
        console.error('Failed to restore auth session:', error);
        if (!mounted) return;
        clearAuthState();
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user?.id) {
      setProfileLoading(false);
      return;
    }

    if (fetchedForUser.current === user.id) {
      setProfileLoading(false);
      return;
    }

    let cancelled = false;

    fetchedForUser.current = user.id;
    setProfileLoading(true);

    void (async () => {
      try {
        const rolesResult = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        if (rolesResult.error) {
          console.error('Failed to fetch user roles:', rolesResult.error);
        }

        const profileResult = await supabase.from('profiles').select('status').eq('id', user.id).maybeSingle();
        if (profileResult.error) {
          console.error('Failed to fetch user status:', profileResult.error);
        }

        if (cancelled) return;

        const resolvedRole = resolvePrimaryRole((rolesResult.data ?? []).map(({ role }) => role));
        setRole(resolvedRole);
        setUserStatus(profileResult.data?.status ?? 'pending');
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to resolve auth state:', error);
        setRole(null);
        setUserStatus('pending');
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id]);

  const loading = !authReady || profileLoading;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      ready: authReady,
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
    [authReady, user, session, loading, role, userStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

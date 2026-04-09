import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  const lastHandledAccessToken = useRef<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    const resetResolvedState = () => {
      fetchedForUser.current = null;
      setProfileLoading(false);
      setRole(null);
      setUserStatus(null);
    };

    const clearSessionState = () => {
      if (cancelled) return;
      lastHandledAccessToken.current = null;
      sessionRef.current = null;
      userRef.current = null;
      setSession(null);
      setUser(null);
      resetResolvedState();
      setAuthReady(true);
    };

    const applySession = (nextSession: Session | null) => {
      if (cancelled) return;

      if (!nextSession?.user) {
        clearSessionState();
        return;
      }

      const nextAccessToken = nextSession.access_token ?? null;
      const nextUser = nextSession.user;

      if (
        lastHandledAccessToken.current === nextAccessToken &&
        sessionRef.current?.user?.id === nextUser.id
      ) {
        setAuthReady(true);
        return;
      }

      lastHandledAccessToken.current = nextAccessToken;
      sessionRef.current = nextSession;
      userRef.current = nextUser;
      setSession(nextSession);
      setUser(nextUser);
      setAuthReady(true);
    };

    const restoreSessionSafely = () => {
      void supabase.auth.getSession().then(({ data: { session: restoredSession } }) => {
        if (cancelled) return;
        if (restoredSession?.user) {
          applySession(restoredSession);
          return;
        }
        clearSessionState();
      }).catch((error) => {
        if (cancelled) return;
        console.error('Failed to restore auth session:', error);
        clearSessionState();
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;

      if (event === 'SIGNED_OUT') {
        clearSessionState();
        return;
      }

      if (!nextSession?.user) {
        if (sessionRef.current?.user || userRef.current || lastHandledAccessToken.current) {
          restoreSessionSafely();
          return;
        }

        clearSessionState();
        return;
      }

      applySession(nextSession);
    });

    restoreSessionSafely();

    return () => {
      cancelled = true;
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
        const [rolesResult, profileResult] = await Promise.all([
          supabase.from('user_roles').select('role').eq('user_id', user.id),
          supabase.from('profiles').select('status').eq('id', user.id).maybeSingle(),
        ]);

        if (rolesResult.error) {
          console.error('Failed to fetch user roles:', rolesResult.error);
        }

        if (profileResult.error) {
          console.error('Failed to fetch user status:', profileResult.error);
        }

        if (cancelled) return;

        setRole(resolvePrimaryRole((rolesResult.data ?? []).map(({ role }) => role)));
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
      },
    }),
    [authReady, user, session, loading, role, userStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

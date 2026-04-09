import { createContext, useEffect, useMemo, useState, useRef, useCallback, type ReactNode } from 'react';
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
  const processingEvent = useRef(false);
  const lastEventTime = useRef(0);

  const clearResolvedUserState = useCallback(() => {
    fetchedForUser.current = null;
    setProfileLoading(false);
    setRole(null);
    setUserStatus(null);
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    fetchedForUser.current = null;
    setProfileLoading(false);
    setRole(null);
    setUserStatus(null);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialSessionHandled = false;

    const applySession = (nextSession: Session | null, isNewLogin: boolean) => {
      if (!mounted) return;

      // Debounce: ignore events that come within 100ms of each other
      const now = Date.now();
      if (now - lastEventTime.current < 100 && !isNewLogin) {
        return;
      }
      lastEventTime.current = now;

      // Prevent re-entrant processing
      if (processingEvent.current && !isNewLogin) return;
      processingEvent.current = true;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        clearResolvedUserState();
      } else if (isNewLogin) {
        // Only reset profile fetch for genuinely new logins
        fetchedForUser.current = null;
      }

      setAuthReady(true);
      processingEvent.current = false;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        clearAuthState();
        return;
      }

      // Only treat SIGNED_IN as a new login if we don't already have a user,
      // or if it's a different user. TOKEN_REFRESHED should never reset profile.
      const isNewLogin =
        (event === 'SIGNED_IN' && (!user || user.id !== nextSession?.user?.id)) ||
        event === 'USER_UPDATED';

      // If initial session was already handled and this is just a token refresh, skip heavy processing
      if (initialSessionHandled && event === 'SIGNED_IN' && user?.id === nextSession?.user?.id) {
        // Just update session/token silently without triggering profile refetch
        setSession(nextSession);
        return;
      }

      applySession(nextSession, isNewLogin);
    });

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!mounted) return;
        initialSessionHandled = true;
        applySession(currentSession, true);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [authReady, user, session, loading, role, userStatus, clearAuthState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

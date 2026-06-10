import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

/* ────────────────────────────────────────────── */
/*  Types                                         */
/* ────────────────────────────────────────────── */

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/* ────────────────────────────────────────────── */
/*  Context                                       */
/* ────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* ────────────────────────────────────────────── */
/*  Helper – build a User from Supabase session   */
/* ────────────────────────────────────────────── */

const mapSessionToUser = (session: Session | null): User | null => {
  if (!session?.user) return null;

  const { user: supaUser } = session;
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    full_name:
      (supaUser.user_metadata?.full_name as string) ??
      (supaUser.user_metadata?.name as string) ??
      '',
    avatar_url: (supaUser.user_metadata?.avatar_url as string) ?? undefined,
    created_at: supaUser.created_at,
    updated_at: supaUser.updated_at ?? supaUser.created_at,
  };
};

/* ────────────────────────────────────────────── */
/*  Provider                                      */
/* ────────────────────────────────────────────── */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Listen to auth changes ───────────────── */
  useEffect(() => {
    // Get current session on mount
    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(mapSessionToUser(currentSession));
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(mapSessionToUser(newSession));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ── Google OAuth ──────────────────────────── */
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  }, []);

  /* ── Email sign-in ─────────────────────────── */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }, []);

  /* ── Email sign-up ─────────────────────────── */
  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
    },
    [],
  );

  /* ── Sign out ──────────────────────────────── */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setSession(null);
    setUser(null);
  }, []);

  /* ── Value ─────────────────────────────────── */
  const value: AuthContextValue = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ────────────────────────────────────────────── */
/*  Hook                                          */
/* ────────────────────────────────────────────── */

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

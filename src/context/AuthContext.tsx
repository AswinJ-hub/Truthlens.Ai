import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Theme } from '@/lib/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<Theme>('dark');

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t);
    setThemeState(t);
  };

  const fetchProfile = async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      console.error('profile fetch error', error);
      return null;
    }
    if (!data) {
      // create profile on first sign-in
      const { data: created, error: insertErr } = await supabase
        .from('profiles')
        .insert({ id: uid })
        .select('*')
        .maybeSingle();
      if (insertErr) {
        console.error('profile create error', insertErr);
        return null;
      }
      return created as Profile;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) {
      setProfile(p);
      applyTheme(p.theme);
    }
  };

  const setTheme = async (t: Theme) => {
    applyTheme(t);
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: t, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) console.error('theme update error', error);
      setProfile((prev) => (prev ? { ...prev, theme: t } : prev));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id).then((p) => {
          if (!mounted) return;
          setProfile(p);
          if (p) applyTheme(p.theme);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id).then((p) => {
            if (!mounted) return;
            setProfile(p);
            if (p) applyTheme(p.theme);
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, theme, setTheme, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

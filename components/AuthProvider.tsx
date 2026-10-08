"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase-browser";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  credits: number;
  refreshCredits: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const supabase = createBrowserSupabase();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function authedFetch(url: string) {
    const current = (await supabase.auth.getSession()).data.session;
    if (!current) return null;
    return fetch(url, { headers: { Authorization: `Bearer ${current.access_token}` } });
  }

  async function refreshCredits() {
    const r = await authedFetch("/api/me");
    if (r?.ok) {
      const d = await r.json();
      setCredits(d.profile?.credits || 0);
    }
  }

  useEffect(() => {
    if (session) refreshCredits();
    else setCredits(0);
  }, [session]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const value = useMemo(() => ({ session, loading, credits, refreshCredits, logout }), [session, loading, credits]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export async function getBrowserSession() {
  return (await supabase.auth.getSession()).data.session;
}

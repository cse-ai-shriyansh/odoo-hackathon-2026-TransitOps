"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSession, login as loginRequest, logout as logoutRequest, type LoginInput } from "@/lib/api/auth";
import type { AuthSession, UserRole } from "@/types/domain";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_STORAGE_KEY = "transitops-session";

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (storedSession) {
      setSession(JSON.parse(storedSession) as AuthSession);
      setIsLoading(false);
      return;
    }

    getSession()
      .then((currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput): Promise<void> {
    const currentSession = await loginRequest(input);
    setSession(currentSession);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  }

  async function logout(): Promise<void> {
    await logoutRequest();
    setSession(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      login,
      logout,
      hasRole: (roles: UserRole[]) => Boolean(session && roles.includes(session.user.role))
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

"use client";

import type { PropsWithChildren } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import type { AuthStatus } from "../domain/types";
import { AUTH_TOKEN_KEY, clearAuthToken, readAuthToken, writeAuthToken } from "../infrastructure/authStorage";

export interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("unknown");

  useEffect(() => {
    const t = readAuthToken();
    queueMicrotask(() => {
      setTokenState(t);
      setStatus(t ? "authenticated" : "anonymous");
    });
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== AUTH_TOKEN_KEY) return;
      const next = readAuthToken();
      setTokenState(next);
      setStatus(next ? "authenticated" : "anonymous");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setToken = useCallback((next: string | null) => {
    if (typeof next === "string" && next.trim().length > 0) {
      writeAuthToken(next);
      setTokenState(next);
      setStatus("authenticated");
      return;
    }
    clearAuthToken();
    setTokenState(null);
    setStatus("anonymous");
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setTokenState(null);
    setStatus("anonymous");
  }, []);

  const value: AuthContextValue = useMemo(() => ({ status, token, setToken, logout }), [status, token, setToken, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}








"use client";

import { useCallback, useState } from "react";

import { login } from "@/lib/api";
import { clearTokens, isAuthenticated, setTokens } from "@/lib/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const authenticated = isAuthenticated();

  const signIn = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await login(username, password);
      setTokens(data);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
  }, []);

  return {
    loading,
    authenticated,
    signIn,
    signOut,
  };
}

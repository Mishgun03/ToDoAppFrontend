"use client";

import { useMemo, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken, decodeToken } from "./auth";

const emptySubscribe = () => () => {};

export function useAuth() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const token = hydrated ? getToken() : null;

  const decoded = useMemo(() => {
    if (!token) return null;
    return decodeToken(token);
  }, [token]);

  const logout = useCallback(() => {
    clearToken();
    router.push("/login");
  }, [router]);

  return {
    token,
    userId: decoded?.sub ?? null,
    username: decoded?.username ?? null,
    isAuthenticated: !!token,
    logout,
  };
}

"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken, decodeToken } from "./auth";

export function useAuth() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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

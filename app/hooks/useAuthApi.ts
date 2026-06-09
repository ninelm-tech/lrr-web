/**
 * useAuthApi
 * ----------
 * All authentication and user-management API calls.
 *
 * Covers:
 *  - Login / logout / session helpers
 *  - Customer registration
 *  - Operator registration (POST /operators — returns no token, pending-approval)
 *  - List users (admin/super-admin only)
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type { User, UserRole, RegisterOperatorRequest } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserListItem {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserListResult {
  data: UserListItem[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ListUsersOptions {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Auth ─────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      if (data.accessToken && data.user) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userRole",    data.user.role);
        localStorage.setItem("userName",    data.user.name ?? "");
        document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
      }
      return data as { accessToken: string; user: User };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    document.cookie = "lrr_session=; path=/; max-age=0; SameSite=Lax";
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("accessToken"));
  }, []);

  const getStoredRole = useCallback((): UserRole | null => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("userRole") as UserRole) ?? null;
  }, []);

  const getStoredUser = useCallback((): Omit<User, "id" | "email"> & { id: ""; email: "" } | null => {
    if (typeof window === "undefined") return null;
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole") as UserRole | null;
    if (!name || !role) return null;
    return { id: "", email: "", name, role };
  }, []);

  // ── Registration ─────────────────────────────────────────────────────────

  /** Customer self-registration — phone required, email+password optional. */
  const registerCustomer = useCallback(async (data: {
    phoneNumber: string;
    name?: string;
    email?: string;
    password?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/register/customer", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      if (res.accessToken && res.user) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("userRole",    res.user.role);
        localStorage.setItem("userName",    res.user.name ?? res.user.phoneNumber ?? "Customer");
        document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
      }
      return res as { accessToken: string; user: User };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Operator registration — no auto-login, returns pending status. */
  const registerOperator = useCallback(async (data: RegisterOperatorRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch("/operators", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Admin: User management ────────────────────────────────────────────────

  const listUsers = useCallback(async (opts: ListUsersOptions = {}): Promise<UserListResult> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.role)   params.append("role",   opts.role);
      if (opts.search) params.append("search", opts.search);
      if (opts.page)   params.append("page",   String(opts.page));
      if (opts.limit)  params.append("limit",  String(opts.limit));
      const qs = params.toString();
      return await apiFetch(`/auth/users${qs ? `?${qs}` : ""}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to list users";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Auth
    login,
    logout,
    isAuthenticated,
    getStoredRole,
    getStoredUser,
    // Registration
    registerCustomer,
    registerOperator,
    // Admin
    listUsers,
  };
}

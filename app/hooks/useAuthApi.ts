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
import { AUTH_CHANGED_EVENT } from "./useAuthState";
import { toNigerianApiPhoneNumber, toNigerianDisplayPhoneNumber } from "../utils/phoneValidation";
import type { User, UserRole, RegisterOperatorRequest } from "../types";

/** Notify same-tab listeners (landing nav, etc.) that auth state changed. */
function emitAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

function resolveDisplayName(user: { name?: string | null; phoneNumber?: string | null; email?: string | null }, fallback = "User") {
  return user.name?.trim() || user.phoneNumber?.trim() || user.email?.trim() || fallback;
}

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

export interface MyProfile {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
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
        localStorage.setItem("userName",    resolveDisplayName(data.user, data.user.role === "CUSTOMER" ? "Customer" : "User"));
        document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
        emitAuthChanged();
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
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    document.cookie = "lrr_session=; path=/; max-age=0; SameSite=Lax";
    emitAuthChanged();
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

  // ── Profile ──────────────────────────────────────────────────────────────

  /** Fetch the current user's profile from the server. */
  const fetchMe = useCallback(async (): Promise<MyProfile> => {
    const me = await apiFetch("/auth/me");
    const normalizedMe: MyProfile = {
      ...me,
      phoneNumber: me?.phoneNumber ? toNigerianDisplayPhoneNumber(me.phoneNumber) : me?.phoneNumber ?? null,
    };
    const displayName = resolveDisplayName(normalizedMe, normalizedMe?.role === "CUSTOMER" ? "Customer" : "User");
    localStorage.setItem("userName", displayName);
    emitAuthChanged();
    return normalizedMe;
  }, []);

  /** Update the current user's profile (name, email, phone). */
  const updateMe = useCallback(async (data: UpdateProfileRequest): Promise<MyProfile> => {
    setLoading(true);
    setError(null);
    try {
      const payload: UpdateProfileRequest = {
        ...data,
        phoneNumber: data.phoneNumber ? toNigerianApiPhoneNumber(data.phoneNumber) : data.phoneNumber,
      };
      const res = await apiFetch("/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const user = {
        ...(res?.data ?? res),
        phoneNumber: (res?.data ?? res)?.phoneNumber
          ? toNigerianDisplayPhoneNumber((res?.data ?? res).phoneNumber)
          : (res?.data ?? res)?.phoneNumber ?? null,
      } as MyProfile;
      // Keep the cached display name in sync so headers update immediately
      if (user?.name !== undefined) {
        localStorage.setItem("userName", user.name ?? "");
        emitAuthChanged();
      }
      return user;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Change (or set) the current user's password. */
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: currentPassword || undefined, newPassword }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
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
      const payload = {
        ...data,
        phoneNumber: toNigerianApiPhoneNumber(data.phoneNumber),
      };
      const res = await apiFetch("/auth/register/customer", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (res.accessToken && res.user) {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("userRole",    res.user.role);
        localStorage.setItem("userName",    res.user.name ?? res.user.phoneNumber ?? "Customer");
        document.cookie = "lrr_session=1; path=/; max-age=86400; SameSite=Lax";
        emitAuthChanged();
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
      const payload: RegisterOperatorRequest = {
        ...data,
        phoneNumber: toNigerianApiPhoneNumber(data.phoneNumber),
      };
      return await apiFetch("/operators", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
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
    // Profile
    fetchMe,
    updateMe,
    changePassword,
    // Registration
    registerCustomer,
    registerOperator,
    // Admin
    listUsers,
  };
}

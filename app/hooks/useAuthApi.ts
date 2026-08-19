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
import { clearSession, getRole, getToken, getUserName, setUserName, writeSession } from "../lib/session";
import { toNigerianApiPhoneNumber, toNigerianDisplayPhoneNumber } from "../utils/phoneValidation";
import type { User, UserRole, RegisterOperatorRequest } from "../types";

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
        writeSession(
          data.accessToken,
          data.user.role,
          resolveDisplayName(data.user, data.user.role === "CUSTOMER" ? "Customer" : "User"),
        );
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
    clearSession();
  }, []);

  /**
   * Request a password reset (email or phone number, plus the new
   * password). If the backend's OTP verification is off, this resets the
   * password immediately (otpRequired: false). If it's on, this only
   * sends a WhatsApp code and the new password here is ignored — the
   * caller must follow up with resetPassword(phoneNumber, code, newPassword).
   */
  const forgotPassword = useCallback(async (identifier: string, newPassword: string): Promise<{ message: string; otpRequired: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch("/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ identifier, newPassword }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Verify a password-reset code and set the new password. */
  const resetPassword = useCallback(async (phoneNumber: string, code: string, newPassword: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch("/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ phoneNumber: toNigerianApiPhoneNumber(phoneNumber), code, newPassword }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => Boolean(getToken()), []);

  const getStoredRole = useCallback((): UserRole | null => getRole(), []);

  const getStoredUser = useCallback((): Omit<User, "id" | "email"> & { id: ""; email: "" } | null => {
    const name = getUserName();
    const role = getRole();
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
    setUserName(displayName);
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
        setUserName(user.name ?? "");
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
        writeSession(res.accessToken, res.user.role, res.user.name ?? res.user.phoneNumber ?? "Customer");
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

  const createStaff = useCallback(async (data: {
    email: string; name: string; role: string; temporaryPassword: string;
  }): Promise<{ id: string; email: string; name: string | null; role: UserRole }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create staff account";
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
    forgotPassword,
    resetPassword,
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
    createStaff,
  };
}

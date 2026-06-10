/**
 * useAuthState
 * ------------
 * SSR-safe, reactive auth state for components that need to know whether
 * a user is logged in (landing nav, pricing CTAs, etc.).
 *
 * - Renders logged-out on the server and first client paint, then syncs
 *   from localStorage in an effect (no hydration mismatch).
 * - Listens for the "lrr-auth-changed" event (fired by useAuthApi on
 *   login/logout) and the cross-tab "storage" event, so the UI updates
 *   without a reload.
 */

import { useEffect, useState } from "react";
import type { UserRole } from "../types";

export const AUTH_CHANGED_EVENT = "lrr-auth-changed";

export interface AuthState {
  /** False until the first client-side read of localStorage completes. */
  ready: boolean;
  isLoggedIn: boolean;
  role: UserRole | null;
  userName: string;
}

/**
 * Where a logged-in user lands. One portal for every role — /dashboard
 * shows role-appropriate content (see app/(portal)/dashboard/page.tsx).
 */
export function dashboardPath(_role?: UserRole | null): string {
  return "/dashboard";
}

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    ready: false,
    isLoggedIn: false,
    role: null,
    userName: "",
  });

  useEffect(() => {
    function sync() {
      const token = localStorage.getItem("accessToken");
      setState({
        ready: true,
        isLoggedIn: Boolean(token),
        role: (localStorage.getItem("userRole") as UserRole) || null,
        userName: localStorage.getItem("userName") || "",
      });
    }
    sync();
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}

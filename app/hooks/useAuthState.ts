/**
 * useAuthState
 * ------------
 * SSR-safe, reactive auth state for components that need to know whether
 * a user is logged in (landing nav, pricing CTAs, etc.).
 *
 * - Renders logged-out on the server and first client paint, then syncs
 *   from the stored session in an effect (no hydration mismatch).
 * - Listens for the AUTH_CHANGED_EVENT (fired by the session module on
 *   login/logout/expiry) and the cross-tab "storage" event, so the UI
 *   updates without a reload.
 *
 * All session reads go through ../lib/session — the single source of truth.
 */

import { useEffect, useState } from "react";
import { AUTH_CHANGED_EVENT, getRole, getToken, getUserName } from "../lib/session";
import type { UserRole } from "../types";

export interface AuthState {
  /** False until the first client-side read of the session completes. */
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
      setState({
        ready: true,
        isLoggedIn: Boolean(getToken()),
        role: getRole(),
        userName: getUserName(),
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

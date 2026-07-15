/**
 * session
 * -------
 * The one module that knows how the client stores auth. Everything else —
 * the API layer, the reactive `useAuthState` hook, the login page, the auth
 * mutations in `useAuthApi` — reads and writes the session through here, so
 * the storage keys and cookie live in a single place instead of as magic
 * strings sprinkled across the app.
 *
 * Auth is deliberately split across two stores that expire independently:
 *   - the `lrr_session` cookie, which the edge middleware can read to gate
 *     protected routes; and
 *   - the `accessToken` (JWT) in localStorage, sent as the Bearer header.
 * Because they can fall out of sync, callers must consult BOTH — see
 * `decideLoginRedirect`.
 */

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./session.constants";
import type { UserRole } from "../types";

/** Fired on any login/logout/expiry so subscribers re-read the session live. */
export const AUTH_CHANGED_EVENT = "lrr-auth-changed";

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "userRole";
const NAME_KEY = "userName";

const isBrowser = () => typeof window !== "undefined";

export function getToken(): string | null {
  return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getRole(): UserRole | null {
  return isBrowser() ? (localStorage.getItem(ROLE_KEY) as UserRole | null) : null;
}

export function getUserName(): string {
  return isBrowser() ? localStorage.getItem(NAME_KEY) ?? "" : "";
}

/** The server-readable presence signal the middleware guards on. */
export function hasSessionCookie(): boolean {
  return (
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((c) => c.startsWith(`${SESSION_COOKIE}=`))
  );
}

export function emitAuthChanged(): void {
  if (isBrowser()) window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/** Persist a freshly authenticated session (both signals) and notify listeners. */
export function writeSession(token: string, role: UserRole | string, userName: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, userName);
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
  emitAuthChanged();
}

/** Update the cached display name (e.g. after fetching or editing the profile). */
export function setUserName(userName: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(NAME_KEY, userName);
  emitAuthChanged();
}

/** Clear both auth signals and notify listeners. Idempotent. */
export function clearSession(): void {
  if (!isBrowser()) return;
  [TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE_KEY, NAME_KEY].forEach((key) => localStorage.removeItem(key));
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  emitAuthChanged();
}

export type LoginRedirect = "dashboard" | "stuck" | "login";

/**
 * The /login page is reached two ways: directly by an already-logged-in user,
 * or as the middleware's redirect target once the session cookie has expired.
 * Deciding from the token's mere presence is the original bug — a dead token
 * lingers in localStorage forever, so decide from BOTH signals:
 *
 *   - both present     → genuinely logged in, send home
 *   - token, no cookie → STUCK: the cookie expired but a dead token remains.
 *       Honoring it ping-pongs /dashboard ⇄ /login forever (the blank screen);
 *       the caller must clear the token and show the login form.
 *   - otherwise        → show the login form
 */
export function decideLoginRedirect(hasToken: boolean, hasCookie: boolean): LoginRedirect {
  if (hasToken && hasCookie) return "dashboard";
  if (hasToken && !hasCookie) return "stuck";
  return "login";
}

/**
 * Thrown by `apiFetch` when an authenticated request comes back 401 — the
 * session expired server-side. It is a signal, not a navigation: the fetch
 * layer clears the session and throws this; the reactive auth guard in the
 * portal shell performs the redirect. Callers may narrow on it to show a
 * tailored "please log in again" message.
 */
export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

// Must match the backend global prefix set in main.ts: app.setGlobalPrefix('api/v1')
import * as Sentry from "@sentry/nextjs";
import { clearSession, getToken, SessionExpiredError } from "../lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options?.headers || {});

  // Attach the bearer token when we have one; remember that we did, so we can
  // tell an expired-session 401 apart from e.g. a bad-credentials login 401.
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // A 401 on a request we authenticated means the session expired server-side.
  // Clear it and throw a typed error so callers can't silently strand the user
  // on a broken page; the portal's auth guard reacts to the cleared session and
  // performs the redirect (the fetch layer stays out of routing). A 401 with no
  // token attached (a bad-credentials login) is left for the caller to surface.
  if (res.status === 401 && token) {
    // First failing request wins: clearing the token dedupes the Sentry report
    // and the session teardown for any sibling requests already in flight.
    if (getToken()) {
      Sentry.captureMessage("session-expired: API returned 401 for an authenticated request", {
        level: "info",
        tags: { reason: "expired-token" },
        extra: { path },
      });
      clearSession();
    }
    throw new SessionExpiredError(data?.message);
  }

  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}

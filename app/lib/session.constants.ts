/**
 * Session constants shared between the edge proxy and the browser client.
 * Kept dependency-free (no `window`/`document`) so `proxy.ts` can import it
 * in the edge runtime, and kept in ONE place so the two layers can never drift
 * on the cookie name — the mismatch that stranded users on a blank page.
 */

/** Presence flag the middleware guards protected routes on (see proxy.ts). */
export const SESSION_COOKIE = "lrr_session";

/** Cookie lifetime in seconds. Mirrors the backend access-token TTL (24h). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

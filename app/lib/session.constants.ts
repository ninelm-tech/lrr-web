/**
 * Session constants shared between the edge proxy and the browser client.
 * Kept dependency-free (no `window`/`document`) so `proxy.ts` can import it
 * in the edge runtime, and kept in ONE place so the two layers can never drift
 * on the cookie name — the mismatch that stranded users on a blank page.
 */

/** Presence flag the middleware guards protected routes on (see proxy.ts). */
export const SESSION_COOKIE = "lrr_session";

/**
 * Cookie lifetime in seconds. MUST equal the backend access-token TTL
 * (lrr-service `ACCESS_TOKEN_TTL_SECONDS`, src/auth/jwt-options.ts: 24h) so
 * the cookie and the token expire together. If the token outlives the cookie
 * users hold a valid token the proxy won't honour, and get bounced to login.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

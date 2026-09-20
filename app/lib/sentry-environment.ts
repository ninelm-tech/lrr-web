/**
 * Resolves a stable, three-way Sentry environment tag: "development" |
 * "staging" | "production".
 *
 * Vercel sets VERCEL_ENV (and mirrors it to NEXT_PUBLIC_VERCEL_ENV for the
 * client bundle) to "production" | "preview" | "development" for every
 * build and runtime invocation. This project only ever deploys the
 * `staging` branch as a Vercel preview, so any preview build here is
 * staging traffic, not a generic "vercel-preview" bucket — left unmapped,
 * Sentry's own Vercel integration tags it that way instead, which doesn't
 * match lrr-service's development/staging/production scheme.
 */
export function resolveSentryEnvironment(): string {
  const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === "production") return "production";
  if (vercelEnv) return "staging";
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

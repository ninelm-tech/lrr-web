"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import * as Sentry from "@sentry/nextjs";
import { clearSession, decideLoginRedirect, getToken, hasSessionCookie } from "../lib/session";

/**
 * /login is kept alive only as a middleware redirect target.
 * It immediately pushes back to the landing page with ?login=1
 * so the LoginModal auto-opens there instead.
 */
function LoginRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const next = params.get("next") || "";
    const decision = decideLoginRedirect(Boolean(getToken()), hasSessionCookie());

    // Already logged in (both auth signals present) → go home.
    if (decision === "dashboard") {
      router.replace("/dashboard");
      return;
    }

    // Stuck session: middleware bounced us here because the session cookie
    // expired, but a stale accessToken still lingers in localStorage. Left
    // alone this loops /dashboard ⇄ /login forever (the blank white page).
    // This is our "stuck user" signal — report it, drop the dead token, and
    // fall through to the login form.
    if (decision === "stuck") {
      Sentry.captureMessage(
        "stuck-session: session cookie expired but accessToken still present",
        { level: "warning", tags: { reason: "cookie-token-mismatch" }, extra: { next: next || "/dashboard" } },
      );
      clearSession();
    }

    router.replace(`/${next ? `?next=${encodeURIComponent(next)}&` : "?"}login=1`);
  }, [router, params]);

  return null;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginRedirect />
    </Suspense>
  );
}

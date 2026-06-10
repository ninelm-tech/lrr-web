"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * /login is kept alive only as a middleware redirect target.
 * It immediately pushes back to the landing page with ?login=1
 * so the LoginModal auto-opens there instead.
 */
function LoginRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // Already logged in? Go home.
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      router.replace("/dashboard");
      return;
    }
    const next = params.get("next") || "";
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

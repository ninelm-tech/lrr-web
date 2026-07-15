"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSubscriptionApi } from "../../hooks";
import { getToken } from "../../lib/session";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { verifySubscription } = useSubscriptionApi();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard against double-run in React strict mode
    started.current = true;

    const reference = params.get("reference") || params.get("trxref");

    // Guard: middleware handles server-side; this catches edge cases (e.g. token expired mid-session)
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    if (!reference) {
      setStatus("failed");
      return;
    }

    // Verify the transaction with the backend (which checks Paystack directly
    // and activates the subscription). Poll a few times — Paystack can take a
    // moment to settle the transaction after redirecting.
    let cancelled = false;
    (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;
        const active = await verifySubscription(reference);
        if (cancelled) return;
        if (active) {
          setStatus("success");
          setTimeout(() => router.replace("/dashboard"), 2500);
          return;
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
      setStatus("failed");
    })();

    return () => { cancelled = true; };
  }, [params, router, verifySubscription]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F6FAFF", fontFamily: "Inter, Arial, sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, padding: "3rem 2.5rem",
        textAlign: "center", maxWidth: 440, width: "100%",
        boxShadow: "0 8px 40px rgba(0,61,180,0.12)",
      }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
            <h2 style={{ color: "#003DB4", fontWeight: 700, margin: "0 0 0.5rem" }}>Confirming payment…</h2>
            <p style={{ color: "#8a9ab5", margin: 0 }}>Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "#003DB4", fontWeight: 700, margin: "0 0 0.5rem" }}>You&apos;re covered!</h2>
            <p style={{ color: "#555", margin: "0 0 1.5rem" }}>
              Your LRR subscription is active. Taking you to your dashboard…
            </p>
            <div style={{
              height: 4, background: "#dde8f8", borderRadius: 99, overflow: "hidden",
            }}>
              <div style={{
                height: "100%", background: "#003DB4", borderRadius: 99,
                animation: "progress 2.5s linear forwards",
              }} />
            </div>
            <style>{`
              @keyframes progress { from { width: 0% } to { width: 100% } }
            `}</style>
          </>
        )}

        {status === "failed" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
            <h2 style={{ color: "#d63031", fontWeight: 700, margin: "0 0 0.5rem" }}>Something went wrong</h2>
            <p style={{ color: "#555", margin: "0 0 1.5rem" }}>
              We couldn&apos;t confirm your payment yet. If you were charged, it may still be processing — check your dashboard in a few minutes, or contact us at <a href="mailto:info@ninelm.com" style={{ color: "#003DB4" }}>info@ninelm.com</a>.
            </p>
            <button
              onClick={() => router.replace("/dashboard")}
              style={{
                background: "#003DB4", color: "#fff", border: "none",
                borderRadius: 8, padding: "0.75rem 1.5rem", fontWeight: 600,
                cursor: "pointer", fontSize: "0.95rem",
              }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}

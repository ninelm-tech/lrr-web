"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");

    // Guard: middleware handles server-side; this catches edge cases (e.g. token expired mid-session)
    if (!localStorage.getItem("accessToken")) {
      router.replace("/login");
      return;
    }

    if (!reference) {
      setStatus("failed");
      return;
    }

    // The webhook already handles the actual activation — we just need to
    // show success and redirect. Give the webhook a moment to process.
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => router.replace("/customer"), 2500);
    }, 1500);
  }, [params, router]);

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
              We couldn&apos;t verify your payment. If you were charged, contact us at <a href="mailto:info@ninelm.com" style={{ color: "#003DB4" }}>info@ninelm.com</a>.
            </p>
            <button
              onClick={() => router.replace("/plans")}
              style={{
                background: "#003DB4", color: "#fff", border: "none",
                borderRadius: 8, padding: "0.75rem 1.5rem", fontWeight: 600,
                cursor: "pointer", fontSize: "0.95rem",
              }}
            >
              Back to Plans
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

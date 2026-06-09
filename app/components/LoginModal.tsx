"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "../hooks";

const dm = "var(--font-dm-sans), sans-serif";
const fraunces = "var(--font-fraunces), serif";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill a redirect after login (e.g. from middleware ?next=) */
  next?: string;
}

export default function LoginModal({ open, onClose, next }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuthApi();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email field when modal opens
  useEffect(() => {
    if (open) {
      setError("");
      setTimeout(() => emailRef.current?.focus(), 80);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      const role = data?.user?.role ?? localStorage.getItem("userRole");
      const destination = next || (role === "CUSTOMER" ? "/customer" : "/dashboard");
      onClose();
      router.push(destination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(7,21,47,0.55)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn .15s ease",
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        style={{
          position: "fixed", inset: 0, zIndex: 101,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            width: "100%", maxWidth: 400,
            background: "#fff",
            borderRadius: 20,
            padding: "2rem 2rem 2.25rem",
            boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
            animation: "slideUp .2s cubic-bezier(.23,1.01,.32,1)",
            fontFamily: dm,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
            <div>
              <p style={{ margin: "0 0 3px 0", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#003DB4" }}>
                Welcome back
              </p>
              <h2 style={{ margin: 0, fontFamily: fraunces, fontWeight: 700, fontSize: "1.6rem", color: "#07152f" }}>
                Sign in
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "#f4f6f9", border: "none", borderRadius: 8,
                width: 32, height: 32, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6c7890", fontSize: "1rem", flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input
              ref={emailRef}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: "0.875rem 1rem", borderRadius: 10, fontSize: "0.95rem",
                border: "1px solid #e2e8f0", background: "#f7f9fc",
                color: "#07152f", outline: "none", fontFamily: dm,
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                padding: "0.875rem 1rem", borderRadius: 10, fontSize: "0.95rem",
                border: "1px solid #e2e8f0", background: "#f7f9fc",
                color: "#07152f", outline: "none", fontFamily: dm,
              }}
            />

            {error && (
              <p style={{ margin: 0, color: "#e53e3e", fontSize: "0.88rem" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.25rem",
                padding: "0.95rem",
                borderRadius: 10, border: "none",
                background: "#003DB4", color: "#fff",
                fontFamily: dm, fontWeight: 700, fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity .2s",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.88rem", color: "#6c7890" }}>
            Don&apos;t have an account?{" "}
            <a href="/register/customer" style={{ color: "#003DB4", fontWeight: 600, textDecoration: "none" }}>
              Join as a member
            </a>
            {" · "}
            <a href="/register" style={{ color: "#003DB4", fontWeight: 600, textDecoration: "none" }}>
              Register as operator
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
        input:focus { border-color: #003DB4 !important; box-shadow: 0 0 0 3px rgba(0,61,180,0.1); }
        input::placeholder { color: rgba(108,120,144,0.55); }
      `}</style>
    </>
  );
}

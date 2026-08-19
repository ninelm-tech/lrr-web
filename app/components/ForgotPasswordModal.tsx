"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthApi } from "../hooks";

const dm = "var(--font-dm-sans), sans-serif";
const fraunces = "var(--font-fraunces), serif";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: "0.875rem 1rem", borderRadius: 10, fontSize: "0.95rem",
  border: "1px solid #e2e8f0", background: "#f7f9fc",
  color: "#07152f", outline: "none", fontFamily: dm,
};

const buttonStyle = (loading: boolean): React.CSSProperties => ({
  marginTop: "0.25rem",
  padding: "0.95rem",
  borderRadius: 10, border: "none",
  background: "#003DB4", color: "#fff",
  fontFamily: dm, fontWeight: 700, fontSize: "0.95rem",
  cursor: loading ? "not-allowed" : "pointer",
  opacity: loading ? 0.7 : 1,
  transition: "opacity .2s",
});

/**
 * Two-step forgot-password flow: request a code (email or phone), then
 * enter that code + phone number + new password to reset. While the
 * backend's OTP flag is off, step 1 resets the password immediately (no
 * code involved) and the modal jumps straight to "done". When the flag is
 * on, step 1 only sends a code and the modal advances to step 2 for the
 * code + a phone number to verify against — the new password entered in
 * step 1 is carried over rather than asked for twice.
 */
export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const { forgotPassword, resetPassword } = useAuthApi();
  const [step, setStep] = useState<"identify" | "reset" | "done">("identify");
  const [identifier, setIdentifier] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setStep("identify");
      setIdentifier("");
      setPhoneNumber("");
      setCode("");
      setNewPassword("");
      setInfo("");
      setError("");
      setTimeout(() => firstFieldRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await forgotPassword(identifier, newPassword);
      if (result.otpRequired) {
        setInfo(result.message);
        setStep("reset");
      } else {
        setStep("done");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await resetPassword(phoneNumber, code, newPassword);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 110,
          background: "rgba(7,21,47,0.55)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn .15s ease",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Reset your password"
        style={{
          position: "fixed", inset: 0, zIndex: 111,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
            <div>
              <p style={{ margin: "0 0 3px 0", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#003DB4" }}>
                Account recovery
              </p>
              <h2 style={{ margin: 0, fontFamily: fraunces, fontWeight: 700, fontSize: "1.6rem", color: "#07152f" }}>
                Reset password
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

          {step === "identify" && (
            <form onSubmit={handleRequestCode} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.88rem", color: "#6c7890" }}>
                Enter the email or phone number on your account and a new password.
              </p>
              <input
                ref={firstFieldRef}
                type="text"
                placeholder="Email or phone number"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                style={inputStyle}
              />
              {error && <p style={{ margin: 0, color: "#e53e3e", fontSize: "0.88rem" }}>{error}</p>}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Submitting…" : "Reset password"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {info && <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.88rem", color: "#6c7890" }}>{info}</p>}
              <input
                ref={firstFieldRef}
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                style={inputStyle}
              />
              {error && <p style={{ margin: 0, color: "#e53e3e", fontSize: "0.88rem" }}>{error}</p>}
              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Verifying…" : "Confirm code"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#07152f" }}>
                Password updated. You can now log in with your new password.
              </p>
              <button onClick={onClose} style={buttonStyle(false)}>
                Done
              </button>
            </div>
          )}
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

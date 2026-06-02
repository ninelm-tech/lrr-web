"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

type Step = "choose" | "form";
type Workspace = "member" | "operator";

export default function LoginPage() {
  const [step, setStep]           = useState<Step>("choose");
  const [workspace, setWorkspace] = useState<Workspace>("member");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      const role = localStorage.getItem("userRole");
      router.replace(role === "CUSTOMER" ? "/customer" : "/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      const role = data?.user?.role ?? localStorage.getItem("userRole");
      router.push(role === "CUSTOMER" ? "/customer" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f2f5",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-dm-sans), sans-serif",
    }}>
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem",
      }}>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 44, width: "auto", objectFit: "contain" }} />
        </Link>
        <Link href="/" style={{ color: "#6c7890", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>
          Back to website
        </Link>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>

        {step === "choose" ? (
          <div style={{ width: "100%", maxWidth: 820, textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#003DB4", marginBottom: "1rem" }}>
              Welcome back
            </p>
            <h1 style={{
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 700, fontSize: "clamp(2rem, 4vw, 2.8rem)",
              color: "#0b1736", margin: "0 0 0.75rem 0",
            }}>
              Choose your workspace.
            </h1>
            <p style={{ color: "#6c7890", fontSize: "1rem", margin: "0 0 2.5rem 0" }}>
              Access your account, manage requests, and stay connected to the LRR network.
            </p>

            <div className="workspace-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", maxWidth: 820, margin: "0 auto" }}>
              {/* Member card */}
              <button
                onClick={() => { setWorkspace("member"); setStep("form"); }}
                style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 20, padding: "2rem 2rem 2.5rem",
                  textAlign: "left", cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,61,180,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.25rem",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c7890" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#0b1736", margin: "0 0 0.6rem 0" }}>
                  Member Login
                </h2>
                <p style={{ color: "#6c7890", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 2rem 0" }}>
                  View your membership, request roadside support, and track your service history.
                </p>
                <div style={{
                  width: "100%", padding: "0.9rem", background: "#003DB4",
                  borderRadius: 12, color: "#fff", fontWeight: 600,
                  fontSize: "0.95rem", textAlign: "center",
                }}>
                  Continue as member
                </div>
              </button>

              {/* Operator card */}
              <button
                onClick={() => { setWorkspace("operator"); setStep("form"); }}
                style={{
                  background: "#07152f", border: "none",
                  borderRadius: 20, padding: "2rem 2rem 2.5rem",
                  textAlign: "left", cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.25rem",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 8h4l3 4v4h-7V8z" />
                  </svg>
                </div>
                <h2 style={{ fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: "0 0 0.6rem 0" }}>
                  Operator Login
                </h2>
                <p style={{ color: "rgba(219,232,255,0.65)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 2rem 0" }}>
                  Open your dispatch workspace, manage active jobs, and monitor your operations.
                </p>
                <div style={{
                  width: "100%", padding: "0.9rem", background: "#fff",
                  borderRadius: 12, color: "#07152f", fontWeight: 600,
                  fontSize: "0.95rem", textAlign: "center",
                }}>
                  Continue as operator
                </div>
              </button>
            </div>

            <p style={{ marginTop: "1.75rem", color: "#6c7890", fontSize: "0.9rem" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register/customer" style={{ color: "#003DB4", fontWeight: 600, textDecoration: "none" }}>
                Join as a member
              </Link>
              {" · "}
              <Link href="/register" style={{ color: "#003DB4", fontWeight: 600, textDecoration: "none" }}>
                Register as operator
              </Link>
            </p>
          </div>

        ) : (
          /* Login form */
          <div style={{ width: "100%", maxWidth: 420 }}>
            <button
              onClick={() => { setStep("choose"); setError(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6c7890", fontSize: "0.9rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 6, padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div style={{
              background: workspace === "operator" ? "#07152f" : "#fff",
              borderRadius: 20,
              padding: "2.5rem",
              boxShadow: workspace === "operator" ? "0 8px 40px rgba(0,0,0,0.2)" : "0 8px 40px rgba(0,61,180,0.10)",
              border: workspace === "member" ? "1px solid #e2e8f0" : "none",
            }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: workspace === "operator" ? "rgba(219,232,255,0.6)" : "#003DB4", marginBottom: "0.75rem" }}>
                {workspace === "member" ? "Member login" : "Operator login"}
              </p>
              <h2 style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 700, fontSize: "1.8rem",
                color: workspace === "operator" ? "#fff" : "#0b1736",
                margin: "0 0 0.4rem 0",
              }}>
                Welcome back.
              </h2>
              <p style={{ color: workspace === "operator" ? "rgba(219,232,255,0.55)" : "#6c7890", fontSize: "0.9rem", margin: "0 0 2rem 0" }}>
                Sign in to your {workspace === "member" ? "member" : "operator"} account
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    padding: "0.9rem 1rem", borderRadius: 10, fontSize: "0.95rem",
                    background: workspace === "operator" ? "rgba(255,255,255,0.07)" : "#f7f9fc",
                    border: workspace === "operator" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0",
                    color: workspace === "operator" ? "#fff" : "#0b1736",
                    outline: "none",
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    padding: "0.9rem 1rem", borderRadius: 10, fontSize: "0.95rem",
                    background: workspace === "operator" ? "rgba(255,255,255,0.07)" : "#f7f9fc",
                    border: workspace === "operator" ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0",
                    color: workspace === "operator" ? "#fff" : "#0b1736",
                    outline: "none",
                  }}
                />
                {error && (
                  <p style={{ color: "#e53e3e", fontSize: "0.88rem", margin: 0 }}>{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.95rem",
                    borderRadius: 10,
                    border: "none",
                    background: workspace === "operator" ? "#fff" : "#003DB4",
                    color: workspace === "operator" ? "#07152f" : "#fff",
                    fontWeight: 700, fontSize: "0.95rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .workspace-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder { color: rgba(108,120,144,0.6); }
      `}</style>
    </div>
  );
}

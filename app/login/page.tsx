"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      setIsRedirecting(true);
      const role = localStorage.getItem("userRole");
      router.replace(role === "CUSTOMER" ? "/customer" : "/dashboard");
    }
  }, [router]);

  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      setIsRedirecting(true);
      const role = data?.user?.role ?? localStorage.getItem("userRole");
      router.push(role === "CUSTOMER" ? "/customer" : "/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (isRedirecting) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#F6FAFF",
      }}>
        <p style={{ color: "#003DB4", fontWeight: 600 }}>Redirecting…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 60% 40%, #dde8f8 0%, #F6FAFF 100%)",
    }}>
      <div className="auth-container" style={{
        boxShadow: "0 8px 40px 0 rgba(0,61,180,0.13)",
        background: "#fff", borderRadius: 18,
        padding: "clamp(1.25rem, 5vw, 2.5rem)",
        minWidth: "min(350px, 100%)", maxWidth: 400, width: "100%",
        animation: "fadeInUp .7s cubic-bezier(.23,1.01,.32,1)",
      }}>
        <img
          src="/lrr-logo.png"
          alt="Lagos Roadside Rescue"
          style={{ height: 40, width: "auto", objectFit: "contain", display: "block", marginBottom: "1.5rem" }}
        />
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#003DB4", marginBottom: 8, letterSpacing: "-1px" }}>Welcome Back</h2>
        <p style={{ margin: "0 0 1.5rem", color: "#8a9ab5", fontSize: "0.95rem" }}>Sign in to your LRR account</p>
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: 24 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ fontSize: "1.05rem", background: "#F6FAFF", border: "1.5px solid #dde8f8", borderRadius: 8, padding: "0.9rem 1.1rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ fontSize: "1.05rem", background: "#F6FAFF", border: "1.5px solid #dde8f8", borderRadius: 8, padding: "0.9rem 1.1rem" }}
          />
          <button type="submit" disabled={loading} style={{ fontWeight: 700, fontSize: "1.05rem", background: "#003DB4", border: 0, borderRadius: 8, color: "#fff", padding: "0.9rem 1.1rem", boxShadow: "0 2px 12px rgba(0,61,180,0.2)", letterSpacing: ".5px" }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
        <p style={{ marginTop: 24, fontSize: "0.95rem", textAlign: "center" }}>
          New customer?{" "}
          <a href="/register/customer" style={{ color: "#003DB4", fontWeight: 700, textDecoration: "underline" }}>Sign up here</a>
        </p>
        <p style={{ marginTop: 8, fontSize: "0.88rem", textAlign: "center", color: "#aaa" }}>
          Operator?{" "}
          <a href="/register" style={{ color: "#003DB4", textDecoration: "underline" }}>Register your business</a>
        </p>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    </div>
  );
}

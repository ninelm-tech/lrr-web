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
    // Only check once on mount
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

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fbff"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#0070f3", fontWeight: 600 }}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 60% 40%, #e0f3ff 0%, #f8fbff 100%)"
    }}>
      <div className="auth-container" style={{
        boxShadow: "0 8px 40px 0 rgba(0,112,243,0.13)",
        background: "#fff",
        borderRadius: 18,
        padding: "2.5rem 2.5rem 2rem 2.5rem",
        minWidth: 350,
        maxWidth: 400,
        width: "100%",
        animation: "fadeInUp .7s cubic-bezier(.23,1.01,.32,1)"
      }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#0070f3", marginBottom: 24, letterSpacing: "-1px" }}>Welcome Back</h2>
        <form onSubmit={handleSubmit} className="auth-form" style={{ gap: 24 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ fontSize: "1.1rem", background: "#f8fbff", border: "1.5px solid #e0f3ff", borderRadius: 8, padding: "0.9rem 1.1rem" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ fontSize: "1.1rem", background: "#f8fbff", border: "1.5px solid #e0f3ff", borderRadius: 8, padding: "0.9rem 1.1rem" }}
          />
          <button type="submit" disabled={loading} style={{ fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(90deg,#0070f3,#00c6ff)", border: 0, borderRadius: 8, color: "#fff", padding: "0.9rem 1.1rem", boxShadow: "0 2px 12px rgba(0,112,243,0.09)", letterSpacing: ".5px" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
        <p style={{ marginTop: 32, fontSize: "1rem", textAlign: "center" }}>
          New customer?{" "}
          <a href="/register/customer" style={{ color: "#0070f3", fontWeight: 700, textDecoration: "underline" }}>Sign up here</a>
        </p>
        <p style={{ marginTop: 10, fontSize: "0.88rem", textAlign: "center", color: "#aaa" }}>
          Operator?{" "}
          <a href="/register" style={{ color: "#0070f3", textDecoration: "underline" }}>Register your business</a>
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

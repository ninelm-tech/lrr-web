"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "../../hooks";
import { isValidNigerianPhoneNumber, getPhoneNumberErrorMessage, toNigerianDisplayPhoneNumber } from "../../utils/phoneValidation";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer } = useAuthApi();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
      const role = localStorage.getItem("userRole");
      router.replace("/dashboard");
    }
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const normalized = toNigerianDisplayPhoneNumber(value);
      setForm((prev) => ({ ...prev, [name]: normalized }));
      setPhoneError(normalized && !isValidNigerianPhoneNumber(normalized) ? getPhoneNumberErrorMessage(normalized) : "");
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidNigerianPhoneNumber(form.phoneNumber)) {
      setError(getPhoneNumberErrorMessage(form.phoneNumber));
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name: form.name.trim(),
        phoneNumber: form.phoneNumber,
        email: form.email,
        password: form.password,
      });
      // Registered + auto-logged-in → go to customer dashboard to activate membership
      router.push("/dashboard?welcome=1");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (hasError = false) => ({
    width: "100%",
    fontSize: "1rem",
    background: hasError ? "#fff5f5" : "#F6FAFF",
    border: `1.5px solid ${hasError ? "#ffcccc" : "#dde8f8"}`,
    borderRadius: 8,
    padding: "0.9rem 1rem",
    boxSizing: "border-box" as const,
    outline: "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 60% 40%, #dde8f8 0%, #F6FAFF 100%)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem" }}>
        <a href="/"><img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 44, width: "auto", objectFit: "contain" }} /></a>
        <a href="/" style={{ color: "#6c7890", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>Back to website</a>
      </header>
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="lrr-cust-card"
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 8px 40px rgba(0,61,180,0.13)",
          animation: "fadeInUp .6s cubic-bezier(.23,1.01,.32,1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🚗</div>
          <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: 700, color: "#003DB4", letterSpacing: "-0.5px" }}>
            Create Your Account
          </h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.95rem" }}>
            Get rescue coverage across Lagos
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#444", marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              name="name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              style={inputStyle()}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#444", marginBottom: 6 }}>
              WhatsApp Number *
            </label>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="08012345678"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              style={inputStyle(!!phoneError)}
            />
            {phoneError && <p style={{ margin: "5px 0 0 0", fontSize: "0.83rem", color: "#d63031" }}>{phoneError}</p>}
            {form.phoneNumber && !phoneError && (
              <p style={{ margin: "5px 0 0 0", fontSize: "0.83rem", color: "#27ae60" }}>✓ Valid number</p>
            )}
            <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#999" }}>
              This is the number you'll use to request rescue via WhatsApp
            </p>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#444", marginBottom: 6 }}>
              Email *
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle()}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#444", marginBottom: 6 }}>
              Password *
            </label>
            <input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle()}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", color: "#444", marginBottom: 6 }}>
              Confirm Password *
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              style={inputStyle(!!form.confirmPassword && form.password !== form.confirmPassword)}
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p style={{ margin: "5px 0 0 0", fontSize: "0.83rem", color: "#d63031" }}>Passwords do not match</p>
            )}
          </div>

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #ffcccc", color: "#d63031", padding: "0.85rem 1rem", borderRadius: 8, fontSize: "0.92rem" }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              background: loading ? "#ccc" : "linear-gradient(90deg,#003DB4,#003DB4)",
              border: 0,
              borderRadius: 8,
              color: "#fff",
              padding: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(0,61,180,0.15)",
              transition: "all 0.2s",
              marginTop: "0.25rem",
            }}
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.92rem", color: "#666" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#003DB4", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </a>
        </div>

        <div style={{ marginTop: "0.75rem", textAlign: "center", fontSize: "0.88rem", color: "#aaa" }}>
          Want to offer towing services?{" "}
          <a href="/register" style={{ color: "#003DB4", textDecoration: "none" }}>
            Register as an operator
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: none; }
        }
        input:focus { border-color: #003DB4 !important; box-shadow: 0 0 0 3px rgba(0,61,180,0.1); outline: none; }
        @media (max-width: 500px) {
          .lrr-cust-card { padding: 1.5rem 1rem !important; border-radius: 12px !important; }
        }
      `}</style>
    </div>
    </div>
  );
}

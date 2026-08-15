"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "../hooks";
import { getToken } from "../lib/session";
import { useGooglePlacesAutocomplete } from "../hooks/useGooglePlacesAutocomplete";
import { isValidNigerianPhoneNumber, getPhoneNumberErrorMessage, toNigerianDisplayPhoneNumber } from "../utils/phoneValidation";
import type { RegisterOperatorRequest } from "../types";
import { OperatorType, TruckClass, TRUCK_CLASSES } from "../types";

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  fontSize: "1rem",
  background: hasError ? "#fff5f5" : "#F6FAFF",
  border: `1.5px solid ${hasError ? "#ffcccc" : "#dde8f8"}`,
  borderRadius: 8,
  padding: "0.9rem 1rem",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 8,
};

const helperStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#8892a6",
  margin: "6px 0 0",
};

/** One section of a continuously-scrollable form, with a rail connecting it to the next. */
function Step({ n, total, title, subtitle, children }: {
  n: number; total: number; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#003DB4", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.95rem", flexShrink: 0,
        }}>
          {n}
        </div>
        {n < total && <div style={{ flex: 1, width: 2, background: "#dde8f8", marginTop: 6, minHeight: 24 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: n < total ? 8 : 0, minWidth: 0 }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#07152f", margin: "0 0 2px" }}>{title}</h3>
        <p style={{ fontSize: "0.85rem", color: "#8892a6", margin: "0 0 18px" }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { registerOperator } = useAuthApi();
  const { address, setAddress, suggestions, selectSuggestion, latLng } = useGooglePlacesAutocomplete();

  const [formData, setFormData] = useState({
    contactName: "",
    businessName: "",
    phoneNumber: "",
    operatorType: OperatorType.TOW_TRUCK,
    truckClasses: [] as TruckClass[],
    serviceRadius: "50",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (getToken()) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [router]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const normalized = toNigerianDisplayPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: normalized }));
      if (normalized) {
        if (!isValidNigerianPhoneNumber(normalized)) {
          setPhoneError(getPhoneNumberErrorMessage(normalized));
        } else {
          setPhoneError("");
        }
      } else {
        setPhoneError("");
      }
      return;
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Real-time phone validation
    if (name === "phoneNumber" && value) {
      if (!isValidNigerianPhoneNumber(value)) {
        setPhoneError(getPhoneNumberErrorMessage(value));
      } else {
        setPhoneError("");
      }
    } else if (name === "phoneNumber") {
      setPhoneError("");
    }
  }

  function handleTruckClassToggle(truckClass: TruckClass) {
    setFormData((prev) => {
      const isSelected = prev.truckClasses.includes(truckClass);
      return {
        ...prev,
        truckClasses: isSelected
          ? prev.truckClasses.filter((tc) => tc !== truckClass)
          : [...prev.truckClasses, truckClass],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.businessName || !formData.contactName || !formData.phoneNumber) {
      setError("Please fill in all business information fields");
      return;
    }

    if (!isValidNigerianPhoneNumber(formData.phoneNumber)) {
      setError(getPhoneNumberErrorMessage(formData.phoneNumber));
      return;
    }

    if (formData.truckClasses.length === 0) {
      setError("Please select at least one truck class your fleet can operate");
      return;
    }

    if (!address || !latLng) {
      setError("Please select your address from the suggestions list so we can pinpoint your location");
      return;
    }

    if (!formData.serviceRadius) {
      setError("Please enter a service radius");
      return;
    }

    if (!formData.email || !formData.password) {
      setError("Please fill in email and password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const payload: RegisterOperatorRequest = {
        businessName: formData.businessName,
        contactName: formData.contactName,
        phoneNumber: formData.phoneNumber,
        type: formData.operatorType,
        email: formData.email,
        password: formData.password,
        address: address,
        latitude: latLng.lat,
        longitude: latLng.lng,
        truckClasses: formData.truckClasses,
      };

      await registerOperator(payload);

      setIsRedirecting(true);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (isRedirecting) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#F6FAFF"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#003DB4", fontWeight: 600 }}>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6FAFF", fontFamily: "var(--font-dm-sans), sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem" }}>
        <a href="/"><img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 44, width: "auto", objectFit: "contain" }} /></a>
        <a href="/" style={{ color: "#6c7890", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none" }}>Back to website</a>
      </header>
    <div style={{
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem"
    }}>
      <div className="lrr-reg-shell" style={{
        boxShadow: "0 20px 60px 0 rgba(7,21,47,0.16)",
        background: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: "80%",
        overflow: "hidden",
        animation: "fadeInUp .7s cubic-bezier(.23,1.01,.32,1)"
      }}>
      <div className="lrr-reg-cols">
      <div className="lrr-reg-pad" style={{ padding: "3rem" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#07152f", marginBottom: 6, letterSpacing: "-1px" }}>
          Become an Operator
        </h2>
        <p style={{ fontSize: "1rem", color: "#8892a6", marginBottom: 32 }}>
          Join Lagos's rescue network — three quick steps and you're in.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Step n={1} total={3} title="Who you are" subtitle="This is what motorists and our dispatch team will see.">
            <div className="lrr-reg-grid">
              <div>
                <label style={labelStyle}>Your Full Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="e.g. Adaeze Okafor"
                  required
                  style={inputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 08012345678"
                  required
                  style={inputStyle(Boolean(phoneError))}
                />
                {phoneError && (
                  <p style={{ fontSize: "0.85rem", color: "#d63031", margin: "6px 0 0" }}>
                    {phoneError}
                  </p>
                )}
                {formData.phoneNumber && !phoneError && (
                  <p style={{ fontSize: "0.85rem", color: "#003DB4", margin: "6px 0 0" }}>
                    ✓ Valid number
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. Swift Towing Services"
                  required
                  style={inputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle}>Fleet / Truck Classes *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[TruckClass.LIGHT_DUTY, TruckClass.LOW_BED, TruckClass.TEN_TYRE, TruckClass.HIAB].map((value) => (
                    <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.95rem", color: "#333" }}>
                      <input
                        type="checkbox"
                        checked={formData.truckClasses.includes(value)}
                        onChange={() => handleTruckClassToggle(value)}
                      />
                      {TRUCK_CLASSES[value]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Step>

          <Step n={2} total={3} title="Where you operate" subtitle="Your base location and how far you're willing to travel for a job.">
            <label style={labelStyle}>Service Address *</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12 Adeniyi Jones Ave, Ikeja, Lagos"
                required
                style={inputStyle()}
              />
              {suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1.5px solid #dde8f8",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  maxHeight: 200,
                  overflowY: "auto",
                  zIndex: 1000
                }}>
                  {suggestions.map((suggestion: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => selectSuggestion(suggestion)}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid #dde8f8",
                        fontSize: "0.95rem",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F6FAFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      {suggestion.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {latLng && (
              <p style={{ fontSize: "0.85rem", color: "#003DB4", marginTop: 8 }}>
                📍 Coordinates: {latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}
              </p>
            )}

            <div style={{ marginTop: 20, maxWidth: 260 }}>
              <label style={labelStyle}>Service Radius (km) *</label>
              <input
                type="number"
                name="serviceRadius"
                value={formData.serviceRadius}
                onChange={handleInputChange}
                placeholder="50"
                min="1"
                required
                style={inputStyle()}
              />
              <p style={helperStyle}>How far from your base you're willing to travel for a job.</p>
            </div>
          </Step>

          <Step n={3} total={3} title="Create your account" subtitle="You'll use this email and password to log in to your dashboard.">
            <div className="lrr-reg-grid">
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  style={inputStyle()}
                />
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  required
                  style={inputStyle()}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  style={inputStyle()}
                />
              </div>
            </div>
          </Step>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(90deg,#003DB4,#003DB4)",
              border: 0,
              borderRadius: 8,
              color: "#fff",
              padding: "0.9rem 1.1rem",
              boxShadow: "0 2px 12px rgba(0,61,180,0.09)",
              letterSpacing: ".5px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,61,180,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,61,180,0.09)";
            }}
          >
            {loading ? "Creating Account..." : "Become an Operator"}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "#fff5f5",
              border: "1px solid #ffcccc",
              color: "#d63031",
              padding: "1rem",
              borderRadius: 8,
              fontSize: "0.95rem",
              fontWeight: 500
            }}>
              ❌ {error}
            </div>
          )}
        </form>

        {/* Login link */}
        <p style={{ marginTop: 32, fontSize: "1rem", textAlign: "center" }}>
          Already have an account? <a href="/login" style={{ color: "#003DB4", fontWeight: 700, textDecoration: "underline" }}>Login</a>
        </p>
      </div>

      {/* Sidebar — why join, in the operator's own terms */}
      <div className="lrr-reg-pad" style={{
        background: "#07152f",
        color: "#fff",
        padding: "3rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.25) 0%, rgba(245,166,35,0) 70%)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F5A623", boxShadow: "0 0 12px 2px rgba(245,166,35,0.7)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", color: "#F5A623", textTransform: "uppercase" }}>
            For tow operators
          </span>
        </div>
        <h3 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.25, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
          You keep Lagos moving. We keep the jobs coming.
        </h3>
        <p style={{ fontSize: "0.92rem", color: "#aab4cc", margin: "0 0 32px", lineHeight: 1.6 }}>
          No subscription, no upfront cost — just real rescue jobs sent straight to your phone.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            "Get paid per job — no monthly fees",
            "Jobs matched to your truck class & location",
            "Automatic WhatsApp alerts, no app to install",
            "Build a rating that wins you more jobs",
          ].map((benefit) => (
            <div key={benefit} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{
                flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                background: "rgba(245,166,35,0.15)", color: "#F5A623",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 700, marginTop: 2,
              }}>
                ✓
              </span>
              <span style={{ fontSize: "0.92rem", color: "#e3e8f2", lineHeight: 1.5 }}>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        input:focus, select:focus { border-color: #003DB4 !important; outline: none; box-shadow: 0 0 0 3px rgba(0,61,180,0.1); }
        .lrr-reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lrr-reg-cols { display: grid; grid-template-columns: 2fr 1fr; }
        @media (max-width: 860px) {
          .lrr-reg-cols { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .lrr-reg-grid { grid-template-columns: 1fr !important; }
          .lrr-reg-pad { padding: 1.75rem 1.25rem !important; }
        }
      `}</style>
    </div>
    </div>
  );
}

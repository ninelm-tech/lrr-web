"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "../hooks";
import { getToken } from "../lib/session";
import { useGooglePlacesAutocomplete } from "../hooks/useGooglePlacesAutocomplete";
import { isValidNigerianPhoneNumber, getPhoneNumberErrorMessage, toNigerianDisplayPhoneNumber } from "../utils/phoneValidation";
import type { RegisterOperatorRequest } from "../types";
import { OperatorType, OPERATOR_TYPES, TruckClass, TRUCK_CLASSES } from "../types";

export default function RegisterPage() {
  const router = useRouter();
  const { registerOperator } = useAuthApi();
  const { address, setAddress, suggestions, selectSuggestion, latLng } = useGooglePlacesAutocomplete();

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
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
    
    if (name === "operatorType") {
      setFormData((prev) => ({ ...prev, [name]: value as OperatorType }));
    } else if (name === "phoneNumber") {
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

    // Validate Nigerian phone number
    if (!isValidNigerianPhoneNumber(formData.phoneNumber)) {
      setError(getPhoneNumberErrorMessage(formData.phoneNumber));
      return;
    }

    if (!address) {
      setError("Please select a service address");
      return;
    }

    if (formData.truckClasses.length === 0) {
      setError("Please select at least one truck class your fleet can operate");
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
        latitude: latLng?.lat || 0,
        longitude: latLng?.lng || 0,
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
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 60% 40%, #dde8f8 0%, #F6FAFF 100%)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
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
      <div style={{
        boxShadow: "0 8px 40px 0 rgba(0,61,180,0.13)",
        background: "#fff",
        borderRadius: 18,
        padding: "2.5rem",
        width: "100%",
        maxWidth: 750,
        animation: "fadeInUp .7s cubic-bezier(.23,1.01,.32,1)"
      }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#003DB4", marginBottom: 24, letterSpacing: "-1px" }}>
          Become an Operator
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Business Information Section */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#003DB4", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #dde8f8" }}>
              Business Information
            </h3>
            <div className="lrr-reg-grid">
              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Your business name"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 08012345678"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: phoneError ? "#fff5f5" : "#F6FAFF",
                    border: `1.5px solid ${phoneError ? "#ffcccc" : "#dde8f8"}`,
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                  }}
                />
                {phoneError && (
                  <p style={{ fontSize: "0.85rem", color: "#d63031", marginTop: 6, margin: "6px 0 0 0" }}>
                    {phoneError}
                  </p>
                )}
                {formData.phoneNumber && !phoneError && (
                  <p style={{ fontSize: "0.85rem", color: "#003DB4", marginTop: 6, margin: "6px 0 0 0" }}>
                    ✓ Valid number
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Operator Type *
                </label>
                <select
                  name="operatorType"
                  value={formData.operatorType}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box",
                    cursor: "pointer"
                  }}
                >
                  {Object.entries(OPERATOR_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Fleet / Truck Classes *
                </label>
                <p style={{ fontSize: "0.8rem", color: "#666", margin: "0 0 8px" }}>
                  Select every truck class in your fleet — this determines which jobs you're offered.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(TRUCK_CLASSES).map(([value, label]) => (
                    <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.95rem", color: "#333" }}>
                      <input
                        type="checkbox"
                        checked={formData.truckClasses.includes(value as TruckClass)}
                        onChange={() => handleTruckClassToggle(value as TruckClass)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Service Radius (km) *
                </label>
                <input
                  type="number"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="1"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Service Location Section */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#003DB4", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #dde8f8" }}>
              Service Location
            </h3>
            <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
              Service Address *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your service location address"
                required
                style={{
                  width: "100%",
                  fontSize: "1rem",
                  background: "#F6FAFF",
                  border: "1.5px solid #dde8f8",
                  borderRadius: 8,
                  padding: "0.9rem 1rem",
                  boxSizing: "border-box"
                }}
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
          </div>

          {/* Login Credentials Section */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#003DB4", marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid #dde8f8" }}>
              Login Credentials
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, color: "#333", marginBottom: 8 }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: "100%",
                    fontSize: "1rem",
                    background: "#F6FAFF",
                    border: "1.5px solid #dde8f8",
                    borderRadius: 8,
                    padding: "0.9rem 1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          </div>

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

        {/* Login / Customer Links */}
        <p style={{ marginTop: 32, fontSize: "1rem", textAlign: "center" }}>
          Already have an account? <a href="/login" style={{ color: "#003DB4", fontWeight: 700, textDecoration: "underline" }}>Login</a>
        </p>
        <p style={{ marginTop: 10, fontSize: "0.88rem", textAlign: "center", color: "#aaa" }}>
          Looking for personal roadside cover?{" "}
          <a href="/register/customer" style={{ color: "#003DB4", textDecoration: "underline" }}>Sign up as a customer</a>
        </p>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: none; }
          }
          input:focus, select:focus { border-color: #003DB4 !important; outline: none; box-shadow: 0 0 0 3px rgba(0,61,180,0.1); }
          .lrr-reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @media (max-width: 600px) {
            .lrr-reg-grid { grid-template-columns: 1fr !important; }
            .lrr-reg-card { padding: 1.5rem 1rem !important; }
          }
        `}</style>
      </div>
    </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../hooks/useSubscription";
import type { Subscription } from "../types";

const PLAN_NAMES: Record<string, string> = {
  INDIVIDUAL_MONTHLY: "Individual Monthly",
  INDIVIDUAL_ANNUAL:  "Individual Annual",
  COMMERCIAL_MONTHLY: "Commercial Monthly",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:    { bg: "#d4edda", color: "#155724", label: "Active" },
  PENDING:   { bg: "#fff3cd", color: "#856404", label: "Pending payment" },
  EXPIRED:   { bg: "#f8d7da", color: "#721c24", label: "Expired" },
  CANCELLED: { bg: "#e2e3e5", color: "#383d41", label: "Cancelled" },
};

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
}

function TowsBar({ used, total }: { used: number; total: number }) {
  const left = Math.max(0, total - used);
  const pct  = total > 0 ? (left / total) * 100 : 0;
  const color = pct === 0 ? "#d63031" : pct < 50 ? "#e67e22" : "#27ae60";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.88rem", color: "#666" }}>Tows remaining this month</span>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color }}>
          {left} / {total}
        </span>
      </div>
      <div style={{ height: 10, background: "#dde8f8", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { mySubscriptions, activeSubscription, towsLeft, loading, error, fetchMySubscriptions, subscribe, cancelSubscription } = useSubscription();
  const [userName, setUserName] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const role  = localStorage.getItem("userRole");
    if (!token) { router.replace("/login"); return; }
    if (role && role !== "CUSTOMER") { router.replace("/dashboard"); return; }
    setUserName(localStorage.getItem("userName") || "");
    fetchMySubscriptions();
  }, [router]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleSubscribe(planKey: string) {
    setSubscribing(true);
    try {
      const url = await subscribe(planKey);
      if (url) window.location.href = url;
    } catch {
      showToast("Failed to start checkout", false);
    } finally {
      setSubscribing(false);
    }
  }

  async function handleCancel() {
    if (!activeSubscription) return;
    setCancelling(true);
    try {
      await cancelSubscription(activeSubscription.id);
      setCancelConfirm(false);
      showToast("Subscription cancelled. You'll keep access until the end of the billing period.");
    } catch {
      showToast("Failed to cancel — please try again", false);
    } finally {
      setCancelling(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    router.replace("/");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6FAFF" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.ok ? "#d4edda" : "#f8d7da",
          color: toast.ok ? "#155724" : "#721c24",
          border: `1px solid ${toast.ok ? "#c3e6cb" : "#f5c6cb"}`,
          borderRadius: 8, padding: "0.75rem 1.25rem",
          fontWeight: 600, boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          maxWidth: 380,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: "#fff", borderBottom: "1px solid #dde8f8",
        padding: "0 2rem", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#003DB4" }}>LRR</span>
          <span style={{ color: "#ccc" }}>|</span>
          <span style={{ color: "#666", fontSize: "0.95rem" }}>My Account</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>{userName}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.9rem", background: "#fff5f5",
              color: "#d63031", border: "1px solid #ffcccc",
              borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1rem" }}>
        <h1 style={{ margin: "0 0 0.25rem 0", fontSize: "1.8rem", fontWeight: 700, color: "#003DB4" }}>
          {userName ? `Welcome, ${userName.split(" ")[0]}!` : "My Dashboard"}
        </h1>
        <p style={{ margin: "0 0 2rem 0", color: "#999", fontSize: "0.95rem" }}>
          Manage your LRR subscription and tow coverage
        </p>

        {loading && mySubscriptions.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#003DB4" }}>Loading your account…</div>
        )}

        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "1rem", borderRadius: 8, marginBottom: "1.5rem", border: "1px solid #f5c6cb" }}>
            {error}
          </div>
        )}

        {/* Active subscription card */}
        {activeSubscription ? (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "2rem",
            border: "2px solid #003DB4", boxShadow: "0 4px 20px rgba(0,61,180,0.12)",
            marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "1.3rem", fontWeight: 700, color: "#333" }}>
                  {PLAN_NAMES[activeSubscription.plan] ?? activeSubscription.plan}
                </h2>
                <span style={{
                  display: "inline-block",
                  padding: "0.3rem 0.8rem",
                  background: STATUS_STYLE[activeSubscription.status]?.bg ?? "#e2e3e5",
                  color: STATUS_STYLE[activeSubscription.status]?.color ?? "#333",
                  borderRadius: 20, fontSize: "0.82rem", fontWeight: 700,
                }}>
                  {STATUS_STYLE[activeSubscription.status]?.label ?? activeSubscription.status}
                </span>
              </div>
              <span style={{ fontSize: "2.5rem" }}>⭐</span>
            </div>

            <TowsBar used={activeSubscription.towsUsedThisMonth} total={activeSubscription.towsIncludedPerMonth} />

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "1rem", margin: "1.5rem 0",
              padding: "1.25rem", background: "#F6FAFF", borderRadius: 10,
              border: "1px solid #dde8f8",
            }}>
              {[
                { label: "Tows included / month", value: activeSubscription.towsIncludedPerMonth },
                { label: "Used this month",        value: activeSubscription.towsUsedThisMonth },
                { label: "Period start",           value: fmtDate(activeSubscription.currentPeriodStart) },
                { label: "Renews / expires",       value: fmtDate(activeSubscription.currentPeriodEnd) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ margin: "0 0 2px 0", fontSize: "0.8rem", color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
                  <p style={{ margin: 0, fontWeight: 700, color: "#333" }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{
              background: "#e8f5e9", borderRadius: 8, padding: "0.9rem 1rem",
              border: "1px solid #c8e6c9", marginBottom: "1.5rem",
            }}>
              <p style={{ margin: 0, color: "#2e7d32", fontSize: "0.92rem", fontWeight: 600 }}>
                ✅ Subscriber benefit: Just send <strong>SOS</strong> on WhatsApp to{" "}
                <strong>0805-577-XXXX</strong> — no deposit required.
              </p>
            </div>

            {/* Cancel */}
            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                style={{
                  background: "transparent", color: "#999",
                  border: "1px solid #e0e0e0", borderRadius: 6,
                  padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.88rem",
                }}
              >
                Cancel subscription
              </button>
            ) : (
              <div style={{ background: "#fff5f5", border: "1px solid #ffcccc", borderRadius: 8, padding: "1rem" }}>
                <p style={{ margin: "0 0 0.75rem 0", color: "#d63031", fontWeight: 600, fontSize: "0.95rem" }}>
                  Are you sure? You'll lose your tow coverage at the end of the billing period.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      padding: "0.5rem 1.2rem", background: "#d63031", color: "#fff",
                      border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700,
                    }}
                  >
                    {cancelling ? "Cancelling…" : "Yes, cancel"}
                  </button>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    style={{
                      padding: "0.5rem 1.2rem", background: "#dde8f8", color: "#003DB4",
                      border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    Keep my plan
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : !loading ? (
          /* No subscription — prompt to subscribe */
          <div style={{
            background: "#fff", borderRadius: 16, padding: "2.5rem",
            border: "2px dashed #b3d9ff", textAlign: "center",
            marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🚗</div>
            <h2 style={{ margin: "0 0 0.5rem 0", color: "#333", fontSize: "1.3rem", fontWeight: 700 }}>
              No active subscription
            </h2>
            <p style={{ margin: "0 0 1.5rem 0", color: "#666", fontSize: "0.95rem" }}>
              Subscribe to skip the ₦5,000 deposit and get tows included in your plan.
            </p>
            <button
              onClick={() => router.push("/plans")}
              style={{
                padding: "0.85rem 2rem",
                background: "linear-gradient(90deg,#003DB4,#003DB4)",
                color: "#fff", border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,61,180,0.2)",
              }}
            >
              View Plans →
            </button>
          </div>
        ) : null}

        {/* Subscription history */}
        {mySubscriptions.filter((s) => s.status !== "ACTIVE").length > 0 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1px solid #dde8f8" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "1.05rem", fontWeight: 600 }}>
              Subscription History
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {mySubscriptions.filter((s) => s.status !== "ACTIVE").map((sub) => {
                const st = STATUS_STYLE[sub.status] ?? { bg: "#e2e3e5", color: "#383d41", label: sub.status };
                return (
                  <div
                    key={sub.id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.75rem 1rem", background: "#F6FAFF", borderRadius: 8, border: "1px solid #dde8f8",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "#333", fontSize: "0.92rem" }}>
                        {PLAN_NAMES[sub.plan] ?? sub.plan}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#999" }}>
                        {fmtDate(sub.currentPeriodStart)} — {fmtDate(sub.currentPeriodEnd)}
                      </p>
                    </div>
                    <span style={{
                      padding: "0.25rem 0.7rem", background: st.bg, color: st.color,
                      borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                    }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: "2rem", background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1px solid #dde8f8" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#333", fontSize: "1.05rem", fontWeight: 600 }}>How to use your coverage</h3>
          {[
            { step: "1", text: "Save our WhatsApp number in your phone: 0805-577-XXXX" },
            { step: "2", text: "When you need help, send SOS, HELP, or just \"rescue\" on WhatsApp" },
            { step: "3", text: "Share your location pin when prompted" },
            { step: "4", text: "As a subscriber, you're dispatched immediately — no deposit needed" },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: "flex", gap: 12, marginBottom: "0.75rem", alignItems: "flex-start" }}>
              <div style={{
                minWidth: 28, height: 28, background: "#dde8f8", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#003DB4", fontWeight: 700, fontSize: "0.85rem",
              }}>
                {step}
              </div>
              <p style={{ margin: 0, color: "#555", fontSize: "0.92rem", paddingTop: 4 }}>{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

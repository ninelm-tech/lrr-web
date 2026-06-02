"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubscription } from "../hooks/useSubscription";

const dm = "var(--font-dm-sans), sans-serif";
const fraunces = "var(--font-fraunces), serif";
const navy = "#07152f";
const blue = "#003DB4";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

function fmtDateFull(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const navItems = [
  { label: "Overview", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label: "Requests",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  { label: "Payments",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M2 10h20"/></svg> },
  { label: "Settings",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg> },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { activeSubscription, loading, fetchMySubscriptions, cancelSubscription } = useSubscription();
  const [userName, setUserName]         = useState("");
  const [activeTab, setActiveTab]       = useState("Overview");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling]     = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);

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

  async function handleCancel() {
    if (!activeSubscription) return;
    setCancelling(true);
    try {
      await cancelSubscription(activeSubscription.id);
      setCancelConfirm(false);
      showToast("Subscription cancelled.");
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

  const firstName = userName.split(" ")[0] || "there";
  const isActive  = activeSubscription?.status === "ACTIVE";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9", fontFamily: dm }}>
      <style>{`
        .cust-sidebar {
          width: 240px; background: ${navy};
          display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0; height: 100vh;
          z-index: 40; transition: transform 0.25s ease;
        }
        .cust-main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .cust-hamburger { display: none !important; }
        .cust-main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }
        .cust-member-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .cust-request-row { display: flex; justify-content: space-between; align-items: center; }
        .cust-table-wrap { overflow-x: auto; }
        .cust-header-title { font-size: 1.75rem; }
        @media (max-width: 767px) {
          .cust-sidebar { transform: translateX(-240px); }
          .cust-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
          .cust-main { margin-left: 0; }
          .cust-hamburger { display: flex !important; }
          .cust-main-grid { grid-template-columns: 1fr !important; }
          .cust-member-grid { grid-template-columns: 1fr 1fr !important; }
          .cust-request-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .cust-header-title { font-size: 1.35rem !important; }
          .cust-req-btn { font-size: 0.82rem !important; padding: 0.55rem 0.9rem !important; }
        }
        @media (max-width: 480px) {
          .cust-member-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.ok ? "#d4edda" : "#f8d7da",
          color: toast.ok ? "#155724" : "#721c24",
          borderRadius: 10, padding: "0.75rem 1.25rem",
          fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`cust-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo + close */}
        <div style={{ padding: "1.5rem 1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lrr-logo-white.png" alt="LRR" style={{ height: 40, objectFit: "contain" }} />
          <button
            className="cust-hamburger"
            onClick={() => setSidebarOpen(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1rem", padding: "0.2rem 0.3rem" }}
          >✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.5rem 0" }}>
          {navItems.map(({ label, icon }) => {
            const active = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveTab(label); setSidebarOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "0.75rem 1.5rem", border: "none", cursor: "pointer",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  fontFamily: dm, fontSize: "0.9rem", fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "0.6rem", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
              color: "rgba(255,255,255,0.5)", fontFamily: dm, fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="cust-main">

        {/* Top bar */}
        <header style={{
          background: "#f4f6f9", padding: "1.25rem 1.5rem 0",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="cust-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{ background: "#fff", border: "1px solid #dde8f8", borderRadius: 8, padding: "0.45rem 0.6rem", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
            >☰</button>
            <div>
              <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.82rem" }}>
                {getGreeting()}, {firstName}
              </p>
              <h1 className="cust-header-title" style={{ margin: 0, fontFamily: fraunces, fontWeight: 700, color: navy }}>
                Member overview
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#dde8f8", display: "flex", alignItems: "center", justifyContent: "center",
              color: navy, fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="cust-main-grid" style={{ flex: 1, padding: "1.25rem 1.5rem 2rem" }}>

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Membership status card */}
            <div style={{
              background: navy, borderRadius: 18, padding: "1.75rem 2rem",
              color: "#fff", position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <p style={{ margin: 0, color: "rgba(219,232,255,0.55)", fontSize: "0.82rem", fontWeight: 500 }}>
                  Membership status
                </p>
                <span style={{
                  padding: "0.3rem 0.85rem", borderRadius: 20,
                  background: isActive ? "rgba(25,165,107,0.2)" : "rgba(255,200,0,0.15)",
                  color: isActive ? "#4ade80" : "#fbbf24",
                  fontSize: "0.78rem", fontWeight: 600,
                }}>
                  {isActive ? "Active" : activeSubscription ? activeSubscription.status : "No plan"}
                </span>
              </div>

              {loading ? (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>Loading…</p>
              ) : activeSubscription ? (
                <>
                  <h2 style={{ fontFamily: fraunces, fontWeight: 700, fontSize: "2rem", margin: "0 0 0.5rem 0" }}>
                    You&apos;re covered.
                  </h2>
                  <p style={{ color: "rgba(219,232,255,0.6)", fontSize: "0.9rem", margin: "0 0 1.75rem 0" }}>
                    Your annual LRR membership is active and ready whenever you need roadside support.
                  </p>
                  <div className="cust-member-grid">
                    {[
                      { label: "Plan",         value: "Annual" },
                      { label: "Member since", value: fmtDate(activeSubscription.currentPeriodStart) },
                      { label: "Next renewal", value: fmtDate(activeSubscription.currentPeriodEnd) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p style={{ margin: "0 0 2px 0", color: "rgba(219,232,255,0.45)", fontSize: "0.75rem" }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: fraunces, fontWeight: 700, fontSize: "1.8rem", margin: "0 0 0.5rem 0" }}>
                    No active plan.
                  </h2>
                  <p style={{ color: "rgba(219,232,255,0.6)", fontSize: "0.9rem", margin: "0 0 1.5rem 0" }}>
                    Subscribe to get unlimited dispatch access and skip the ₦5,000 deposit.
                  </p>
                  <button
                    onClick={() => router.push("/register/customer")}
                    style={{
                      padding: "0.75rem 1.5rem", background: "#fff", color: navy,
                      border: "none", borderRadius: 10, fontWeight: 700,
                      fontSize: "0.9rem", cursor: "pointer",
                    }}
                  >
                    Get membership →
                  </button>
                </>
              )}
            </div>

            {/* Active request card */}
            <div style={{
              background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem",
              border: "1px solid #e8edf5",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Active request</p>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: navy }}>Current assistance</h3>
                </div>
                <span style={{
                  padding: "0.3rem 0.85rem", borderRadius: 20,
                  background: "#fff8e6", color: "#d97706",
                  fontSize: "0.78rem", fontWeight: 600,
                }}>
                  In progress
                </span>
              </div>
              <div className="cust-request-row" style={{ paddingTop: "0.75rem", borderTop: "1px solid #f0f2f5" }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontWeight: 600, color: navy, fontSize: "0.95rem" }}>Battery assistance</p>
                  <p style={{ margin: 0, color: "#6c7890", fontSize: "0.82rem" }}>Lekki Phase 1 · Today, 14:18</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px 0", fontWeight: 700, color: "#19a56b", fontSize: "0.95rem" }}>12 min ETA</p>
                  <p style={{ margin: 0, color: "#6c7890", fontSize: "0.82rem" }}>Operator assigned</p>
                </div>
              </div>
            </div>

            {/* Request history */}
            <div style={{
              background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem",
              border: "1px solid #e8edf5",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Request history</p>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: navy }}>Recent activity</h3>
                </div>
                <button style={{ background: "none", border: "none", color: blue, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: dm }}>
                  View all
                </button>
              </div>
              <div className="cust-table-wrap"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f2f5" }}>
                    {["Service", "Location", "Date", "Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0 0 0.75rem", color: "#6c7890", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { service: "Flat tyre",  location: "Victoria Island", date: "May 18, 2026", status: "Completed" },
                    { service: "Towing",     location: "Ikeja",           date: "Apr 02, 2026", status: "Completed" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f7f9fc" }}>
                      <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: navy, fontWeight: 500 }}>{row.service}</td>
                      <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890" }}>{row.location}</td>
                      <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890" }}>{row.date}</td>
                      <td style={{ padding: "0.9rem 0" }}>
                        <span style={{ color: "#19a56b", fontWeight: 600, fontSize: "0.88rem" }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* WhatsApp CTA */}
            <div style={{ background: "#07152f", borderRadius: 18, padding: "1.5rem", border: "1px solid #1a2f5e" }}>
              <p style={{ margin: "0 0 2px 0", color: "rgba(219,232,255,0.5)", fontSize: "0.78rem", fontWeight: 500 }}>Need help now?</p>
              <h3 style={{ margin: "0 0 0.5rem 0", fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>Request via WhatsApp</h3>
              <p style={{ margin: "0 0 1.25rem 0", color: "rgba(219,232,255,0.6)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Send us a message on WhatsApp and we&apos;ll dispatch the nearest operator to you.
              </p>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "0.85rem", borderRadius: 10,
                  background: "#25D366", color: "#fff", fontFamily: dm, fontWeight: 600,
                  fontSize: "0.9rem", textDecoration: "none",
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
                Message us on WhatsApp
              </a>
            </div>

            {/* Payments */}
            <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem", border: "1px solid #e8edf5" }}>
              <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Payments</p>
              <h3 style={{ margin: "0 0 1rem 0", fontWeight: 700, fontSize: "1.05rem", color: navy }}>Membership billing</h3>
              <p style={{ margin: "0 0 2px 0", fontFamily: fraunces, fontWeight: 700, fontSize: "1.75rem", color: navy }}>
                ₦48,000
              </p>
              <p style={{ margin: "0 0 1rem 0", color: "#6c7890", fontSize: "0.82rem" }}>Annual membership</p>
              <button style={{ background: "none", border: "none", color: blue, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: dm, padding: 0 }}>
                View billing
              </button>
            </div>

            {/* Cancel subscription */}
            {activeSubscription && isActive && (
              <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem", border: "1px solid #e8edf5" }}>
                {!cancelConfirm ? (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    style={{ background: "none", border: "none", color: "#9ca3af", fontFamily: dm, fontSize: "0.85rem", cursor: "pointer", padding: 0 }}
                  >
                    Cancel subscription
                  </button>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 1rem 0", color: "#e53e3e", fontWeight: 600, fontSize: "0.88rem" }}>
                      Cancel your membership?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        style={{ padding: "0.5rem 1rem", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                      >
                        {cancelling ? "…" : "Yes, cancel"}
                      </button>
                      <button
                        onClick={() => setCancelConfirm(false)}
                        style={{ padding: "0.5rem 1rem", background: "#f4f6f9", color: navy, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                      >
                        Keep plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

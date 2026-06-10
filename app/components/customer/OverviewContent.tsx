"use client";
/**
 * Customer member overview — rendered at /dashboard for CUSTOMER role.
 * Chrome lives in the shared PortalShell.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSubscriptionApi, useRescueRequestApi } from "../../hooks";
import type { RescueRequestListItem } from "../../types";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

const dm = "var(--font-dm-sans), sans-serif";
const fraunces = "var(--font-fraunces), serif";
const navy = "#07152f";
const blue = "#003DB4";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { month: "short", year: "numeric" });
}

export default function CustomerOverviewContent() {
  const { activeSubscription, loading, fetchMySubscriptions, subscribe } = useSubscriptionApi();
  const { fetchMyRequests } = useRescueRequestApi();

  const [subscribing, setSubscribing] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [requestHistory, setRequestHistory] = useState<RescueRequestListItem[]>([]);
  const [activeRequest, setActiveRequest]   = useState<RescueRequestListItem | null>(null);
  const [reqLoading, setReqLoading]         = useState(true);

  useEffect(() => {
    fetchMySubscriptions();
    fetchMyRequests({ limit: 10 })
      .then((res) => {
        const all = res?.data ?? [];
        const active = all.find((r) => !["COMPLETED", "CANCELLED"].includes(r.status));
        setActiveRequest(active ?? null);
        setRequestHistory(all.filter((r) => ["COMPLETED", "CANCELLED"].includes(r.status)).slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setReqLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const url = await subscribe("INDIVIDUAL_ANNUAL");
      if (url) {
        window.location.href = url;
      } else {
        showToast("Could not start checkout — please try again", false);
      }
    } catch {
      showToast("Could not start checkout — please try again", false);
    } finally {
      setSubscribing(false);
    }
  }

  const isActive = activeSubscription?.status === "ACTIVE";

  // Human-readable plan label derived from subscription data (not hardcoded).
  const planLabel = activeSubscription
    ? `${(activeSubscription as any).plan === "COMMERCIAL" ? "Fleet" : "Individual"} ${(((activeSubscription as any).monthlyAmountKobo ?? 0) >= 1000000) ? "Annual" : "Monthly"}`
    : "—";

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.ok ? "#d4edda" : "#f8d7da",
          color: toast.ok ? "#155724" : "#721c24",
          borderRadius: 10, padding: "0.75rem 1.25rem",
          fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontFamily: dm,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="cust-main-grid">
        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Membership status card */}
          <div style={{
            background: navy, borderRadius: 18, padding: "1.75rem 2rem",
            color: "#fff", position: "relative", overflow: "hidden", fontFamily: dm,
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
                  Your LRR membership is active and ready whenever you need roadside support.
                </p>
                <div className="cust-member-grid">
                  {[
                    { label: "Plan",         value: planLabel },
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
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  style={{
                    padding: "0.75rem 1.5rem", background: "#fff", color: navy,
                    border: "none", borderRadius: 10, fontWeight: 700, fontFamily: dm,
                    fontSize: "0.9rem", cursor: subscribing ? "not-allowed" : "pointer",
                    opacity: subscribing ? 0.7 : 1,
                  }}
                >
                  {subscribing ? "Starting checkout…" : "Get membership →"}
                </button>
              </>
            )}
          </div>

          {/* Active request card */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem", border: "1px solid #e8edf5", fontFamily: dm }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Active request</p>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: navy }}>Current assistance</h3>
              </div>
            </div>
            {reqLoading ? (
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.88rem" }}>Loading…</p>
            ) : activeRequest ? (
              <div className="cust-request-row" style={{ paddingTop: "0.75rem", borderTop: "1px solid #f0f2f5" }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontWeight: 600, color: navy, fontSize: "0.95rem" }}>
                    {activeRequest.issueType?.replace(/_/g, " ") ?? "Assistance"}
                  </p>
                  <p style={{ margin: 0, color: "#6c7890", fontSize: "0.82rem" }}>
                    {new Date(activeRequest.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: 20,
                    background: "#fff8e6", color: "#d97706", fontSize: "0.78rem", fontWeight: 600,
                  }}>
                    {activeRequest.status.replace(/_/g, " ")}
                  </span>
                  {activeRequest.assignedOperator && (
                    <p style={{ margin: "4px 0 0", color: "#19a56b", fontSize: "0.82rem", fontWeight: 600 }}>
                      {activeRequest.assignedOperator.businessName}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.88rem" }}>No active request right now.</p>
            )}
          </div>

          {/* Request history (preview) */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem", border: "1px solid #e8edf5", fontFamily: dm }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Request history</p>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: navy }}>Recent activity</h3>
              </div>
              <Link href="/requests" style={{ color: blue, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", fontFamily: dm }}>
                View all
              </Link>
            </div>
            <div className="cust-table-wrap"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f2f5" }}>
                  {["Service", "Operator", "Date", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0 0 0.75rem", color: "#6c7890", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reqLoading ? (
                  <tr><td colSpan={4} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>Loading…</td></tr>
                ) : requestHistory.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>No past requests yet.</td></tr>
                ) : requestHistory.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: navy, fontWeight: 500 }}>
                      {r.issueType?.replace(/_/g, " ") ?? "Assistance"}
                    </td>
                    <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890" }}>
                      {r.assignedOperator?.businessName ?? "—"}
                    </td>
                    <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.9rem 0" }}>
                      <span style={{
                        fontWeight: 600, fontSize: "0.88rem",
                        color: r.status === "COMPLETED" ? "#19a56b" : r.status === "CANCELLED" ? "#dc2626" : "#6c7890",
                      }}>
                        {r.status === "COMPLETED" ? "Completed" : r.status === "CANCELLED" ? "Cancelled" : r.status.replace(/_/g, " ")}
                      </span>
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
          <div style={{ background: "#07152f", borderRadius: 18, padding: "1.5rem", border: "1px solid #1a2f5e", fontFamily: dm }}>
            <p style={{ margin: "0 0 2px 0", color: "rgba(219,232,255,0.5)", fontSize: "0.78rem", fontWeight: 500 }}>Need help now?</p>
            <h3 style={{ margin: "0 0 0.5rem 0", fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>Request via WhatsApp</h3>
            <p style={{ margin: "0 0 1.25rem 0", color: "rgba(219,232,255,0.6)", fontSize: "0.85rem", lineHeight: 1.5 }}>
              Send us a message on WhatsApp and we&apos;ll dispatch the nearest operator to you.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "0.85rem", borderRadius: 10,
                background: "#25D366", color: "#fff", fontFamily: dm, fontWeight: 600,
                fontSize: "0.9rem", textDecoration: "none", boxSizing: "border-box",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z"/>
              </svg>
              Message us on WhatsApp
            </a>
          </div>

          {/* Billing summary */}
          {activeSubscription && (
            <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem", border: "1px solid #e8edf5", fontFamily: dm }}>
              <p style={{ margin: "0 0 2px 0", color: "#6c7890", fontSize: "0.78rem", fontWeight: 500 }}>Payments</p>
              <h3 style={{ margin: "0 0 1rem 0", fontWeight: 700, fontSize: "1.05rem", color: navy }}>Membership billing</h3>
              <p style={{ margin: "0 0 2px 0", fontFamily: fraunces, fontWeight: 700, fontSize: "1.75rem", color: navy }}>
                ₦{(((activeSubscription as any).monthlyAmountKobo ?? 0) / 100).toLocaleString("en-NG")}
              </p>
              <p style={{ margin: 0, color: "#6c7890", fontSize: "0.82rem" }}>
                {(activeSubscription as any).plan === "INDIVIDUAL" ? "Individual plan" : "Commercial plan"}
              </p>
            </div>
          )}

          {/* Manage membership → Settings */}
          {activeSubscription && isActive && (
            <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem", border: "1px solid #e8edf5", fontFamily: dm }}>
              <Link
                href="/settings"
                style={{ color: "#9ca3af", fontFamily: dm, fontSize: "0.85rem", textDecoration: "none" }}
              >
                Manage membership →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

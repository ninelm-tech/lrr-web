"use client";
/**
 * Customer › Requests tab
 * Full paginated rescue-request history (all statuses).
 */
import { useCallback, useEffect, useState } from "react";
import { useRescueRequestApi } from "../../hooks";
import type { RescueRequestListItem, RescueRequestListResponse, RescueRequestDetail } from "../../types";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const blue = "#003DB4";

const PAGE_SIZE = 10;

function statusPill(status: string) {
  const s = status?.toUpperCase() ?? "";
  const map: Record<string, { bg: string; fg: string }> = {
    COMPLETED:         { bg: "#e8f8f0", fg: "#19a56b" },
    CANCELLED:         { bg: "#fdeaea", fg: "#dc2626" },
    DISPATCHING:       { bg: "#fff8e6", fg: "#d97706" },
    OPERATOR_ASSIGNED: { bg: "#eef5ff", fg: blue },
    IN_PROGRESS:       { bg: "#eef5ff", fg: blue },
    ARRIVED:           { bg: "#eef5ff", fg: blue },
  };
  const c = map[s] ?? { bg: "#f4f6f9", fg: "#6c7890" };
  return (
    <span style={{
      display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: 20,
      background: c.bg, color: c.fg, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.replace(/_/g, " ") || "—"}
    </span>
  );
}

export default function RequestsTab() {
  const { fetchMyRequests, fetchDetail } = useRescueRequestApi();
  const [rows, setRows]       = useState<RescueRequestListItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<RescueRequestDetail | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const load = useCallback((p: number) => {
    setLoading(true);
    fetchMyRequests({ page: p, limit: PAGE_SIZE })
      .then((res: RescueRequestListResponse) => {
        setRows(res?.data ?? []);
        setTotal(res?.meta?.total ?? 0);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchMyRequests]);

  useEffect(() => { load(1); }, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function hasReceipt(r: RescueRequestListItem): boolean {
    return r.status === "COMPLETED" && r.depositPaid && r.balancePaid;
  }

  function openReceipt(r: RescueRequestListItem) {
    if (!hasReceipt(r)) return;
    setReceiptLoading(true);
    fetchDetail(r.id)
      .then(setReceipt)
      .catch(() => {})
      .finally(() => setReceiptLoading(false));
  }

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem", border: "1px solid #e8edf5", fontFamily: dm }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f2f5" }}>
              {["Operator", "Date", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0 0 0.75rem", color: "#6c7890", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>No requests yet. Send SOS on WhatsApp when you need help.</td></tr>
            ) : rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => openReceipt(r)}
                style={{
                  borderBottom: "1px solid #f7f9fc",
                  cursor: hasReceipt(r) ? "pointer" : "default",
                }}
              >
                <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: navy, fontWeight: 500 }}>
                  {r.assignedOperator?.businessName ?? "—"}
                </td>
                <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890", whiteSpace: "nowrap" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "0.9rem 0" }}>
                  {statusPill(r.status)}
                  {hasReceipt(r) && (
                    <span style={{ marginLeft: 8, fontSize: "0.78rem", color: blue, fontWeight: 600 }}>Receipt →</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: "1rem" }}>
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1 || loading}
            style={{ padding: "0.4rem 0.9rem", borderRadius: 8, border: "1px solid #dde8f8", background: "#fff", color: page <= 1 ? "#c3cbda" : blue, fontWeight: 600, fontSize: "0.85rem", cursor: page <= 1 ? "not-allowed" : "pointer", fontFamily: dm }}
          >
            ← Prev
          </button>
          <span style={{ color: "#6c7890", fontSize: "0.85rem" }}>Page {page} of {pages}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pages || loading}
            style={{ padding: "0.4rem 0.9rem", borderRadius: 8, border: "1px solid #dde8f8", background: "#fff", color: page >= pages ? "#c3cbda" : blue, fontWeight: 600, fontSize: "0.85rem", cursor: page >= pages ? "not-allowed" : "pointer", fontFamily: dm }}
          >
            Next →
          </button>
        </div>
      )}

      {(receiptLoading || receipt) && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          className="lrr-receipt-backdrop"
          onClick={() => setReceipt(null)}
        >
          <div
            className="lrr-receipt-card"
            style={{ background: "#fff", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", fontFamily: dm, fontSize: "0.85rem", color: "#333" }}
            onClick={e => e.stopPropagation()}
          >
            {receiptLoading ? (
              <p style={{ color: "#999", fontSize: "0.9rem" }}>Loading receipt…</p>
            ) : receipt && (
              <>
                <div style={{ textAlign: "center", borderBottom: "1px dashed #ccc", paddingBottom: "1rem", marginBottom: "1rem" }}>
                  <img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 36, display: "block", margin: "0 auto 0.5rem" }} />
                  <div style={{ color: "#999", fontSize: "0.75rem" }}>Receipt · #{receipt.id.slice(0, 10)}…</div>
                </div>

                {[
                  ["Service", receipt.vehicleType ?? "—"],
                  ["Destination", receipt.destination ?? "—"],
                  ["Operator", receipt.assignedOperator?.businessName ?? "—"],
                  ["Date", new Date(receipt.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "#6c7890" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}

                <div style={{ borderTop: "1px dashed #ccc", paddingTop: "0.75rem", marginTop: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "#6c7890" }}>Deposit</span>
                    <span>₦{((receipt.depositAmount ?? 0) / 100).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                    <span style={{ color: "#6c7890" }}>Balance</span>
                    <span>₦{((receipt.balanceAmount ?? 0) / 100).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #333", paddingTop: "0.5rem", fontSize: "0.95rem" }}>
                    <span>TOTAL</span>
                    <span>₦{(((receipt.depositAmount ?? 0) + (receipt.balanceAmount ?? 0)) / 100).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "1rem", padding: "0.6rem", background: "#e8f8f0", borderRadius: 8, color: "#19a56b", fontWeight: 700, fontSize: "0.85rem" }}>
                  ✓ PAID IN FULL
                </div>

                <div className="lrr-receipt-actions" style={{ display: "flex", gap: 10, marginTop: "1.25rem" }}>
                  <button
                    onClick={() => window.print()}
                    style={{ flex: 1, padding: "0.6rem", background: blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: dm }}
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setReceipt(null)}
                    style={{ flex: 1, padding: "0.6rem", background: "#dde8f8", color: blue, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontFamily: dm }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .lrr-receipt-card, .lrr-receipt-card * { visibility: visible; }
          .lrr-receipt-backdrop {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            background: none !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: center !important;
            padding-top: 1in !important;
          }
          .lrr-receipt-card { box-shadow: none !important; margin-top: 0 !important; }
          .lrr-receipt-actions { display: none !important; }
        }
      `}</style>
    </div>
  );
}

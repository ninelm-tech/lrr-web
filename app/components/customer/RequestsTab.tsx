"use client";
/**
 * Customer › Requests tab
 * Full paginated rescue-request history (all statuses).
 */
import { useCallback, useEffect, useState } from "react";
import { useRescueRequestApi } from "../../hooks";
import type { RescueRequestListItem, RescueRequestListResponse } from "../../types";

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
  const { fetchMyRequests } = useRescueRequestApi();
  const [rows, setRows]       = useState<RescueRequestListItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem", border: "1px solid #e8edf5", fontFamily: dm }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f2f5" }}>
              {["Service", "Operator", "Date", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0 0 0.75rem", color: "#6c7890", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "1rem 0", color: "#9ca3af", fontSize: "0.88rem" }}>No requests yet. Send SOS on WhatsApp when you need help.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: navy, fontWeight: 500 }}>
                  {r.issueType?.replace(/_/g, " ") ?? "Assistance"}
                </td>
                <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890" }}>
                  {r.assignedOperator?.businessName ?? "—"}
                </td>
                <td style={{ padding: "0.9rem 0", fontSize: "0.92rem", color: "#6c7890", whiteSpace: "nowrap" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "0.9rem 0" }}>{statusPill(r.status)}</td>
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
    </div>
  );
}

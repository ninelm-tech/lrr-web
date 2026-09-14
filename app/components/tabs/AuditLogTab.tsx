"use client";
import { Fragment, useEffect, useState } from "react";
import { useAuditLogApi } from "../../hooks";
import type { AuditLogEntry } from "../../hooks";

const CATEGORY_LABELS: Record<string, string> = {
  staff_created: "Staff Created",
  password_reset_no_otp: "Password Reset (No OTP)",
  deposit_refunded: "Deposit Refunded",
  payout_retried: "Payout Retried",
  platform_settings_updated: "Platform Settings Updated",
  dispute_resolved: "Dispute Resolved",
  unrecognized_transfer_webhook: "Unrecognized Transfer Webhook",
};

// category is a plain string on the backend, not a fixed enum — a new one
// can show up here at any time, so the fallback humanizes whatever arrives
// rather than showing the raw snake_case string.
function formatCategory(category: string): string {
  return (
    CATEGORY_LABELS[category] ??
    category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogTab() {
  const { fetchAuditLog, markReviewed } = useAuditLogApi();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditLog({ category: categoryFilter || undefined, page, limit })
      .then((res) => {
        setEntries(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [fetchAuditLog, categoryFilter, page, limit]);

  async function handleReview(id: string) {
    setReviewing(id);
    try {
      await markReviewed(id);
      const refreshed = await fetchAuditLog({ category: categoryFilter || undefined, page, limit });
      setEntries(refreshed.data);
      setTotal(refreshed.meta.total);
    } finally {
      setReviewing(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading) return <div>Loading audit log…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #e8edf5", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #dde8f8" }}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <span style={{ fontSize: "0.85rem", color: "#999" }}>{total} entries</span>
      </div>

      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 10, border: "1px solid #dde8f8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
              {["When", "Category", "Message", "Actor", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#666" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "1.5rem 1rem", textAlign: "center", color: "#999" }}>
                  No audit log entries match this filter.
                </td>
              </tr>
            )}
            {entries.map((entry) => {
              const isExpanded = expanded === entry.id;
              return (
                <Fragment key={entry.id}>
                  <tr style={{ borderBottom: "1px solid #f0f8ff" }}>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#999", whiteSpace: "nowrap" }}>
                      {fmtDate(entry.createdAt)}
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem" }}>
                      <span style={{ display: "inline-block", padding: "0.25rem 0.6rem", background: "#eef5ff", color: "#274b8a", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>
                        {formatCategory(entry.category)}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.88rem", color: "#333", maxWidth: 320 }}>
                      {entry.message}
                      {entry.details && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : entry.id)}
                          style={{ display: "block", marginTop: 4, background: "none", border: "none", padding: 0, color: "#003DB4", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          {isExpanded ? "Hide details" : "Show details"}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#666", fontFamily: "monospace" }}>
                      {entry.actorId ?? "— system —"}
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      {entry.reviewedAt ? (
                        <span style={{ display: "inline-block", padding: "0.25rem 0.6rem", background: "#d4edda", color: "#155724", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>
                          Reviewed
                        </span>
                      ) : (
                        <span style={{ display: "inline-block", padding: "0.25rem 0.6rem", background: "#fff3cd", color: "#856404", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>
                          Unreviewed
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      {!entry.reviewedAt && (
                        <button
                          onClick={() => handleReview(entry.id)}
                          disabled={reviewing === entry.id}
                          style={{ padding: "0.3rem 0.7rem", background: "#003DB4", color: "#fff", border: "none", borderRadius: 4, cursor: reviewing === entry.id ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          {reviewing === entry.id ? "Marking…" : "Mark Reviewed"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && entry.details && (
                    <tr>
                      <td colSpan={6} style={{ padding: "0 1rem 0.9rem", background: "#fafcff" }}>
                        <pre style={{ margin: 0, padding: "0.75rem", background: "#0f1729", color: "#c9d6ea", borderRadius: 6, fontSize: "0.78rem", overflowX: "auto" }}>
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

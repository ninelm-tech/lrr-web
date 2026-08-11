"use client";
import { useEffect, useState } from "react";
import { usePayoutApi } from "../../hooks";
import type { PayoutListItem } from "../../hooks";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:    { bg: "#fff3cd", text: "#856404", label: "Pending" },
  PROCESSING: { bg: "#cfe2ff", text: "#084298", label: "Processing" },
  SUCCESS:    { bg: "#d4edda", text: "#155724", label: "Success" },
  FAILED:     { bg: "#f8d7da", text: "#721c24", label: "Failed" },
};

const BLOCK_REASON_LABELS: Record<string, string> = {
  NO_BANK_DETAILS: "No bank details on file",
  INSUFFICIENT_BALANCE: "Insufficient platform balance",
};

function fmtNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-NG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function PayoutsTab() {
  const { fetchPayouts, retryPayout } = usePayoutApi();
  const [payouts, setPayouts] = useState<PayoutListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts(filterStatus || undefined).then(setPayouts).finally(() => setLoading(false));
  }, [fetchPayouts, filterStatus]);

  async function handleRetry(id: string) {
    setRetrying(id);
    try {
      await retryPayout(id);
      const refreshed = await fetchPayouts(filterStatus || undefined);
      setPayouts(refreshed);
    } finally {
      setRetrying(null);
    }
  }

  if (loading) return <div>Loading payouts…</div>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #dde8f8" }}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 10, border: "1px solid #dde8f8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
              {["Job", "Operator", "Amount", "Status", "Reason", "Created", "Completed", "Actions"].map((h) => (
                <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#666" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => {
              const st = STATUS_STYLES[p.status];
              const reason = p.blockReason ? BLOCK_REASON_LABELS[p.blockReason] : p.failureReason;
              const canRetry = p.status === "FAILED" || (p.status === "PENDING" && p.blockReason);
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f8ff" }}>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#666" }}>{p.rescueRequest.id}</td>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>{p.operator.businessName}</td>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>{fmtNaira(p.amount)}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <span style={{ display: "inline-block", padding: "0.3rem 0.7rem", background: st.bg, color: st.text, borderRadius: 4, fontSize: "0.82rem", fontWeight: 600 }}>
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#999" }}>{reason ?? "—"}</td>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#999" }}>{fmtDate(p.createdAt)}</td>
                  <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#999" }}>{p.completedAt ? fmtDate(p.completedAt) : "—"}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    {canRetry && (
                      <button
                        onClick={() => handleRetry(p.id)}
                        disabled={retrying === p.id}
                        style={{ padding: "0.3rem 0.7rem", background: "#003DB4", color: "#fff", border: "none", borderRadius: 4, cursor: retrying === p.id ? "not-allowed" : "pointer", fontSize: "0.82rem", fontWeight: 600 }}
                      >
                        {retrying === p.id ? "Retrying…" : "Retry"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

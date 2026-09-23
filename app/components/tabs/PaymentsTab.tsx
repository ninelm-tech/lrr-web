"use client";
import { useEffect, useState } from "react";
import { usePaymentApi } from "../../hooks";
import type { UserRole } from "../../types";
import type { PaymentRecord, PaymentType, PaymentStatus } from "../../hooks/usePaymentApi";

interface PaymentsTabProps {
  role: UserRole | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n / 100);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-NG", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function paystackReferenceFor(payment: Pick<PaymentRecord, "id" | "type" | "paystackReference">) {
  if (payment.paystackReference) return payment.paystackReference;
  if (payment.type === "REFUND") return null;
  const prefix = payment.type === "PAYOUT" ? "payout" : payment.type === "BALANCE" ? "BAL" : "DEP";
  return `${prefix}_${payment.id}`;
}

const STATUS_STYLES: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  PENDING:             { label: "Pending",    bg: "#fff3cd", color: "#856404" },
  SUBMITTED:           { label: "Submitted",  bg: "#dde8f8", color: "#003DB4" },
  BLOCKED:             { label: "Blocked",    bg: "#fff3cd", color: "#856404" },
  SUCCEEDED:           { label: "Succeeded",  bg: "#d4edda", color: "#155724" },
  DUPLICATE_SUCCEEDED: { label: "Duplicate",  bg: "#f8d7da", color: "#721c24" },
  FAILED:              { label: "Failed",     bg: "#f8d7da", color: "#721c24" },
  REVERSED:            { label: "Reversed",   bg: "#f8d7da", color: "#721c24" },
};

const TYPE_LABELS: Record<PaymentType, string> = {
  DEPOSIT: "Deposit",
  BALANCE: "Balance",
  REFUND:  "Refund",
  PAYOUT:  "Payout",
};

export default function PaymentsTab({ role }: PaymentsTabProps) {
  void role;

  const {
    records, loading, error, total, page, limit,
    fetchPaymentList: fetchList, fetchSummary,
  } = usePaymentApi();

  const [summary, setSummary] = useState({
    depositCollected: 0, balanceCollected: 0, totalCollected: 0,
    depositPending: 0, balancePending: 0, totalOutstanding: 0,
  });
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Filters
  const [filterType,   setFilterType]   = useState<"" | PaymentType>("");
  const [filterStatus, setFilterStatus] = useState<"" | PaymentStatus>("");
  const [filterFrom,   setFilterFrom]   = useState("");
  const [filterTo,     setFilterTo]     = useState("");

  useEffect(() => {
    fetchList({ page: 1, limit: 20 });
    fetchSummary().then((s) => {
      setSummary(s);
      setSummaryLoaded(true);
    });
  }, [fetchList, fetchSummary]);

  const applyFilters = () => {
    const opts = {
      type:   filterType   || undefined,
      status: filterStatus || undefined,
      from:   filterFrom   || undefined,
      to:     filterTo     || undefined,
    };
    fetchList({ ...opts, page: 1, limit: 20 });
    fetchSummary(opts).then((s) => {
      setSummary(s);
      setSummaryLoaded(true);
    });
  };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Collected",      value: summaryLoaded ? fmt(summary.totalCollected)     : "…", color: "#155724", bg: "#d4edda" },
          { label: "Deposits Collected",   value: summaryLoaded ? fmt(summary.depositCollected)    : "…", color: "#003DB4", bg: "#dde8f8" },
          { label: "Balances Collected",   value: summaryLoaded ? fmt(summary.balanceCollected)    : "…", color: "#003DB4", bg: "#dde8f8" },
          { label: "In-Flight / Outstanding", value: summaryLoaded ? fmt(summary.totalOutstanding) : "…", color: "#856404", bg: "#fff3cd" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            style={{
              background: bg, padding: "1.25rem", borderRadius: 10,
              border: `1px solid ${bg === "#d4edda" ? "#c3e6cb" : bg === "#fff3cd" ? "#ffc107" : "#b8daff"}`,
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontSize: "0.82rem", color: "#666", fontWeight: 600 }}>{label}</p>
            <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,61,180,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "" | PaymentType)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All</option>
              {(Object.keys(TYPE_LABELS) as PaymentType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "" | PaymentStatus)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All</option>
              {(Object.keys(STATUS_STYLES) as PaymentStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>From</label>
            <input
              type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>To</label>
            <input
              type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            />
          </div>
          <button
            onClick={applyFilters}
            style={{
              padding: "0.55rem 1.2rem", background: "#003DB4", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "1rem", borderRadius: 8, marginBottom: "1rem", border: "1px solid #f5c6cb" }}>
          {error}
        </div>
      )}

      {/* Table — one row per payment ATTEMPT, not per request. A request with
          a failed retry followed by a successful one shows both rows. */}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,61,180,0.08)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1440 }}>
            <thead>
              <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
                {["Date", "Type", "Amount", "Paystack Reference", "Rescue ID", "Customer", "Operator", "Status", "Detail"].map((h) => (
                  <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#666" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#003DB4" }}>Loading payments...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No payment records found</td>
                </tr>
              ) : (
                records.map((p: PaymentRecord) => {
                  const statusStyle = STATUS_STYLES[p.status];
                  const operatorName = p.payoutOperator?.businessName ?? p.assignedOperator?.businessName;
                  const paystackReference = paystackReferenceFor(p);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f0f8ff" }}>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.88rem", color: "#666" }}>
                        {fmtDate(p.createdAt)}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {TYPE_LABELS[p.type]}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#333" }}>
                        {fmt(p.amount)}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#333", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {paystackReference ?? <span style={{ color: "#aaa", fontFamily: "inherit" }}>—</span>}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#333", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {p.rescueRequestId}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {p.customer.phoneNumber || "Not provided"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {operatorName ?? <span style={{ color: "#aaa" }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-block", padding: "0.3rem 0.7rem",
                            background: statusStyle.bg, color: statusStyle.color,
                            borderRadius: 4, fontSize: "0.8rem", fontWeight: 600,
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.82rem", color: "#721c24" }}>
                        {p.failureReason ?? (p.blockReason ? `Blocked: ${p.blockReason}` : "—")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.9rem", color: "#666" }}>
          Page {page} of {Math.max(1, Math.ceil(total / limit))} ({total} total)
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            disabled={page === 1}
            onClick={() => fetchList({ page: page - 1, limit })}
            style={{
              padding: "0.55rem 1.2rem", borderRadius: 6, border: "none",
              background: page === 1 ? "#e0e0e0" : "#003DB4",
              color: page === 1 ? "#999" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => fetchList({ page: page + 1, limit })}
            style={{
              padding: "0.55rem 1.2rem", borderRadius: 6, border: "none",
              background: page >= Math.ceil(total / limit) ? "#e0e0e0" : "#003DB4",
              color: page >= Math.ceil(total / limit) ? "#999" : "#fff",
              cursor: page >= Math.ceil(total / limit) ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

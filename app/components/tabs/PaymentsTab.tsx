"use client";
import { useEffect, useState } from "react";
import { usePaymentApi } from "../../hooks";
import type { UserRole, RescueRequestListItem } from "../../types";

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

export default function PaymentsTab({ role }: PaymentsTabProps) {
  const {
    records: requests, loading, error, total, page, limit,
    fetchPaymentList: fetchList, fetchSummary,
  } = usePaymentApi();

  const [summaryDepositPaid,    setSummaryDepositPaid]    = useState(0);
  const [summaryBalancePaid,    setSummaryBalancePaid]    = useState(0);
  const [summaryDepositPending, setSummaryDepositPending] = useState(0);
  const [summaryBalancePending, setSummaryBalancePending] = useState(0);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Filters
  const [filterDeposit, setFilterDeposit] = useState<"" | "paid" | "unpaid">("");
  const [filterBalance, setFilterBalance] = useState<"" | "paid" | "unpaid">("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo,   setFilterTo]   = useState("");

  useEffect(() => {
    fetchList({ page: 1, limit: 20 });
    fetchSummary().then((s) => {
      setSummaryDepositPaid(s.depositCollected);
      setSummaryBalancePaid(s.balanceCollected);
      setSummaryDepositPending(s.depositPending);
      setSummaryBalancePending(s.balancePending);
      setSummaryLoaded(true);
    });
  }, []);

  const applyFilters = () => {
    fetchList({
      depositPaid: filterDeposit === "paid" ? true : filterDeposit === "unpaid" ? false : undefined,
      balancePaid: filterBalance === "paid" ? true : filterBalance === "unpaid" ? false : undefined,
      from: filterFrom || undefined,
      to:   filterTo   || undefined,
      page: 1,
      limit: 20,
    });
  };

  const totalCollected = summaryDepositPaid + summaryBalancePaid;
  const totalOutstanding = summaryDepositPending + summaryBalancePending;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Collected",      value: summaryLoaded ? fmt(totalCollected)           : "…", color: "#155724", bg: "#d4edda" },
          { label: "Deposits Collected",   value: summaryLoaded ? fmt(summaryDepositPaid)        : "…", color: "#003DB4", bg: "#dde8f8" },
          { label: "Balances Collected",   value: summaryLoaded ? fmt(summaryBalancePaid)        : "…", color: "#003DB4", bg: "#dde8f8" },
          { label: "Outstanding Balance",  value: summaryLoaded ? fmt(totalOutstanding)          : "…", color: "#856404", bg: "#fff3cd" },
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
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Deposit Status</label>
            <select
              value={filterDeposit}
              onChange={(e) => setFilterDeposit(e.target.value as "" | "paid" | "unpaid")}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Balance Status</label>
            <select
              value={filterBalance}
              onChange={(e) => setFilterBalance(e.target.value as "" | "paid" | "unpaid")}
              style={{ width: "100%", padding: "0.55rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,61,180,0.08)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
                {["Date", "Customer", "Issue", "Operator", "Deposit", "Balance", "Total", "Status"].map((h) => (
                  <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#666" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#003DB4" }}>Loading payments...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No payment records found</td>
                </tr>
              ) : (
                requests.map((r: RescueRequestListItem & { depositAmount?: number; balanceAmount?: number }) => {
                  const depositAmt = r.depositAmount ?? 500000;
                  const balanceAmt = r.balanceAmount ?? 4500000;
                  const totalAmt   = (r.depositPaid ? depositAmt : 0) + (r.balancePaid ? balanceAmt : 0);
                  const fullyPaid  = r.depositPaid && r.balancePaid;
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f0f8ff" }}>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.88rem", color: "#666" }}>
                        {fmtDate(r.createdAt)}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {r.customer.phoneNumber.replace("whatsapp:", "")}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {r.issueType ?? "—"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {r.assignedOperator?.businessName ?? <span style={{ color: "#aaa" }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: r.depositPaid ? "#155724" : "#721c24" }}>
                          {r.depositPaid ? "✓" : "✗"} {fmt(depositAmt)}
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        {r.status === "COMPLETED" || r.balancePaid ? (
                          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: r.balancePaid ? "#155724" : "#721c24" }}>
                            {r.balancePaid ? "✓" : "✗"} {fmt(balanceAmt)}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "#aaa" }}>Not due</span>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#333" }}>
                        {fmt(totalAmt)}
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            display: "inline-block", padding: "0.3rem 0.7rem",
                            background: fullyPaid ? "#d4edda" : r.depositPaid ? "#fff3cd" : "#f8d7da",
                            color: fullyPaid ? "#155724" : r.depositPaid ? "#856404" : "#721c24",
                            borderRadius: 4, fontSize: "0.8rem", fontWeight: 600,
                          }}
                        >
                          {fullyPaid ? "Settled" : r.depositPaid ? "Partial" : "Pending"}
                        </span>
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
          Page {page} of {Math.ceil(total / limit)} ({total} total)
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

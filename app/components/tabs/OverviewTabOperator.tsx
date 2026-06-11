"use client";
import { useEffect, useState } from "react";
import { useOperatorApi, useRescueRequestApi } from "../../hooks";
import PendingOffers from "../PendingOffers";

const navy = "#07152f";
const blue = "#003DB4";
const green = "#16a34a";
const orange = "#ea580c";

const STATUS_COLOR: Record<string, string> = {
  DISPATCHING: "#7c3aed", OPERATOR_ASSIGNED: "#0891b2", IN_PROGRESS: "#003DB4",
  COMPLETED: "#16a34a", CANCELLED: "#dc2626", ARRIVED: "#0284c7",
};

function statusBadge(status: string) {
  const color = STATUS_COLOR[status] ?? "#6c7890";
  return (
    <span style={{
      display: "inline-block", padding: "0.22rem 0.65rem", borderRadius: 20,
      background: color + "1a", color, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function OverviewTabOperator() {
  const { fetchMe, setAvailability } = useOperatorApi();
  const { fetchList }                = useRescueRequestApi();

  const [loading,    setLoading]    = useState(true);
  const [operator,   setOperator]   = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [history,    setHistory]    = useState<any[]>([]);
  const [toggling,   setToggling]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetchMe(),
      fetchList({ limit: 5, status: "OPERATOR_ASSIGNED" }).catch(() => ({ data: [] })),
      fetchList({ limit: 5, status: "IN_PROGRESS"       }).catch(() => ({ data: [] })),
      fetchList({ limit: 10, status: "COMPLETED"        }).catch(() => ({ data: [] })),
    ]).then(([op, assignedRes, inProgressRes, historyRes]) => {
      setOperator(op);
      setActiveJobs([...(assignedRes.data ?? []), ...(inProgressRes.data ?? [])]);
      setHistory(historyRes.data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function toggleAvailability() {
    if (!operator) return;
    setToggling(true);
    try {
      const updated = await setAvailability(operator.id, !operator.isAvailable);
      setOperator((prev: any) => ({ ...prev, isAvailable: updated?.isAvailable ?? !prev.isAvailable }));
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <div style={{ color: blue }}>Loading overview…</div>;

  const isAvailable = operator?.isAvailable ?? false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Live dispatch offers — accept/decline without leaving the dashboard */}
      <PendingOffers />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {/* Availability toggle */}
        <button
          onClick={toggleAvailability}
          disabled={toggling || !operator}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "0.55rem 1.1rem", borderRadius: 10, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: "0.88rem",
            background: isAvailable ? "#dcfce7" : "#fee2e2",
            color: isAvailable ? "#15803d" : "#dc2626",
            opacity: toggling ? 0.6 : 1, transition: "all 0.15s",
          }}
        >
          <span style={{
            width: 10, height: 10, borderRadius: "50%",
            background: isAvailable ? "#16a34a" : "#dc2626",
            display: "inline-block",
          }} />
          {toggling ? "Updating…" : isAvailable ? "Available for jobs" : "Unavailable"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Active Jobs",      value: activeJobs.length,    accent: activeJobs.length > 0 ? orange : blue },
          { label: "Completed Jobs",   value: history.length,       accent: green },
          { label: "Status",           value: operator?.status ?? "—", accent: operator?.status === "ACTIVE" ? green : "#d97706" },
          { label: "Service Radius",   value: `${operator?.serviceRadius ?? "—"} km`, accent: blue },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #e8edf5" }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.8rem", color: "#6c7890", fontWeight: 500 }}>{label}</p>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Active jobs */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f3f8" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: navy }}>
            Active Jobs {activeJobs.length > 0 && <span style={{ background: orange + "1a", color: orange, borderRadius: 20, padding: "0.1rem 0.55rem", fontSize: "0.8rem", marginLeft: 6 }}>{activeJobs.length}</span>}
          </h2>
        </div>
        {activeJobs.length === 0 ? (
          <p style={{ margin: 0, padding: "1.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>No active jobs right now.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                  {["Time", "Customer", "Issue", "Status"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeJobs.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                      {new Date(r.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: navy, fontWeight: 500 }}>
                      {r.customer?.name || r.customer?.phoneNumber || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#6c7890" }}>{r.issueType?.replace(/_/g, " ") ?? "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job history */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f3f8" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: navy }}>Recent Completed Jobs</h2>
        </div>
        {history.length === 0 ? (
          <p style={{ margin: 0, padding: "1.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>No completed jobs yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                  {["Date", "Customer", "Issue", "Earnings"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((r: any) => {
                  const total = (r.depositAmount ?? 0) + (r.balanceAmount ?? 0);
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: navy, fontWeight: 500 }}>
                        {r.customer?.name || r.customer?.phoneNumber || "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#6c7890" }}>{r.issueType?.replace(/_/g, " ") ?? "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontWeight: 700, color: total > 0 ? green : "#9ca3af" }}>
                        {total > 0 ? `₦${(total / 100).toLocaleString("en-NG")}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRescueRequestApi, useOperatorApi, useAuthApi } from "../../hooks";
import type { AdminOverviewStats } from "../../hooks";
import type { UserRole } from "../../types";

const navy = "#07152f";
const blue = "#003DB4";

function StatCard({ label, value, sub, accent = blue }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem",
      border: "1px solid #e8edf5", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#6c7890", fontWeight: 500 }}>{label}</p>
      <span style={{ fontSize: "2rem", fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{sub}</span>}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  DISPATCHING: "#7c3aed", OPERATOR_ASSIGNED: "#0891b2", IN_PROGRESS: "#003DB4",
  COMPLETED: "#16a34a", CANCELLED: "#dc2626", PENDING: "#d97706",
  WAITING_FOR_DEPOSIT: "#ea580c", ARRIVED: "#0284c7",
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

export default function OverviewTabAdmin({ role }: { role: UserRole | null }) {
  const { fetchAdminOverviewStats, fetchList } = useRescueRequestApi();
  const { fetchAll: fetchAllOperators }        = useOperatorApi();
  const { listUsers }                          = useAuthApi();

  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState<AdminOverviewStats & { availableOps: number; pendingApproval: number; totalOps: number } | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentSignups,  setRecentSignups]  = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetchAdminOverviewStats(),
      fetchAllOperators(),
      fetchList({ limit: 8 }),
      listUsers({ limit: 5, page: 1 }),
    ])
      .then(([overview, operators, recent, signups]) => {
        const availableOps    = operators.filter((o) => o.isAvailable && o.status === "ACTIVE").length;
        const pendingApproval = operators.filter((o) => o.status === "PENDING").length;

        setStats({ ...overview, availableOps, pendingApproval, totalOps: operators.length });
        setRecentRequests(recent.data ?? []);
        setRecentSignups(signups.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  if (loading || !stats) return <div style={{ color: blue }}>Loading overview…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1rem" }}>
        <StatCard label="Total Requests"      value={stats.totalRequests}   sub="All time" />
        <StatCard label="Active Now"          value={stats.activeTotal}     sub="Dispatching / assigned / in progress" accent={stats.activeTotal > 0 ? "#ea580c" : blue} />
        <StatCard label="Completed Today"     value={stats.completedToday}  sub="Since midnight" accent="#16a34a" />
        <StatCard label="Available Operators" value={stats.availableOps}    sub={`${stats.pendingApproval} pending approval`} />
        <StatCard label="Total Operators"     value={stats.totalOps}        sub="All registered" />
      </div>

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
          <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f0f3f8" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: navy }}>Recent Rescue Requests</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                  {["Time", "Customer", "Issue", "Status", "Operator"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                      {new Date(r.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: navy, fontWeight: 500 }}>
                      {r.customer?.name || r.customer?.phoneNumber?.replace("whatsapp:", "") || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#6c7890" }}>
                      {r.issueType?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{statusBadge(r.status)}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#6c7890" }}>
                      {r.assignedOperator?.businessName ?? <span style={{ color: "#c4c9d4" }}>Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent signups */}
      {recentSignups.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
          <div style={{ padding: "1.1rem 1.5rem", borderBottom: "1px solid #f0f3f8" }}>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: navy }}>Recent Signups</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                  {["Name / Phone", "Email", "Role", "Joined"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: navy, fontWeight: 500 }}>
                      {u.name || u.phoneNumber || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>{u.email ?? "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 20,
                        background: u.role === "OPERATOR" ? "#eff6ff" : u.role === "SUPER_ADMIN" ? "#fef3c7" : "#f0fdf4",
                        color: u.role === "OPERATOR" ? blue : u.role === "SUPER_ADMIN" ? "#92400e" : "#15803d",
                        fontSize: "0.76rem", fontWeight: 600,
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#9ca3af" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

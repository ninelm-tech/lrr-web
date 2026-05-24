"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import RescueRequestsTabAdmin from "../components/tabs/RescueRequestsTabAdmin";
import RescueRequestsTabOperator from "../components/tabs/RescueRequestsTabOperator";
import OperatorsTab from "../components/tabs/OperatorsTab";
import PaymentsTab from "../components/tabs/PaymentsTab";
import { apiFetch } from "../hooks/api";
import type { UserRole } from "../types";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("userRole") as UserRole;
      if (!token) { router.replace("/login"); return; }
      setUserRole(role);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#0070f3" }}>Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "requests":
        return <RescueRequestsTab role={userRole} />;
      case "operators":
        return (
          <div>
            <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>🚗 Operators</h1>
            <OperatorsTab role={userRole} />
          </div>
        );
      case "admins":
        return userRole === "SUPER_ADMIN" ? <AdminsTab /> : null;
      case "payments":
        return (
          <div>
            <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>💳 Payments</h1>
            <PaymentsTab role={userRole} />
          </div>
        );
      case "reports":
        return userRole === "SUPER_ADMIN" ? <ReportsTab /> : null;
      case "jobs":
        return userRole === "OPERATOR" ? <JobsTab /> : null;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return userRole === "SUPER_ADMIN" ? <SettingsTab /> : null;
      default:
        return <OverviewTab role={userRole} />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      {renderContent()}
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────
//  Overview Tab — live stats from API
// ─────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string | number;
  trend: string;
  color?: string;
}

function StatCardEl({ label, value, trend, color = "#0070f3" }: StatCard) {
  return (
    <div
      style={{
        background: "#fff", padding: "1.5rem", borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,112,243,0.1)", border: "1px solid #e0f3ff",
      }}
    >
      <p style={{ margin: "0 0 0.5rem 0", color: "#999", fontSize: "0.9rem" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
        <span style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</span>
        <span style={{ fontSize: "0.85rem", color: "#00c6ff", fontWeight: 600 }}>{trend}</span>
      </div>
    </div>
  );
}

function OverviewTab({ role }: { role: UserRole | null }) {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!role) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const fromStr = todayStart.toISOString();
    const toStr   = todayEnd.toISOString();

    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      Promise.all([
        apiFetch("/rescue-requests?limit=1"),
        apiFetch("/rescue-requests?limit=1&status=DISPATCHING"),
        apiFetch("/rescue-requests?limit=1&status=OPERATOR_ASSIGNED"),
        apiFetch(`/rescue-requests?limit=1&status=COMPLETED&from=${fromStr}&to=${toStr}`),
        apiFetch("/operators"),
        apiFetch("/rescue-requests?limit=5"),
      ])
        .then(([allRes, dispatchingRes, assignedRes, completedTodayRes, opsRes, recentRes]) => {
          const totalRequests    = allRes?.meta?.total ?? 0;
          const activeRequests   = (dispatchingRes?.meta?.total ?? 0) + (assignedRes?.meta?.total ?? 0);
          const completedToday   = completedTodayRes?.meta?.total ?? 0;
          const availableOps     = (opsRes?.data ?? []).filter((o: any) => o.isAvailable && o.status === "ACTIVE").length;
          const pendingApproval  = (opsRes?.data ?? []).filter((o: any) => o.status === "PENDING").length;

          setStats([
            { label: "Total Requests",      value: totalRequests,   trend: "All time"   },
            { label: "Active Now",           value: activeRequests,  trend: "Live",       color: activeRequests > 0 ? "#e67e22" : "#0070f3" },
            { label: "Completed Today",      value: completedToday,  trend: "Today"      },
            { label: "Available Operators",  value: availableOps,    trend: `${pendingApproval} pending approval` },
          ]);
          setRecentRequests(recentRes?.data ?? []);
        })
        .catch(() => setStats([]))
        .finally(() => setStatsLoading(false));
    } else if (role === "OPERATOR") {
      Promise.all([
        apiFetch("/rescue-requests?limit=1&status=DISPATCHING"),
        apiFetch("/rescue-requests?limit=1&status=OPERATOR_ASSIGNED"),
        apiFetch(`/rescue-requests?limit=1&status=COMPLETED&from=${fromStr}&to=${toStr}`),
        apiFetch("/rescue-requests?limit=5"),
      ])
        .then(([dispatchingRes, assignedRes, completedTodayRes, recentRes]) => {
          setStats([
            { label: "Jobs Offered",     value: dispatchingRes?.meta?.total ?? 0,  trend: "Pending response" },
            { label: "Active Jobs",      value: assignedRes?.meta?.total ?? 0,     trend: "In progress", color: "#e67e22" },
            { label: "Completed Today",  value: completedTodayRes?.meta?.total ?? 0, trend: "Today" },
          ]);
          setRecentRequests(recentRes?.data ?? []);
        })
        .catch(() => setStats([]))
        .finally(() => setStatsLoading(false));
    } else {
      setStatsLoading(false);
    }
  }, [role]);

  const statusColor: Record<string, string> = {
    DISPATCHING: "#383d41", OPERATOR_ASSIGNED: "#0c5460", IN_PROGRESS: "#004085",
    COMPLETED: "#155724", CANCELLED: "#721c24", PENDING: "#856404",
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>
        Welcome back! 👋
      </h1>

      {/* Stats grid */}
      {statsLoading ? (
        <div style={{ color: "#0070f3", marginBottom: "2rem" }}>Loading stats...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {stats.map((s, i) => <StatCardEl key={i} {...s} />)}
        </div>
      )}

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,112,243,0.1)", border: "1px solid #e0f3ff" }}>
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", color: "#333" }}>Recent Requests</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e0f3ff" }}>
                {["Time", "Customer", "Issue", "Status", "Operator"].map((h) => (
                  <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: "left", fontSize: "0.82rem", fontWeight: 600, color: "#999" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f8fbff" }}>
                  <td style={{ padding: "0.7rem 0.8rem", fontSize: "0.88rem", color: "#666" }}>
                    {new Date(r.createdAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "0.7rem 0.8rem", fontSize: "0.9rem", color: "#333" }}>
                    {r.customer?.phoneNumber?.replace("whatsapp:", "") ?? "—"}
                  </td>
                  <td style={{ padding: "0.7rem 0.8rem", fontSize: "0.9rem", color: "#333" }}>
                    {r.issueType ?? "—"}
                  </td>
                  <td style={{ padding: "0.7rem 0.8rem" }}>
                    <span style={{
                      display: "inline-block", padding: "0.25rem 0.6rem",
                      background: "#f0f8ff", color: statusColor[r.status] ?? "#333",
                      borderRadius: 4, fontSize: "0.8rem", fontWeight: 600,
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.7rem 0.8rem", fontSize: "0.9rem", color: "#333" }}>
                    {r.assignedOperator?.businessName ?? <span style={{ color: "#aaa" }}>Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Rescue Requests Tab
// ─────────────────────────────────────────────────────────────
function RescueRequestsTab({ role }: { role: UserRole | null }) {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>🆘 Rescue Requests</h1>
      {(role === "SUPER_ADMIN" || role === "ADMIN") ? (
        <RescueRequestsTabAdmin role={role} />
      ) : role === "OPERATOR" ? (
        <RescueRequestsTabOperator role={role} />
      ) : (
        <PlaceholderCard text="Access denied" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Stub tabs
// ─────────────────────────────────────────────────────────────
function PlaceholderCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "#fff", padding: "2rem", borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,112,243,0.1)", border: "1px solid #e0f3ff",
      textAlign: "center", color: "#999",
    }}>
      <p>{text}</p>
    </div>
  );
}

function AdminsTab() {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>👥 Admin Management</h1>
      <PlaceholderCard text="Admin management coming soon..." />
    </div>
  );
}

function ReportsTab() {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>📈 Reports</h1>
      <PlaceholderCard text="Reports coming soon..." />
    </div>
  );
}

function JobsTab() {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>📋 My Jobs</h1>
      <PlaceholderCard text="Jobs interface coming soon..." />
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>👤 My Profile</h1>
      <PlaceholderCard text="Profile management coming soon..." />
    </div>
  );
}

function SettingsTab() {
  return (
    <div>
      <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", color: "#0070f3" }}>⚙️ Settings</h1>
      <PlaceholderCard text="Platform settings coming soon..." />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Root export
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#0070f3" }}>Loading dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

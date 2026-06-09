"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import RescueRequestsTabAdmin    from "../components/tabs/RescueRequestsTabAdmin";
import RescueRequestsTabOperator from "../components/tabs/RescueRequestsTabOperator";
import OperatorsTab              from "../components/tabs/OperatorsTab";
import PaymentsTab               from "../components/tabs/PaymentsTab";
import OverviewTabAdmin          from "../components/tabs/OverviewTabAdmin";
import OverviewTabOperator       from "../components/tabs/OverviewTabOperator";
import OperatorMembersTab        from "../components/tabs/OperatorMembersTab";
import ManageUsersTab            from "../components/tabs/ManageUsersTab";
import type { UserRole } from "../types";

// ─────────────────────────────────────────────────────────────
//  Small helpers
// ─────────────────────────────────────────────────────────────
function PlaceholderCard({ text }: { text: string }) {
  return (
    <div style={{
      background: "#fff", padding: "2rem", borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,61,180,0.1)", border: "1px solid #dde8f8",
      textAlign: "center", color: "#999",
    }}>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
}

function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", fontWeight: 800, color: "#07152f" }}>
      {children}
    </h1>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main dashboard content — role-gated routing
// ─────────────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      const role  = localStorage.getItem("userRole") as UserRole;
      if (!token) { router.replace("/login"); return; }
      setUserRole(role);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#003DB4" }}>Loading…</p>
      </div>
    );
  }

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const isOp    = userRole === "OPERATOR";

  const renderContent = () => {
    switch (tab) {

      // ── Overview ──────────────────────────────────────────
      case "overview":
        if (isAdmin) return <OverviewTabAdmin role={userRole} />;
        if (isOp)    return <OverviewTabOperator />;
        return <PlaceholderCard text="Overview not available for this role." />;

      // ── Rescue Requests ───────────────────────────────────
      case "requests":
        return (
          <div>
            <PageTitle>🆘 Rescue Requests</PageTitle>
            {isAdmin ? (
              <RescueRequestsTabAdmin role={userRole} />
            ) : isOp ? (
              <RescueRequestsTabOperator role={userRole} />
            ) : (
              <PlaceholderCard text="Access denied." />
            )}
          </div>
        );

      // ── Operators ─────────────────────────────────────────
      case "operators":
        return isAdmin ? (
          <div>
            <PageTitle>🚗 Operators</PageTitle>
            <OperatorsTab role={userRole} />
          </div>
        ) : (
          <PlaceholderCard text="Access denied." />
        );

      // ── Manage Users (Super Admin) ────────────────────────
      case "users":
        return (userRole === "SUPER_ADMIN" || userRole === "ADMIN")
          ? <ManageUsersTab />
          : <PlaceholderCard text="Access denied." />;

      // ── Payments ──────────────────────────────────────────
      case "payments":
        return (
          <div>
            <PageTitle>💳 Payments</PageTitle>
            <PaymentsTab role={userRole} />
          </div>
        );

      // ── Operator jobs (full request list for operators) ───
      case "jobs":
        return isOp ? (
          <div>
            <PageTitle>📋 My Jobs</PageTitle>
            <RescueRequestsTabOperator role={userRole} />
          </div>
        ) : (
          <PlaceholderCard text="Access denied." />
        );

      // ── Team / Members (Operators) ────────────────────────
      case "members":
        return isOp
          ? <OperatorMembersTab />
          : <PlaceholderCard text="Access denied." />;

      // ── Reports ───────────────────────────────────────────
      case "reports":
        return isAdmin ? (
          <div>
            <PageTitle>📈 Reports</PageTitle>
            <PlaceholderCard text="Detailed reports coming soon." />
          </div>
        ) : (
          <PlaceholderCard text="Access denied." />
        );

      // ── Profile ───────────────────────────────────────────
      case "profile":
        return (
          <div>
            <PageTitle>👤 My Profile</PageTitle>
            <PlaceholderCard text="Profile management coming soon." />
          </div>
        );

      // ── Settings ──────────────────────────────────────────
      case "settings":
        return userRole === "SUPER_ADMIN" ? (
          <div>
            <PageTitle>⚙️ Settings</PageTitle>
            <PlaceholderCard text="Platform settings coming soon." />
          </div>
        ) : (
          <PlaceholderCard text="Access denied." />
        );

      default:
        return <PlaceholderCard text="Page not found." />;
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      {renderContent()}
    </DashboardLayout>
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
          <p style={{ color: "#003DB4" }}>Loading dashboard…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

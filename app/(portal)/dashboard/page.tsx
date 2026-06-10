"use client";
/**
 * /dashboard — role-aware overview. Everyone lands here after login.
 * Also translates legacy ?tab= URLs to the new top-level routes.
 */
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "../../hooks";
import OverviewTabAdmin       from "../../components/tabs/OverviewTabAdmin";
import OverviewTabOperator    from "../../components/tabs/OverviewTabOperator";
import CustomerOverviewContent from "../../components/customer/OverviewContent";

// Legacy /dashboard?tab=x → new routes (old bookmarks / WhatsApp links keep working)
const LEGACY_TAB_ROUTES: Record<string, string> = {
  requests:  "/requests",
  jobs:      "/requests",
  operators: "/operators",
  users:     "/users",
  payments:  "/payments",
  members:   "/team",
  profile:   "/settings",
  settings:  "/settings",
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, role } = useAuthState();

  const legacyTab = searchParams.get("tab");
  useEffect(() => {
    if (legacyTab && LEGACY_TAB_ROUTES[legacyTab]) {
      router.replace(LEGACY_TAB_ROUTES[legacyTab]);
    }
  }, [legacyTab, router]);

  if (!ready) return null;

  if (role === "ADMIN" || role === "SUPER_ADMIN") return <OverviewTabAdmin role={role} />;
  if (role === "OPERATOR") return <OverviewTabOperator />;
  return <CustomerOverviewContent />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p style={{ color: "#003DB4" }}>Loading…</p>}>
      <DashboardContent />
    </Suspense>
  );
}

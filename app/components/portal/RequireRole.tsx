"use client";
/**
 * RequireRole
 * -----------
 * Permission gate for portal page content. Renders children only when the
 * logged-in user's role is allowed; otherwise redirects to /dashboard.
 * (The token guard lives in PortalShell — this is the role layer on top.)
 */
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "../../hooks";
import type { UserRole } from "../../types";

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

export default function RequireRole({ roles, children }: RequireRoleProps) {
  const router = useRouter();
  const { ready, role } = useAuthState();

  const allowed = ready && role !== null && roles.includes(role);

  useEffect(() => {
    if (ready && !allowed) router.replace("/dashboard");
  }, [ready, allowed, router]);

  if (!allowed) return null;
  return <>{children}</>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 style={{ margin: "0 0 1.5rem 0", fontSize: "2rem", fontWeight: 800, color: "#07152f" }}>
      {children}
    </h1>
  );
}

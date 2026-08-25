"use client";
import { usePathname } from "next/navigation";

export default function AppHeaderWrapper() {
  const pathname = usePathname();

  // Portal routes render their own shell (PortalShell) — no public header there.
  const PORTAL_PATHS = [
    "/dashboard", "/requests", "/operators", "/users", "/team", "/payments", "/settings", "/customer",
    "/dispatch-board", "/platform-settings", "/payouts",
  ];
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    PORTAL_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return null;
  }

  return (
    <header style={{
      width: "100%",
      background: "#fff",
      borderBottom: "1px solid #dde8f8",
      padding: "0 2rem",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 4px rgba(0,61,180,0.05)",
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 36, objectFit: "contain" }} />
      </a>
      <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <a href="/plans" style={{ color: "#555", fontWeight: 500, fontSize: "0.92rem", textDecoration: "none" }}>Plans</a>
        <a href="/login" style={{ color: "#555", fontWeight: 500, fontSize: "0.92rem", textDecoration: "none" }}>Login</a>
        <a href="/register/customer" style={{ padding: "0.45rem 1.1rem", borderRadius: 7, background: "#003DB4", color: "#fff", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
          Get Covered
        </a>
      </nav>
    </header>
  );
}

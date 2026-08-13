"use client";
/**
 * PortalShell
 * -----------
 * THE shared chrome for the whole portal — every role gets the same sidebar
 * and header. Menu items are filtered by role (see nav.ts); page content is
 * permission-gated per route (see RequireRole.tsx).
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Siren,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAuthApi, useAuthState } from "../../hooks";
import { navForRole, PortalIconName, PortalNavItem } from "./nav";

const NAV_ICONS: Record<PortalIconName, React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  "layout-dashboard": LayoutDashboard,
  "sirens": Siren,
  "car": Car,
  "users": Users,
  "user-cog": UserCog,
  "credit-card": CreditCard,
  "settings": Settings,
};

export default function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, fetchMe } = useAuthApi();
  const { ready, isLoggedIn, role, userName } = useAuthState();

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const loggingOutRef = useRef(false);

  const displayName = userName.trim() || "";

  // Token guard — the portal is for logged-in users only. Skipped during an
  // explicit logout: logout() flips isLoggedIn false synchronously, which
  // would otherwise re-trigger this effect and redirect to /login (which
  // itself bounces to /?login=1) racing against handleLogout's own
  // router.replace("/") — landing every logout on /?login=1 instead of "/".
  useEffect(() => {
    if (ready && !isLoggedIn && !loggingOutRef.current) router.replace("/login");
  }, [ready, isLoggedIn, router]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!ready || !isLoggedIn || displayName) return;
    fetchMe().catch(() => {
      // ignore; UI falls back to role label below
    });
  }, [ready, isLoggedIn, displayName, fetchMe]);

  const menuItems = navForRole(role);
  const currentPageTitle =
    menuItems.find((item) => item.href === pathname)?.label ||
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ||
    "Overview";

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {} as Record<string, PortalNavItem[]>);

  function handleLogout() {
    if (typeof window !== "undefined" && confirm("Are you sure you want to logout?")) {
      loggingOutRef.current = true;
      logout();
      router.replace("/");
    }
  }

  function getRoleDisplayName() {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN":       return "Operations";
      case "OPERATOR":    return "Operator";
      case "CUSTOMER":    return "Member";
      default:            return "User";
    }
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  function navigate(href: string) {
    setSidebarOpen(false);
    router.push(href);
  }

  if (!ready || !isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9" }}>
        <p style={{ color: "#003DB4", fontFamily: "var(--font-dm-sans), sans-serif" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6FAFF" }}>
      <style>{`
        .lrr-sidebar {
          width: 240px; background: #07152f;
          display: flex; flex-direction: column;
          position: fixed; left: 0; top: 0; bottom: 0; height: 100vh;
          z-index: 40; transition: transform 0.25s ease;
        }
        .lrr-main { flex: 1; display: flex; flex-direction: column; margin-left: 240px; min-height: 100vh; background: #f4f6f9; }
        .lrr-hamburger { display: none; }
        .lrr-username  { display: inline; }
        .cust-main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; align-items: start; }
        .cust-member-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .cust-request-row { display: flex; justify-content: space-between; align-items: center; }
        .cust-table-wrap { overflow-x: auto; }
        @media (max-width: 767px) {
          .lrr-sidebar { transform: translateX(-240px); }
          .lrr-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
          .lrr-main { margin-left: 0; }
          .lrr-hamburger { display: flex !important; }
          .lrr-username { display: none; }
          .cust-main-grid { grid-template-columns: 1fr !important; }
          .cust-member-grid { grid-template-columns: 1fr 1fr !important; }
          .cust-request-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
        @media (max-width: 480px) {
          .cust-member-grid { grid-template-columns: 1fr !important; }
        }
        .lrr-nav-btn {
          width: 100%; padding: 0.75rem 1.5rem; border: none; background: transparent;
          text-align: left; cursor: pointer; color: rgba(255,255,255,0.45); font-size: 0.9rem; font-weight: 400;
          display: flex; align-items: center; gap: 12px; transition: background 0.15s, color 0.15s;
          font-family: var(--font-dm-sans), sans-serif;
        }
        .lrr-nav-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
        .lrr-nav-btn.active { background: rgba(255,255,255,0.1); color: #fff; font-weight: 600; }
        .lrr-dd-btn {
          width: 100%; padding: 0.7rem 1rem; border: none; background: transparent;
          text-align: left; cursor: pointer; font-size: 0.9rem; color: #333; transition: background 0.15s;
        }
        .lrr-dd-btn:hover { background: #f0f7ff; }
      `}</style>

      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — identical for every role; items filtered by permission */}
      <aside className={`lrr-sidebar${sidebarOpen ? " open" : ""}`}>
        <div style={{ padding: "1.5rem 1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lrr-logo-white.png" alt="Lagos Roadside Rescue" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          <button
            className="lrr-hamburger"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", padding: "0.2rem 0.3rem", cursor: "pointer", fontSize: "1rem" }}
          ><X size={16} strokeWidth={2.25} /></button>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
          {Object.entries(groupedMenuItems).map(([section, items]) => (
            <div key={section} style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.6px", padding: "0.4rem 1.5rem", margin: "0 0 0.25rem 0" }}>
                {section}
              </p>
              {items.map((item) => (
                <button
                  key={item.href}
                  className={`lrr-nav-btn${pathname === item.href ? " active" : ""}`}
                  onClick={() => navigate(item.href)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", opacity: 0.8 }}>
                    {(() => {
                      const Icon = NAV_ICONS[item.icon];
                      return <Icon size={16} strokeWidth={2.15} />;
                    })()}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={handleLogout}
            style={{ width: "100%", padding: "0.65rem 1rem", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: "0.88rem" }}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lrr-main">
        <header style={{
          background: "#f4f6f9", borderBottom: "1px solid #e8edf5",
          padding: "0 1.5rem", display: "flex", justifyContent: "space-between",
          alignItems: "center", height: 64, position: "sticky", top: 0, zIndex: 20, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              className="lrr-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{ background: "#F6FAFF", border: "1px solid #dde8f8", borderRadius: 8, padding: "0.45rem 0.6rem", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
            ><Menu size={16} strokeWidth={2.25} /></button>
            <span style={{ marginLeft: 10, fontFamily: "var(--font-fraunces), serif", fontWeight: 700, color: "#003DB4", fontSize: "1.75rem", lineHeight: 1.1 }}>
              {currentPageTitle}
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.45rem 0.75rem", border: "1px solid #dde8f8", background: "#F6FAFF", borderRadius: 8, cursor: "pointer", color: "#003DB4", fontWeight: 600, fontSize: "0.9rem" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#003DB4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                {getInitials(displayName || getRoleDisplayName())}
              </div>
              <span className="lrr-username">{displayName || getRoleDisplayName()}</span>
              <span style={{ display: "inline-flex", alignItems: "center", opacity: 0.7 }}><ChevronDown size={13} strokeWidth={2.4} /></span>
            </button>

            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 210, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,61,180,0.15)", border: "1px solid #dde8f8", zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #dde8f8", background: "#F6FAFF" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#333" }}>{displayName || getRoleDisplayName()}</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.78rem", color: "#aaa" }}>{getRoleDisplayName()}</p>
                </div>
                <div style={{ padding: "0.4rem 0" }}>
                  <button className="lrr-dd-btn" onClick={() => { setDropdownOpen(false); navigate("/settings"); }} style={{ display: "flex", alignItems: "center", gap: 8 }}><User size={14} /> My Profile</button>
                </div>
                <div style={{ borderTop: "1px solid #dde8f8", padding: "0.4rem 0" }}>
                  <button className="lrr-dd-btn" onClick={handleLogout} style={{ color: "#d63031", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><LogOut size={14} /> Logout</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto", background: "#f4f6f9" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

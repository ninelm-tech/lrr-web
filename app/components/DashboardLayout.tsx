"use client";
import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  section?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: UserRole | null;
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const menusByRole: Record<string, MenuItem[]> = {
    SUPER_ADMIN: [
      { label: "Dashboard",       href: "/dashboard",               icon: "📊", section: "Main" },
      { label: "Rescue Requests", href: "/dashboard?tab=requests",  icon: "🆘", section: "Main" },
      { label: "Operators",       href: "/dashboard?tab=operators", icon: "🚗", section: "Management" },
      { label: "Admins",          href: "/dashboard?tab=admins",    icon: "👥", section: "Management" },
      { label: "Payments",        href: "/dashboard?tab=payments",  icon: "💳", section: "Financial" },
      { label: "Reports",         href: "/dashboard?tab=reports",   icon: "📈", section: "Financial" },
      { label: "Settings",        href: "/dashboard?tab=settings",  icon: "⚙️", section: "System" },
    ],
    ADMIN: [
      { label: "Dashboard",       href: "/dashboard",               icon: "📊", section: "Main" },
      { label: "Rescue Requests", href: "/dashboard?tab=requests",  icon: "🆘", section: "Main" },
      { label: "Operators",       href: "/dashboard?tab=operators", icon: "🚗", section: "Management" },
      { label: "Payments",        href: "/dashboard?tab=payments",  icon: "💳", section: "Financial" },
    ],
    OPERATOR: [
      { label: "Dashboard", href: "/dashboard",             icon: "📊", section: "Main" },
      { label: "Jobs",      href: "/dashboard?tab=jobs",    icon: "📋", section: "Main" },
      { label: "Profile",   href: "/dashboard?tab=profile", icon: "👤", section: "Account" },
    ],
  };

  const currentMenuItems = userRole ? menusByRole[userRole] || [] : [];
  const groupedMenuItems = currentMenuItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  function handleLogout() {
    if (typeof window !== "undefined" && confirm("Are you sure you want to logout?")) {
      logout();
      router.replace("/");
    }
  }

  function getRoleDisplayName(role: UserRole | undefined | null) {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN":       return "Operations";
      case "OPERATOR":    return "Operator";
      default:            return "User";
    }
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  function navigate(href: string) {
    setSidebarOpen(false);
    router.push(href);
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
        @media (max-width: 767px) {
          .lrr-sidebar { transform: translateX(-240px); }
          .lrr-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
          .lrr-main { margin-left: 0; }
          .lrr-hamburger { display: flex !important; }
          .lrr-username { display: none; }
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

      {/* Sidebar */}
      <aside className={`lrr-sidebar${sidebarOpen ? " open" : ""}`}>
        <div style={{ padding: "1.5rem 1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img src="/lrr-logo-white.png" alt="Lagos Roadside Rescue" style={{ height: 40, width: "auto", objectFit: "contain" }} />
          <button
            className="lrr-hamburger"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", padding: "0.2rem 0.3rem", cursor: "pointer", fontSize: "1rem" }}
          >✕</button>
        </div>

        <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
          {Object.entries(groupedMenuItems).map(([section, items]) => (
            <div key={section} style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.6px", padding: "0.4rem 1.5rem", margin: "0 0 0.25rem 0" }}>
                {section}
              </p>
              {items.map((item) => (
                <button key={item.label} className={`lrr-nav-btn${tab === item.label.toLowerCase() || (tab === "overview" && item.href === "/dashboard") ? " active" : ""}`} onClick={() => navigate(item.href)}>
                  <span style={{ fontSize: "1rem", opacity: 0.7 }}>{item.icon}</span>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="lrr-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{ background: "#F6FAFF", border: "1px solid #dde8f8", borderRadius: 8, padding: "0.45rem 0.6rem", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
            >☰</button>
            <img src="/lrr-logo.png" alt="Lagos Roadside Rescue" style={{ height: 32, width: "auto", objectFit: "contain" }} />
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.45rem 0.75rem", border: "1px solid #dde8f8", background: "#F6FAFF", borderRadius: 8, cursor: "pointer", color: "#003DB4", fontWeight: 600, fontSize: "0.9rem" }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#003DB4", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem", flexShrink: 0 }}>
                {getInitials(userName)}
              </div>
              <span className="lrr-username">{userName || "User"}</span>
              <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 210, background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,61,180,0.15)", border: "1px solid #dde8f8", zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #dde8f8", background: "#F6FAFF" }}>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#333" }}>{userName}</p>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.78rem", color: "#aaa" }}>{getRoleDisplayName(userRole)}</p>
                </div>
                <div style={{ padding: "0.4rem 0" }}>
                  <button className="lrr-dd-btn" onClick={() => { setDropdownOpen(false); navigate("/dashboard?tab=profile"); }}>👤 My Profile</button>
                </div>
                <div style={{ borderTop: "1px solid #dde8f8", padding: "0.4rem 0" }}>
                  <button className="lrr-dd-btn" onClick={handleLogout} style={{ color: "#d63031", fontWeight: 600 }}>🚪 Logout</button>
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

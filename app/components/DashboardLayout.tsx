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

  // Define menu items for each role with sections
  const menusByRole: Record<string, MenuItem[]> = {
    SUPER_ADMIN: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", section: "Main" },
      { label: "Rescue Requests", href: "/dashboard?tab=requests", icon: "🆘", section: "Main" },
      { label: "Operators", href: "/dashboard?tab=operators", icon: "🚗", section: "Management" },
      { label: "Admins", href: "/dashboard?tab=admins", icon: "👥", section: "Management" },
      { label: "Payments", href: "/dashboard?tab=payments", icon: "💳", section: "Financial" },
      { label: "Reports", href: "/dashboard?tab=reports", icon: "📈", section: "Financial" },
      { label: "Settings", href: "/dashboard?tab=settings", icon: "⚙️", section: "System" },
    ],
    ADMIN: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", section: "Main" },
      { label: "Rescue Requests", href: "/dashboard?tab=requests", icon: "🆘", section: "Main" },
      { label: "Operators", href: "/dashboard?tab=operators", icon: "🚗", section: "Management" },
      { label: "Payments", href: "/dashboard?tab=payments", icon: "💳", section: "Financial" },
    ],
    OPERATOR: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", section: "Main" },
      { label: "Jobs", href: "/dashboard?tab=jobs", icon: "📋", section: "Main" },
      { label: "Profile", href: "/dashboard?tab=profile", icon: "👤", section: "Account" },
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
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Operations";
      case "OPERATOR":
        return "Operator";
      default:
        return "User";
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fbff" }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            zIndex: 30,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        style={{
          width: 280,
          background: "#fff",
          borderRight: "1px solid #e0f3ff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 8px rgba(0,112,243,0.05)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e0f3ff",
            background: "linear-gradient(135deg, #0070f3 0%, #00c6ff 100%)",
            color: "#fff",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>LRR</h2>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
            {getRoleDisplayName(userRole)}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: "1rem 0", overflow: "auto" }}>
          {Object.entries(groupedMenuItems).map(([section, items]) => (
            <div key={section} style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "0.5rem 1.5rem",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                {section}
              </p>
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#666",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fbff";
                    e.currentTarget.style.color = "#0070f3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#666";
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #e0f3ff",
            display: "flex",
            gap: 8,
            flexDirection: "column",
          }}
        >
          <button
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              border: "1px solid #e0f3ff",
              background: "#f8fbff",
              borderRadius: 6,
              cursor: "pointer",
              color: "#0070f3",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e0f3ff";
              e.currentTarget.style.borderColor = "#0070f3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8fbff";
              e.currentTarget.style.borderColor = "#e0f3ff";
            }}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              border: "1px solid #ffcccc",
              background: "#fff5f5",
              borderRadius: 6,
              cursor: "pointer",
              color: "#d63031",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffcccc";
              e.currentTarget.style.color = "#c92a2a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff5f5";
              e.currentTarget.style.color = "#d63031";
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: 280,
          minHeight: "100vh",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #e0f3ff",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 70,
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#0070f3" }}>
            LRR Platform
          </h1>

          {/* User Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.5rem 1rem",
                border: "1px solid #e0f3ff",
                background: "#f8fbff",
                borderRadius: 8,
                cursor: "pointer",
                color: "#0070f3",
                fontWeight: 600,
                fontSize: "0.95rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0f3ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fbff";
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0070f3 0%, #00c6ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {getInitials(userName)}
              </div>
              <span>{userName || "User"}</span>
              <span>▼</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "0.5rem",
                  width: 240,
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,112,243,0.15)",
                  border: "1px solid #e0f3ff",
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid #e0f3ff",
                    background: "#f8fbff",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {userName}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.85rem",
                      color: "#999",
                    }}
                  >
                    {getRoleDisplayName(userRole)}
                  </p>
                </div>

                <div style={{ padding: "0.5rem 0" }}>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/dashboard?tab=profile");
                    }}
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      color: "#333",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fbff";
                      e.currentTarget.style.color = "#0070f3";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#333";
                    }}
                  >
                    👤 My Profile
                  </button>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e0f3ff",
                    padding: "0.5rem 0",
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      color: "#d63031",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fff5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "2rem",
            overflowY: "auto",
            background: "#f8fbff",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

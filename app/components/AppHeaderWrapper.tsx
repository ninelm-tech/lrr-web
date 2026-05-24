"use client";
import { usePathname } from "next/navigation";

export default function AppHeaderWrapper() {
  const pathname = usePathname();
  
  // Hide header on dashboard and other authenticated routes
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header style={{
      width: "100%",
      background: "linear-gradient(90deg,#0070f3,#00c6ff)",
      padding: "1.5rem 0 1.2rem 0",
      marginBottom: 32,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem"
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <span style={{
            fontWeight: 900,
            fontSize: "2rem",
            color: "#fff",
            letterSpacing: "-1px",
            fontFamily: "inherit"
          }}>LRR</span>
          <span style={{
            color: "#e0f3ff",
            fontWeight: 500,
            fontSize: "1.1rem",
            marginLeft: 4
          }}>Roadside Rescue</span>
        </a>
        <nav style={{ display: "flex", gap: 24 }}>
          <a href="/" style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", textDecoration: "none" }}>Home</a>
          <a href="/login" style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", textDecoration: "none" }}>Login</a>
          <a href="/register" style={{ color: "#fff", fontWeight: 600, fontSize: "1.08rem", textDecoration: "none" }}>Become an Operator</a>
        </nav>
      </div>
    </header>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuthApi } from "../../hooks";

const navy = "#07152f";
const blue = "#003DB4";

const ROLE_FILTER_OPTIONS = [
  { value: "",            label: "All roles" },
  { value: "CUSTOMER",   label: "Customers" },
  { value: "OPERATOR",   label: "Operators" },
  { value: "ADMIN",      label: "Admins" },
  { value: "SUPER_ADMIN",label: "Super Admins" },
];

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  CUSTOMER:   { bg: "#f0fdf4", color: "#15803d" },
  OPERATOR:   { bg: "#eff6ff", color: "#1d4ed8" },
  ADMIN:      { bg: "#fef3c7", color: "#92400e" },
  SUPER_ADMIN:{ bg: "#fdf2f8", color: "#9d174d" },
};

export default function ManageUsersTab() {
  const { listUsers } = useAuthApi();

  const [users, setUsers]       = useState<any[]>([]);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(async (p = 1, q = search, r = roleFilter) => {
    setLoading(true);
    try {
      const res = await listUsers({ page: p, limit: 25, search: q || undefined, role: r || undefined });
      setUsers(res?.data ?? []);
      setPages(res?.meta?.pages ?? 1);
      setPage(p);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, listUsers]);

  useEffect(() => { load(1, "", ""); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    load(1, searchInput, roleFilter);
  }

  function handleRoleFilter(r: string) {
    setRoleFilter(r);
    load(1, search, r);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Filter bar */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #e8edf5", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: "1 1 260px" }}>
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1, padding: "0.55rem 0.85rem", borderRadius: 8,
              border: "1px solid #dde8f8", fontSize: "0.88rem", outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.55rem 1rem", background: blue, color: "#fff", border: "none",
              borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
            }}
          >Search</button>
        </form>

        {/* Role filter chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ROLE_FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleRoleFilter(value)}
              style={{
                padding: "0.4rem 0.9rem", borderRadius: 20, border: "1px solid",
                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                borderColor: roleFilter === value ? blue : "#dde8f8",
                background: roleFilter === value ? blue : "#fff",
                color: roleFilter === value ? "#fff" : "#6c7890",
                transition: "all 0.12s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                {["Name", "Email", "Phone", "Role", "Joined"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>No users found.</td></tr>
              ) : users.map((u: any) => {
                const rs = ROLE_STYLE[u.role] ?? ROLE_STYLE.CUSTOMER;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: navy, fontWeight: 500 }}>
                      {u.name || <span style={{ color: "#c4c9d4" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>{u.email || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                      {u.phoneNumber ? u.phoneNumber.replace("whatsapp:", "") : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20,
                        fontSize: "0.76rem", fontWeight: 600, background: rs.bg, color: rs.color,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#9ca3af" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid #f0f3f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Page {page} of {pages}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1}
                style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", color: page <= 1 ? "#c4c9d4" : navy, cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "0.85rem" }}
              >← Prev</button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= pages}
                style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", color: page >= pages ? "#c4c9d4" : navy, cursor: page >= pages ? "not-allowed" : "pointer", fontSize: "0.85rem" }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

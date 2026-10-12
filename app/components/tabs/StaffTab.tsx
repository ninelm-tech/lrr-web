"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthApi, useAuthState, useStaffApi } from "../../hooks";
import type { StaffMember } from "../../hooks";

const navy = "#07152f";
const blue = "#003DB4";

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  SUPER_ADMIN: { bg: "#fdf2f8", color: "#9d174d", label: "Super Admin" },
  ADMIN:       { bg: "#fef3c7", color: "#92400e", label: "Admin" },
  PRODUCT:     { bg: "#eff6ff", color: "#1d4ed8", label: "Product" },
};

const inputStyle = { padding: "0.55rem 0.85rem", borderRadius: 8, border: "1px solid #dde8f8", fontSize: "0.88rem", outline: "none" } as const;
const labelStyle = { fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af" } as const;

/**
 * Internal team only (Super Admin / Admin / Product). Customers have their
 * own page and operators live under Operators — nobody here can be deleted.
 */
export default function StaffTab() {
  const { listStaff, updateStaff } = useStaffApi();
  const { createStaff } = useAuthApi();
  const { role: myRole } = useAuthState();
  const isSuperAdmin = myRole === "SUPER_ADMIN";

  const [staff, setStaff]     = useState<StaffMember[]>([]);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showAdd, setShowAdd]     = useState(false);
  const [newEmail, setNewEmail]   = useState("");
  const [newName, setNewName]     = useState("");
  const [newRole, setNewRole]     = useState("ADMIN");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState("");
  const [editRole, setEditRole]   = useState<"ADMIN" | "PRODUCT">("ADMIN");
  const [saving, setSaving]       = useState(false);
  const [rowMsg, setRowMsg]       = useState<{ text: string; ok: boolean } | null>(null);

  // Only the most recent request may update the table — a slow earlier
  // search must not overwrite a newer one.
  const requestSeq = useRef(0);

  const load = useCallback(async (p = 1, q = search) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await listStaff({ page: p, limit: 25, search: q || undefined });
      if (seq !== requestSeq.current) return;
      setStaff(res?.data ?? []);
      setPages(res?.meta?.pages ?? 1);
      setPage(p);
    } catch {
      if (seq === requestSeq.current) setStaff([]);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [search, listStaff]);

  // Initial load. Kept as a promise chain (state is only set in callbacks)
  // rather than calling load() synchronously from the effect body.
  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeq.current;
    listStaff({ page: 1, limit: 25 })
      .then((res) => {
        if (cancelled || seq !== requestSeq.current) return;
        setStaff(res?.data ?? []);
        setPages(res?.meta?.pages ?? 1);
      })
      .catch(() => { if (!cancelled && seq === requestSeq.current) setStaff([]); })
      .finally(() => { if (!cancelled && seq === requestSeq.current) setLoading(false); });
    return () => { cancelled = true; };
  }, [listStaff]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    load(1, searchInput);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      await createStaff({ email: newEmail, name: newName, role: newRole, temporaryPassword: newPassword });
      setCreateMsg("Staff account created.");
      setNewEmail(""); setNewName(""); setNewPassword(""); setNewRole("ADMIN");
      load(page, search);
    } catch (err) {
      setCreateMsg(err instanceof Error ? err.message : "Failed to create staff account");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(m: StaffMember) {
    setEditingId(m.id);
    setEditName(m.name ?? "");
    setEditRole(m.role === "PRODUCT" ? "PRODUCT" : "ADMIN");
    setRowMsg(null);
  }

  async function handleSave(m: StaffMember) {
    const patch: { name?: string; role?: "ADMIN" | "PRODUCT" } = {};
    if (editName.trim() !== (m.name ?? "")) patch.name = editName.trim();
    if (editRole !== m.role) patch.role = editRole;
    if (patch.name === undefined && patch.role === undefined) { setEditingId(null); return; }
    setSaving(true);
    setRowMsg(null);
    try {
      await updateStaff(m.id, patch);
      setEditingId(null);
      setRowMsg({
        text: patch.role
          ? "Saved. The new role applies when they next sign in — an existing session can keep the old role for up to 24 hours."
          : "Saved.",
        ok: true,
      });
      load(page, search);
    } catch (err) {
      setRowMsg({ text: err instanceof Error ? err.message : "Failed to save", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #e8edf5" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" style={{ padding: "0.55rem 1rem", background: blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
            Search
          </button>
        </form>
      </div>

      {isSuperAdmin && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #e8edf5" }}>
          <button
            onClick={() => { setShowAdd((v) => !v); setCreateMsg(null); }}
            style={{ padding: "0.55rem 1rem", background: showAdd ? "#f0f3f8" : blue, color: showAdd ? navy : "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
          >
            {showAdd ? "Cancel" : "+ Add staff"}
          </button>
          {showAdd && (
            <form onSubmit={handleCreate} style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Name</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={inputStyle}>
                  <option value="ADMIN">Admin</option>
                  <option value="PRODUCT">Product</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={labelStyle}>Temporary password</label>
                <input type="text" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
              </div>
              <button type="submit" disabled={creating} style={{ padding: "0.55rem 1rem", background: blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}>
                {creating ? "Creating…" : "Create"}
              </button>
              {createMsg && (
                <span style={{ fontSize: "0.85rem", color: createMsg.startsWith("Staff account created") ? "#15803d" : "#dc2626" }}>{createMsg}</span>
              )}
            </form>
          )}
        </div>
      )}

      {rowMsg && (
        <div style={{ fontSize: "0.85rem", color: rowMsg.ok ? "#15803d" : "#dc2626", background: rowMsg.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${rowMsg.ok ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "0.6rem 0.85rem" }}>
          {rowMsg.text}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>Loading…</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>No staff found.</td></tr>
              ) : staff.map((m) => {
                const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE.PRODUCT;
                const editing = editingId === m.id;
                const editable = isSuperAdmin && m.role !== "SUPER_ADMIN";
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: navy, fontWeight: 500 }}>
                      {editing ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                      ) : (m.name || <span style={{ color: "#c4c9d4" }}>—</span>)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>{m.email || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {editing ? (
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value as "ADMIN" | "PRODUCT")} style={inputStyle}>
                          <option value="ADMIN">Admin</option>
                          <option value="PRODUCT">Product</option>
                        </select>
                      ) : (
                        <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20, fontSize: "0.76rem", fontWeight: 600, background: rs.bg, color: rs.color }}>
                          {rs.label}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#9ca3af" }}>
                      {new Date(m.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {editing ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleSave(m)} disabled={saving} style={{ padding: "0.3rem 0.7rem", background: blue, color: "#fff", border: "none", borderRadius: 4, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={saving} style={{ padding: "0.3rem 0.7rem", background: "#f0f3f8", color: navy, border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            Cancel
                          </button>
                        </div>
                      ) : editable ? (
                        <button onClick={() => startEdit(m)} style={{ padding: "0.3rem 0.7rem", background: "#fff", color: blue, border: "1px solid #dde8f8", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          Edit
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid #f0f3f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Page {page} of {pages}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => load(page - 1)} disabled={page <= 1} style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", color: page <= 1 ? "#c4c9d4" : navy, cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>← Prev</button>
              <button onClick={() => load(page + 1)} disabled={page >= pages} style={{ padding: "0.4rem 0.8rem", borderRadius: 6, border: "1px solid #dde8f8", background: "#fff", color: page >= pages ? "#c4c9d4" : navy, cursor: page >= pages ? "not-allowed" : "pointer", fontSize: "0.85rem" }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

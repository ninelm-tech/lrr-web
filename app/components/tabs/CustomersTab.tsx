"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthState, useCustomersApi, useAccountDeletionApi } from "../../hooks";
import type { CustomerListItem } from "../../hooks";

const navy = "#07152f";
const blue = "#003DB4";
const inputStyle = { padding: "0.5rem 0.7rem", borderRadius: 8, border: "1px solid #dde8f8", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" } as const;

/** Customers: look up, correct name/email, and (Super Admin) delete. Phone is read-only — it is their login. */
export default function CustomersTab() {
  const { listCustomers, updateCustomer } = useCustomersApi();
  const { deleteUser } = useAccountDeletionApi();
  const { role: myRole } = useAuthState();

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Only the most recent request may update the table — a slow earlier
  // search must not overwrite a newer one.
  const requestSeq = useRef(0);

  const load = useCallback(async (p = 1, q = search) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await listCustomers({ page: p, limit: 25, search: q || undefined });
      if (seq !== requestSeq.current) return;
      setCustomers(res?.data ?? []);
      setPages(res?.meta?.pages ?? 1);
      setPage(p);
    } catch {
      if (seq === requestSeq.current) setCustomers([]);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [search, listCustomers]);

  // Initial load. Kept as a promise chain (state is only set in callbacks)
  // rather than calling load() synchronously from the effect body.
  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeq.current;
    listCustomers({ page: 1, limit: 25 })
      .then((res) => {
        if (cancelled || seq !== requestSeq.current) return;
        setCustomers(res?.data ?? []);
        setPages(res?.meta?.pages ?? 1);
      })
      .catch(() => { if (!cancelled && seq === requestSeq.current) setCustomers([]); })
      .finally(() => { if (!cancelled && seq === requestSeq.current) setLoading(false); });
    return () => { cancelled = true; };
  }, [listCustomers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setMsg(null);
    load(1, searchInput);
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      setMsg({ text: `User ID: ${id}`, ok: true });
    }
  }

  function startEdit(c: CustomerListItem) {
    setEditingId(c.id);
    setEditName(c.name ?? "");
    setEditEmail(c.email ?? "");
    setMsg(null);
  }

  async function handleSave(c: CustomerListItem) {
    const patch: { name?: string; email?: string | null } = {};
    if (editName.trim() !== (c.name ?? "")) patch.name = editName.trim();
    const nextEmail = editEmail.trim() === "" ? null : editEmail.trim();
    if (nextEmail !== (c.email ?? null)) patch.email = nextEmail;
    if (patch.name === undefined && patch.email === undefined) { setEditingId(null); return; }
    setSaving(true);
    setMsg(null);
    try {
      await updateCustomer(c.id, patch);
      setEditingId(null);
      setMsg({ text: "Customer updated.", ok: true });
      load(page, search);
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed to update customer", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer? This anonymizes their personal details and cannot be undone.")) return;
    setDeletingId(id);
    setMsg(null);
    try {
      await deleteUser(id);
      setMsg({ text: "Customer deleted.", ok: true });
      load(page, search);
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : "Failed to delete customer", ok: false });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", border: "1px solid #e8edf5" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ ...inputStyle, flex: 1, padding: "0.55rem 0.85rem", fontSize: "0.88rem" }}
          />
          <button type="submit" style={{ padding: "0.55rem 1rem", background: blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
            Search
          </button>
        </form>
      </div>

      {msg && (
        <div style={{ fontSize: "0.85rem", color: msg.ok ? "#15803d" : "#dc2626", background: msg.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: "0.6rem 0.85rem" }}>
          {msg.text}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                {["Name", "Email", "Phone", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>Loading…</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "1.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" }}>No customers found.</td></tr>
              ) : customers.map((c) => {
                const editing = editingId === c.id;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: navy, fontWeight: 500 }}>
                      {editing ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
                      ) : (c.name || <span style={{ color: "#c4c9d4" }}>—</span>)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                      {editing ? (
                        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="(none)" style={inputStyle} />
                      ) : (c.email || "—")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>{c.phoneNumber || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#9ca3af" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {c.deletedAt ? (
                        <span style={{ display: "inline-block", padding: "0.3rem 0.7rem", background: "#f8d7da", color: "#721c24", borderRadius: 4, fontSize: "0.82rem", fontWeight: 600 }}>Deleted</span>
                      ) : editing ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleSave(c)} disabled={saving} style={{ padding: "0.3rem 0.7rem", background: blue, color: "#fff", border: "none", borderRadius: 4, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={saving} style={{ padding: "0.3rem 0.7rem", background: "#f0f3f8", color: navy, border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => startEdit(c)} style={{ padding: "0.3rem 0.7rem", background: "#fff", color: blue, border: "1px solid #dde8f8", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                            Edit
                          </button>
                          <button
                            onClick={() => copyId(c.id)}
                            title="Copy user ID (needed to add someone to an operator's team)"
                            style={{ padding: "0.3rem 0.7rem", background: "#fff", color: "#6c7890", border: "1px solid #dde8f8", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                          >
                            {copiedId === c.id ? "Copied" : "Copy ID"}
                          </button>
                          {myRole === "SUPER_ADMIN" && (
                            <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} style={{ padding: "0.3rem 0.7rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: deletingId === c.id ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                              {deletingId === c.id ? "Deleting…" : "Delete"}
                            </button>
                          )}
                        </div>
                      )}
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

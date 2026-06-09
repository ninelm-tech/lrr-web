"use client";
import { useEffect, useState } from "react";
import { useOperatorApi } from "../../hooks";

const navy = "#07152f";
const blue = "#003DB4";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner", MANAGER: "Manager", DISPATCHER: "Dispatcher", DRIVER: "Driver", STAFF: "Staff",
};
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  OWNER:      { bg: "#fef3c7", color: "#92400e" },
  MANAGER:    { bg: "#eff6ff", color: "#1d4ed8" },
  DISPATCHER: { bg: "#f0fdf4", color: "#15803d" },
  DRIVER:     { bg: "#fdf2f8", color: "#9d174d" },
  STAFF:      { bg: "#f4f4f5", color: "#52525b" },
};

export default function OperatorMembersTab() {
  const { fetchMe, fetchMembers, addMember, removeMember } = useOperatorApi();

  const [loading, setLoading]     = useState(true);
  const [operator, setOperator]   = useState<any>(null);
  const [members, setMembers]     = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole]     = useState("STAFF");
  const [inviting, setInviting]         = useState(false);
  const [removing, setRemoving]         = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  async function loadMembers(operatorId: string) {
    const data = await fetchMembers(operatorId);
    setMembers(data);
  }

  useEffect(() => {
    fetchMe()
      .then(async (op) => {
        setOperator(op);
        if (op?.id) await loadMembers(op.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite() {
    if (!inviteUserId.trim() || !operator) return;
    setInviting(true);
    try {
      await addMember(operator.id, inviteUserId.trim(), inviteRole as any);
      showToast("Member added successfully");
      setInviteUserId("");
      setShowInvite(false);
      await loadMembers(operator.id);
    } catch (e: any) {
      showToast(e?.message ?? "Failed to add member", false);
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!operator) return;
    setRemoving(memberId);
    try {
      await removeMember(operator.id, memberId);
      showToast("Member removed");
      await loadMembers(operator.id);
    } catch (e: any) {
      showToast(e?.message ?? "Failed to remove member", false);
    } finally {
      setRemoving(null);
    }
  }

  if (loading) return <div style={{ color: blue }}>Loading team…</div>;
  if (!operator) return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", border: "1px solid #e8edf5", color: "#9ca3af", textAlign: "center" }}>
      No operator account linked to your profile.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: toast.ok ? "#d4edda" : "#f8d7da",
          color: toast.ok ? "#155724" : "#721c24",
          borderRadius: 10, padding: "0.75rem 1.25rem",
          fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: navy }}>Team Members</h1>
          <p style={{ margin: "4px 0 0", color: "#6c7890", fontSize: "0.88rem" }}>{operator.businessName}</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          style={{
            padding: "0.6rem 1.2rem", background: blue, color: "#fff", border: "none",
            borderRadius: 10, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
          }}
        >
          + Add member
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #e8edf5" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: navy }}>Add team member</h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.84rem", color: "#6c7890" }}>
            The person must already have an LRR account. Enter their User ID (found in Admin → Manage Users).
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="User ID"
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              style={{
                flex: "1 1 240px", padding: "0.6rem 0.85rem", borderRadius: 8,
                border: "1px solid #dde8f8", fontSize: "0.9rem", outline: "none",
              }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{
                padding: "0.6rem 0.85rem", borderRadius: 8,
                border: "1px solid #dde8f8", fontSize: "0.9rem",
                background: "#fff", cursor: "pointer",
              }}
            >
              {Object.entries(ROLE_LABELS).filter(([k]) => k !== "OWNER").map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteUserId.trim()}
              style={{
                padding: "0.6rem 1.2rem", background: blue, color: "#fff", border: "none",
                borderRadius: 8, fontWeight: 700, fontSize: "0.88rem",
                cursor: inviting ? "not-allowed" : "pointer", opacity: inviting ? 0.6 : 1,
              }}
            >
              {inviting ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => setShowInvite(false)}
              style={{ padding: "0.6rem 1rem", background: "#f4f4f5", color: "#52525b", border: "none", borderRadius: 8, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8edf5", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f3f8", display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: navy }}>
            Members
          </h2>
          <span style={{ background: "#eff6ff", color: blue, borderRadius: 20, padding: "0.1rem 0.6rem", fontSize: "0.78rem", fontWeight: 600 }}>
            {members.length}
          </span>
        </div>
        {members.length === 0 ? (
          <p style={{ margin: 0, padding: "1.5rem", color: "#9ca3af", fontSize: "0.9rem" }}>No team members yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f3f8" }}>
                  {["Name", "Email / Phone", "Role", "Since", ""].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.76rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => {
                  const rc = ROLE_COLORS[m.role] ?? ROLE_COLORS.STAFF;
                  const isOwner = m.role === "OWNER";
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #f7f9fc" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: navy, fontWeight: 600 }}>
                        {m.user?.name || "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#6c7890" }}>
                        {m.user?.email || m.user?.phoneNumber || "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600, background: rc.bg, color: rc.color }}>
                          {ROLE_LABELS[m.role] ?? m.role}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#9ca3af" }}>
                        {new Date(m.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {!isOwner && (
                          <button
                            onClick={() => handleRemove(m.id)}
                            disabled={removing === m.id}
                            style={{
                              padding: "0.3rem 0.75rem", background: "#fee2e2", color: "#dc2626",
                              border: "none", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600,
                              cursor: removing === m.id ? "not-allowed" : "pointer",
                              opacity: removing === m.id ? 0.6 : 1,
                            }}
                          >
                            {removing === m.id ? "…" : "Remove"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

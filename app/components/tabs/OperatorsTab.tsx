"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useOperatorApi, useAuthState } from "../../hooks";
import type { Operator, OperatorStats } from "../../hooks";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: "#fff3cd", text: "#856404", label: "Pending" },
  ACTIVE:    { bg: "#d4edda", text: "#155724", label: "Active" },
  INACTIVE:  { bg: "#e2e3e5", text: "#383d41", label: "Inactive" },
  SUSPENDED: { bg: "#f8d7da", text: "#721c24", label: "Suspended" },
};

const TYPE_LABELS: Record<string, string> = {
  TOW_TRUCK:        "Tow Truck",
  MECHANIC:         "Mechanic",
  FUEL_DELIVERY:    "Fuel Delivery",
  TYRE_REPAIR:      "Tyre Repair",
  BATTERY_JUMPSTART:"Battery",
};

function pct(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

function fmtSec(sec: number) {
  if (sec === 0) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  return `${Math.round(sec / 60)}m ${Math.round(sec % 60)}s`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

interface StatsModalProps {
  operator: Operator;
  stats: OperatorStats | null;
  onClose: () => void;
  banks: Array<{ name: string; code: string }>;
  onSaveBankDetails: (bankCode: string, bankName: string, accountNumber: string) => Promise<void>;
  viewerRole: string | null;
}

function StatsModal({ operator, stats, onClose, banks, onSaveBankDetails, viewerRole }: StatsModalProps) {
  const [bankCode, setBankCode] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ msg: string; ok: boolean } | null>(null);

  const filteredBanks = bankSearch.trim()
    ? banks.filter((b) => b.name.toLowerCase().includes(bankSearch.trim().toLowerCase()))
    : banks;

  function selectBank(bank: { code: string; name: string }) {
    setBankCode(bank.code);
    setBankSearch(bank.name);
    setShowBankList(false);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const bankName = banks.find((b) => b.code === bankCode)?.name ?? "";
      await onSaveBankDetails(bankCode, bankName, accountNumber);
      setAccountNumber("");
      setBankCode("");
      setBankSearch("");
      setMsg({ msg: "Bank details saved.", ok: true });
    } catch (err) {
      setMsg({ msg: err instanceof Error ? err.message : "Failed to save bank details", ok: false });
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 12, padding: "2rem",
          width: 480, maxHeight: "80vh", overflow: "auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 0.25rem 0", color: "#003DB4" }}>{operator.businessName}</h2>
        <p style={{ margin: "0 0 1.5rem 0", color: "#999", fontSize: "0.9rem" }}>
          {TYPE_LABELS[operator.type] ?? operator.type} · {operator.phoneNumber}
        </p>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: "0.8rem", color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Address</p>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>{operator.address}</p>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ margin: "0 0 2px 0", fontSize: "0.8rem", color: "#999", fontWeight: 600, textTransform: "uppercase" }}>Coordinates</p>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>
              {operator.latitude.toFixed(5)}, {operator.longitude.toFixed(5)}
              {" — "}
              <a
                href={`https://www.google.com/maps?q=${operator.latitude},${operator.longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#003DB4", fontWeight: 600 }}
              >
                View on map
              </a>
            </p>
          </div>
          {[
            { label: "Service Radius", value: `${operator.serviceRadius} km` },
            { label: "Status",         value: STATUS_STYLES[operator.status]?.label ?? operator.status },
            {
              label: "Available Now",
              value: operator.isAvailable ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#16a34a", fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> Yes
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#dc2626", fontWeight: 600 }}>
                  <XCircle size={15} /> No
                </span>
              ),
            },
            { label: "Joined",         value: fmtDate(operator.createdAt) },
            { label: "Verified",       value: operator.verifiedAt ? fmtDate(operator.verifiedAt) : "Not yet" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: "0 0 2px 0", fontSize: "0.8rem", color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Performance stats */}
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "#333", borderTop: "1px solid #dde8f8", paddingTop: "1rem" }}>
          30-Day Performance
        </h3>
        {stats ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {[
              { label: "Jobs Offered",    value: stats.totalOffered },
              { label: "Accepted",        value: stats.totalAccepted },
              { label: "Declined",        value: stats.totalDeclined },
              { label: "Timed Out",       value: stats.totalTimedOut },
              { label: "Acceptance Rate", value: pct(stats.acceptanceRate) },
              { label: "Avg Response",    value: fmtSec(stats.avgResponseSec) },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "#F6FAFF", borderRadius: 8, padding: "0.75rem",
                  border: "1px solid #dde8f8", textAlign: "center",
                }}
              >
                <p style={{ margin: "0 0 4px 0", fontSize: "1.4rem", fontWeight: 700, color: "#003DB4" }}>{value}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#999" }}>{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#999", textAlign: "center" }}>No stats available yet</p>
        )}

        <h3 style={{ margin: "1.5rem 0 1rem 0", fontSize: "1rem", color: "#333", borderTop: "1px solid #dde8f8", paddingTop: "1rem" }}>
          Payout bank details
        </h3>
        {operator.bankName && operator.accountNumberLast4 && (
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "#666" }}>
            Current: {operator.bankName} ····{operator.accountNumberLast4} ({operator.accountName})
          </p>
        )}
        {viewerRole !== "PRODUCT" && (
          <>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#999", marginBottom: 4 }}>Bank</label>
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setBankCode("");
                    setShowBankList(true);
                  }}
                  onFocus={() => setShowBankList(true)}
                  onBlur={() => setTimeout(() => setShowBankList(false), 150)}
                  placeholder="Search for a bank…"
                  style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #dde8f8", width: 200 }}
                />
                {showBankList && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                    background: "#fff", border: "1px solid #dde8f8", borderRadius: 6,
                    marginTop: 4, maxHeight: 200, overflowY: "auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}>
                    {filteredBanks.length === 0 ? (
                      <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", color: "#999" }}>No banks match</div>
                    ) : (
                      filteredBanks.map((b) => (
                        <div
                          key={b.code}
                          onMouseDown={() => selectBank(b)}
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F6FAFF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                        >
                          {b.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#999", marginBottom: 4 }}>Account number</label>
                <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid #dde8f8" }} />
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !bankCode || !accountNumber.trim()}
                style={{ padding: "0.5rem 1rem", background: "#003DB4", color: "#fff", border: "none", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            {msg && (
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: msg.ok ? "#19a56b" : "#dc2626" }}>{msg.msg}</p>
            )}
          </>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem", width: "100%",
            padding: "0.7rem", background: "#dde8f8", color: "#003DB4",
            border: "1px solid #003DB4", borderRadius: 6, cursor: "pointer", fontWeight: 600,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function OperatorsTab() {
  const { operators, loading, error, fetchAll, fetchAllStats, updateStatus, setAvailability, fetchBanks, saveBankDetails } = useOperatorApi();
  const { role: myRole } = useAuthState();
  const [statsMap, setStatsMap] = useState<Record<string, OperatorStats>>({});
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetchAll();
    fetchAllStats().then((rows) => {
      const m: Record<string, OperatorStats> = {};
      rows.forEach((r) => { m[r.operatorId] = r.stats; });
      setStatsMap(m);
    });
    fetchBanks().then(setBanks);
  }, [fetchAll, fetchAllStats, fetchBanks]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (op: Operator, status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING") => {
    setActionLoading(op.id + status);
    try {
      await updateStatus(op.id, status);
      showToast(`${op.businessName} → ${STATUS_STYLES[status].label}`);
    } catch {
      showToast("Failed to update status", false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAvailability = async (op: Operator) => {
    setActionLoading(op.id + "avail");
    try {
      await setAvailability(op.id, !op.isAvailable);
      showToast(`${op.businessName} marked ${!op.isAvailable ? "Available" : "Unavailable"}`);
    } catch {
      showToast("Failed to update availability", false);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = operators.filter((op) => {
    if (filterStatus && op.status !== filterStatus) return false;
    if (filterType && op.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        op.businessName.toLowerCase().includes(q) ||
        op.phoneNumber.includes(q) ||
        op.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount  = operators.filter((o) => o.status === "PENDING").length;
  const activeCount   = operators.filter((o) => o.status === "ACTIVE").length;
  const availCount    = operators.filter((o) => o.isAvailable && o.status === "ACTIVE").length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed", top: 20, right: 20, zIndex: 999,
            background: toast.ok ? "#d4edda" : "#f8d7da",
            color: toast.ok ? "#155724" : "#721c24",
            border: `1px solid ${toast.ok ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: 8, padding: "0.75rem 1.25rem",
            fontWeight: 600, fontSize: "0.95rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Operators", value: operators.length, color: "#003DB4" },
          { label: "Pending Approval", value: pendingCount, color: "#856404" },
          { label: "Active", value: activeCount, color: "#155724" },
          { label: "Available Now", value: availCount, color: "#003DB4" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#fff", padding: "1.25rem", borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,61,180,0.08)", border: "1px solid #dde8f8",
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#999" }}>{label}</p>
            <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,61,180,0.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4, color: "#666" }}>Search</label>
            <input
              type="text"
              placeholder="Business name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
            />
          </div>
          <button
            onClick={() => { setFilterStatus(""); setFilterType(""); setSearch(""); }}
            style={{
              padding: "0.55rem 1rem", background: "#F6FAFF", color: "#003DB4",
              border: "1px solid #003DB4", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "1rem", borderRadius: 8, marginBottom: "1rem", border: "1px solid #f5c6cb" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,61,180,0.08)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
                {["Business", "Type", "Phone", "Status", "Available", "Acceptance", "Avg Response", "Avg Rating", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.9rem 1rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#666" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#003DB4" }}>
                    Loading operators...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                    No operators found
                  </td>
                </tr>
              ) : (
                filtered.map((op) => {
                  const st = STATUS_STYLES[op.status] ?? { bg: "#e2e3e5", text: "#383d41", label: op.status };
                  const opStats = statsMap[op.id];
                  return (
                    <tr key={op.id} style={{ borderBottom: "1px solid #f0f8ff" }}>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#333", fontSize: "0.95rem" }}>{op.businessName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#999" }}>{op.contactName}</div>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#666" }}>
                        {TYPE_LABELS[op.type] ?? op.type}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {op.phoneNumber}
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span style={{ display: "inline-block", padding: "0.3rem 0.7rem", background: st.bg, color: st.text, borderRadius: 4, fontSize: "0.82rem", fontWeight: 600 }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                        {myRole === "PRODUCT" ? (
                          <span
                            style={{
                              display: "inline-block", padding: "0.3rem 0.7rem",
                              background: op.isAvailable ? "#d4edda" : "#e2e3e5",
                              color: op.isAvailable ? "#155724" : "#383d41",
                              borderRadius: 4, fontSize: "0.82rem", fontWeight: 600,
                              opacity: op.status !== "ACTIVE" ? 0.5 : 1,
                            }}
                          >
                            {op.isAvailable ? "Online" : "Offline"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAvailability(op)}
                            disabled={actionLoading === op.id + "avail" || op.status !== "ACTIVE"}
                            style={{
                              padding: "0.3rem 0.7rem",
                              background: op.isAvailable ? "#d4edda" : "#e2e3e5",
                              color: op.isAvailable ? "#155724" : "#383d41",
                              border: "none", borderRadius: 4, cursor: op.status === "ACTIVE" ? "pointer" : "default",
                              fontSize: "0.82rem", fontWeight: 600,
                              opacity: op.status !== "ACTIVE" ? 0.5 : 1,
                            }}
                          >
                            {op.isAvailable ? "Online" : "Offline"}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {opStats ? pct(opStats.acceptanceRate) : "—"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {opStats ? fmtSec(opStats.avgResponseSec) : "—"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.9rem", color: "#333" }}>
                        {opStats && opStats.averageRating !== null ? `${opStats.averageRating.toFixed(1)} ★ (${opStats.ratingCount})` : "—"}
                      </td>
                      <td style={{ padding: "0.9rem 1rem", fontSize: "0.85rem", color: "#999" }}>
                        {fmtDate(op.createdAt)}
                      </td>
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button
                            onClick={() => setSelectedOp(op)}
                            style={{
                              padding: "0.3rem 0.7rem", background: "#dde8f8", color: "#003DB4",
                              border: "1px solid #003DB4", borderRadius: 4, cursor: "pointer",
                              fontSize: "0.82rem", fontWeight: 600,
                            }}
                          >
                            Stats
                          </button>
                          {myRole !== "PRODUCT" && op.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(op, "ACTIVE")}
                              disabled={actionLoading === op.id + "ACTIVE"}
                              style={{
                                padding: "0.3rem 0.7rem", background: "#d4edda", color: "#155724",
                                border: "1px solid #c3e6cb", borderRadius: 4, cursor: "pointer",
                                fontSize: "0.82rem", fontWeight: 600,
                              }}
                            >
                              Approve
                            </button>
                          )}
                          {myRole !== "PRODUCT" && op.status === "ACTIVE" && (
                            <button
                              onClick={() => handleStatusChange(op, "SUSPENDED")}
                              disabled={actionLoading === op.id + "SUSPENDED"}
                              style={{
                                padding: "0.3rem 0.7rem", background: "#fff3cd", color: "#856404",
                                border: "1px solid #ffc107", borderRadius: 4, cursor: "pointer",
                                fontSize: "0.82rem", fontWeight: 600,
                              }}
                            >
                              Suspend
                            </button>
                          )}
                          {myRole !== "PRODUCT" && (op.status === "INACTIVE" || op.status === "SUSPENDED") && (
                            <button
                              onClick={() => handleStatusChange(op, "ACTIVE")}
                              disabled={actionLoading === op.id + "ACTIVE"}
                              style={{
                                padding: "0.3rem 0.7rem", background: "#d4edda", color: "#155724",
                                border: "1px solid #c3e6cb", borderRadius: 4, cursor: "pointer",
                                fontSize: "0.82rem", fontWeight: 600,
                              }}
                            >
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats modal */}
      {selectedOp && (
        <StatsModal
          operator={selectedOp}
          stats={statsMap[selectedOp.id] ?? null}
          onClose={() => setSelectedOp(null)}
          banks={banks}
          onSaveBankDetails={async (bankCode, bankName, accountNumber) => {
            const updated = await saveBankDetails(selectedOp.id, { bankCode, bankName, accountNumber });
            setSelectedOp(updated);
          }}
          viewerRole={myRole}
        />
      )}
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, MapPin, Pencil, Trash2, X, XCircle } from "lucide-react";
import { useOperatorApi, useAuthState } from "../../hooks";
import { useGooglePlacesAutocomplete } from "../../hooks/useGooglePlacesAutocomplete";
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
  onClearBankDetails: () => Promise<void>;
  onUpdateAddress: (address: string, latitude: number, longitude: number) => Promise<void>;
  viewerRole: string | null;
}

function StatsModal({ operator, stats, onClose, banks, onSaveBankDetails, onClearBankDetails, onUpdateAddress, viewerRole }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "performance" | "payouts">("details");

  const hasBankOnFile = Boolean(operator.bankName && operator.accountNumberLast4);
  const [editingBank, setEditingBank] = useState(!hasBankOnFile);
  const [bankCode, setBankCode] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [bankListRect, setBankListRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ msg: string; ok: boolean } | null>(null);
  const bankInputRef = useRef<HTMLInputElement>(null);

  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ msg: string; ok: boolean } | null>(null);
  const [addressListRect, setAddressListRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const { address: addressQuery, setAddress: handleAddressChange, suggestions: addressSuggestions, selectSuggestion, latLng } = useGooglePlacesAutocomplete();

  function startEditingAddress() {
    handleAddressChange(operator.address);
    setAddressMsg(null);
    setEditingAddress(true);
  }

  function openAddressList() {
    const rect = addressInputRef.current?.getBoundingClientRect();
    if (rect) setAddressListRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }

  async function handleSaveAddress() {
    if (!latLng) {
      setAddressMsg({ msg: "Please select an address from the suggestions list", ok: false });
      return;
    }
    setSavingAddress(true);
    setAddressMsg(null);
    try {
      await onUpdateAddress(addressQuery, latLng.lat, latLng.lng);
      setAddressMsg({ msg: "Address updated.", ok: true });
      setEditingAddress(false);
    } catch (err) {
      setAddressMsg({ msg: err instanceof Error ? err.message : "Failed to update address", ok: false });
    } finally {
      setSavingAddress(false);
    }
  }

  const filteredBanks = bankSearch.trim()
    ? banks.filter((b) => b.name.toLowerCase().includes(bankSearch.trim().toLowerCase()))
    : banks;

  function openBankList() {
    const rect = bankInputRef.current?.getBoundingClientRect();
    if (rect) setBankListRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setShowBankList(true);
  }

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
      setEditingBank(false);
    } catch (err) {
      setMsg({ msg: err instanceof Error ? err.message : "Failed to save bank details", ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${operator.bankName} ····${operator.accountNumberLast4} as this operator's payout account?`)) return;
    setDeleting(true);
    setMsg(null);
    try {
      await onClearBankDetails();
      setMsg({ msg: "Bank details removed.", ok: true });
      setEditingBank(true);
    } catch (err) {
      setMsg({ msg: err instanceof Error ? err.message : "Failed to remove bank details", ok: false });
    } finally {
      setDeleting(false);
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
          background: "#fff", borderRadius: 14,
          width: 720, maxWidth: "92vw", maxHeight: "85vh", overflow: "auto",
          boxShadow: "0 12px 40px rgba(7,21,47,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "1.5rem 1.75rem", borderBottom: "1px solid #f0f3f8",
        }}>
          <div>
            <h2 style={{ margin: "0 0 0.2rem 0", fontSize: "1.3rem", color: "#07152f" }}>{operator.businessName}</h2>
            <p style={{ margin: 0, color: "#8892a6", fontSize: "0.88rem" }}>
              {TYPE_LABELS[operator.type] ?? operator.type} · {operator.phoneNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, flexShrink: 0, marginLeft: 12,
              background: "#F6FAFF", border: "none", borderRadius: "50%",
              color: "#6c7890", cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "0 1.75rem", borderBottom: "1px solid #f0f3f8" }}>
          {([
            { key: "details", label: "Details" },
            { key: "performance", label: "Performance" },
            { key: "payouts", label: "Payouts" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.75rem 0.25rem", marginRight: 20, background: "none", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #003DB4" : "2px solid transparent",
                color: activeTab === tab.key ? "#003DB4" : "#8892a6",
                fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.5rem 1.75rem" }}>
        {activeTab === "details" && (
        <>
          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem", marginBottom: "1.75rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "0.76rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>Address</p>
                {!editingAddress && viewerRole !== "PRODUCT" && (
                  <button
                    onClick={startEditingAddress}
                    aria-label="Edit address"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, background: "none", border: "none",
                      color: "#003DB4", cursor: "pointer",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>
              {editingAddress ? (
                <div>
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={addressQuery}
                    onChange={(e) => { handleAddressChange(e.target.value); openAddressList(); }}
                    onFocus={openAddressList}
                    placeholder="Search for an address…"
                    style={{ width: "100%", padding: "0.5rem 0.6rem", borderRadius: 7, border: "1px solid #dde8f8", boxSizing: "border-box", fontSize: "0.9rem" }}
                  />
                  {addressSuggestions.length > 0 && addressListRect && typeof document !== "undefined" && createPortal(
                    <div style={{
                      position: "fixed", top: addressListRect.top, left: addressListRect.left, width: addressListRect.width,
                      zIndex: 1000, background: "#fff", border: "1px solid #dde8f8", borderRadius: 8,
                      maxHeight: 200, overflowY: "auto", boxShadow: "0 8px 20px rgba(7,21,47,0.16)",
                    }}>
                      {addressSuggestions.map((s: any) => (
                        <div
                          key={s.place_id}
                          onMouseDown={() => selectSuggestion(s)}
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.88rem", cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F6FAFF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                        >
                          {s.description}
                        </div>
                      ))}
                    </div>,
                    document.body,
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => { setEditingAddress(false); setAddressMsg(null); }}
                      style={{ padding: "0.4rem 0.8rem", background: "#fff", color: "#6c7890", border: "1px solid #dde8f8", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      disabled={savingAddress || !latLng}
                      style={{
                        padding: "0.4rem 0.8rem", background: (!latLng) ? "#c7d2e0" : "#003DB4", color: "#fff",
                        border: "none", borderRadius: 6, cursor: savingAddress ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.85rem",
                      }}
                    >
                      {savingAddress ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {addressMsg && (
                    <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", fontWeight: 600, color: addressMsg.ok ? "#19a56b" : "#dc2626" }}>{addressMsg.msg}</p>
                  )}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>{operator.address}</p>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ margin: "0 0 2px 0", fontSize: "0.76rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>Coordinates</p>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#333", display: "flex", alignItems: "center", gap: 6 }}>
                {(() => {
                  // Prisma Decimal fields serialize over JSON as strings, not numbers.
                  const lat = Number(operator.latitude);
                  const lng = Number(operator.longitude);
                  if (Number.isNaN(lat) || Number.isNaN(lng)) return "Not available";
                  return (
                    <>
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#003DB4", fontWeight: 600, fontSize: "0.85rem" }}
                      >
                        <MapPin size={13} /> View on map
                      </a>
                    </>
                  );
                })()}
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
                <p style={{ margin: "0 0 2px 0", fontSize: "0.76rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>{value}</p>
              </div>
            ))}
          </div>
        </>
        )}

        {activeTab === "performance" && (
        <>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 700, color: "#07152f" }}>
            30-Day Performance
          </h3>
          {stats ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
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
                    background: "#F6FAFF", borderRadius: 10, padding: "0.85rem 0.5rem",
                    border: "1px solid #eef2fa", textAlign: "center",
                  }}
                >
                  <p style={{ margin: "0 0 4px 0", fontSize: "1.35rem", fontWeight: 700, color: "#003DB4" }}>{value}</p>
                  <p style={{ margin: 0, fontSize: "0.74rem", color: "#8892a6" }}>{label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "0.9rem" }}>No stats available yet</p>
          )}
        </>
        )}

        {activeTab === "payouts" && (
        <>
          {hasBankOnFile && !editingBank && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#F9FAFC", border: "1px solid #f0f3f8", borderRadius: 10, padding: "0.85rem 1rem",
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#333" }}>
                <strong>{operator.bankName}</strong> ····{operator.accountNumberLast4}
                <span style={{ color: "#8892a6" }}> ({operator.accountName})</span>
              </p>
              {viewerRole !== "PRODUCT" && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                  <button
                    onClick={() => setEditingBank(true)}
                    aria-label="Edit bank details"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, background: "#fff", border: "1px solid #dde8f8",
                      borderRadius: 7, color: "#003DB4", cursor: "pointer",
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    aria-label="Remove bank details"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 30, height: 30, background: "#fff", border: "1px solid #f8d7da",
                      borderRadius: 7, color: "#dc2626", cursor: deleting ? "not-allowed" : "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          {msg && !editingBank && (
            <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: msg.ok ? "#19a56b" : "#dc2626" }}>{msg.msg}</p>
          )}
          {viewerRole !== "PRODUCT" && editingBank && (
            <div style={{ background: "#F9FAFC", border: "1px solid #f0f3f8", borderRadius: 10, padding: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#8892a6", marginBottom: 4, fontWeight: 600 }}>Bank</label>
                  <input
                    ref={bankInputRef}
                    type="text"
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setBankCode("");
                      openBankList();
                    }}
                    onFocus={openBankList}
                    onBlur={() => setTimeout(() => setShowBankList(false), 150)}
                    placeholder="Search for a bank…"
                    style={{ width: "100%", padding: "0.55rem 0.65rem", borderRadius: 7, border: "1px solid #dde8f8", boxSizing: "border-box", fontSize: "0.9rem" }}
                  />
                  {showBankList && bankListRect && typeof document !== "undefined" && createPortal(
                    <div style={{
                      position: "fixed", top: bankListRect.top, left: bankListRect.left, width: bankListRect.width,
                      zIndex: 1000,
                      background: "#fff", border: "1px solid #dde8f8", borderRadius: 8,
                      maxHeight: 200, overflowY: "auto",
                      boxShadow: "0 8px 20px rgba(7,21,47,0.16)",
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
                    </div>,
                    document.body,
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#8892a6", marginBottom: 4, fontWeight: 600 }}>Account number</label>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    inputMode="numeric"
                    placeholder="10 digits"
                    style={{ width: "100%", padding: "0.55rem 0.65rem", borderRadius: 7, border: "1px solid #dde8f8", boxSizing: "border-box", fontSize: "0.9rem" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: "0.85rem" }}>
                {hasBankOnFile && (
                  <button
                    onClick={() => { setEditingBank(false); setMsg(null); setAccountNumber(""); setBankCode(""); setBankSearch(""); }}
                    style={{
                      padding: "0.6rem 1rem", background: "#fff", color: "#6c7890",
                      border: "1px solid #dde8f8", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !bankCode || accountNumber.length !== 10}
                  style={{
                    flex: 1, padding: "0.6rem",
                    background: (!bankCode || accountNumber.length !== 10) ? "#c7d2e0" : "#003DB4",
                    color: "#fff", border: "none", borderRadius: 7,
                    cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.9rem",
                  }}
                >
                  {saving ? "Saving…" : "Save bank details"}
                </button>
              </div>
              {msg && (
                <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: msg.ok ? "#19a56b" : "#dc2626" }}>{msg.msg}</p>
              )}
            </div>
          )}
        </>
        )}
        </div>
      </div>
    </div>
  );
}

export default function OperatorsTab() {
  const { operators, loading, error, fetchAll, fetchAllStats, updateStatus, setAvailability, fetchBanks, saveBankDetails, clearBankDetails, updateOperator } = useOperatorApi();
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
                            Details
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
          onClearBankDetails={async () => {
            const updated = await clearBankDetails(selectedOp.id);
            setSelectedOp(updated);
          }}
          onUpdateAddress={async (address, latitude, longitude) => {
            const updated = await updateOperator(selectedOp.id, { address, latitude, longitude });
            setSelectedOp(updated);
          }}
          viewerRole={myRole}
        />
      )}
    </div>
  );
}

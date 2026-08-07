"use client";
/**
 * OperatorProfileForm
 * -------------------
 * Business-profile editor for operators (OWNER/MANAGER) and admins.
 * Rendered next to ProfileSettings in the dashboard "My Profile" tab.
 *
 * Status, verification and availability are intentionally not editable here —
 * status is admin-only, availability has its own toggle on the Overview tab.
 */
import { useEffect, useState } from "react";
import { useOperatorApi } from "../hooks";
import type { Operator } from "../hooks";
import { TruckClass, TRUCK_CLASSES } from "../types";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const blue = "#003DB4";

const OPERATOR_TYPES: Array<{ value: string; label: string }> = [
  { value: "TOW_TRUCK",         label: "Tow truck" },
  { value: "MECHANIC",          label: "Mechanic" },
  { value: "FUEL_DELIVERY",     label: "Fuel delivery" },
  { value: "TYRE_REPAIR",       label: "Tyre repair" },
  { value: "BATTERY_JUMPSTART", label: "Battery jumpstart" },
];

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#6c7890", margin: "0 0 0.35rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #dde8f8", borderRadius: 10,
  fontSize: "0.92rem", fontFamily: dm, color: navy, background: "#fff", boxSizing: "border-box",
};

export default function OperatorProfileForm() {
  const { fetchMe, updateOperator } = useOperatorApi();

  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState<{ msg: string; ok: boolean } | null>(null);

  const [businessName, setBusinessName]   = useState("");
  const [contactName, setContactName]     = useState("");
  const [email, setEmail]                 = useState("");
  const [phone, setPhone]                 = useState("");
  const [address, setAddress]             = useState("");
  const [type, setType]                   = useState("TOW_TRUCK");
  const [serviceRadius, setServiceRadius] = useState("10");
  const [truckClasses, setTruckClasses] = useState<TruckClass[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((op) => {
        if (cancelled || !op) return;
        setOperator(op);
        setBusinessName(op.businessName ?? "");
        setContactName(op.contactName ?? "");
        setEmail(op.email ?? "");
        setPhone(op.phoneNumber ?? "");
        setAddress(op.address ?? "");
        setType(op.type ?? "TOW_TRUCK");
        setServiceRadius(String(op.serviceRadius ?? 10));
        setTruckClasses((op.truckClasses ?? []) as TruckClass[]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchMe]);

  function handleTruckClassToggle(truckClass: TruckClass) {
    setTruckClasses((prev) =>
      prev.includes(truckClass)
        ? prev.filter((tc) => tc !== truckClass)
        : [...prev, truckClass],
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!operator) return;
    setMsg(null);

    if ((operator.truckClasses?.length ?? 0) > 0 && truckClasses.length === 0) {
      setMsg({ msg: "Select at least one truck class — an empty fleet stops you receiving jobs.", ok: false });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateOperator(operator.id, {
        businessName:  businessName.trim(),
        contactName:   contactName.trim(),
        email:         email.trim(),
        phoneNumber:   phone.trim(),
        address:       address.trim(),
        type,
        serviceRadius: Number(serviceRadius) || operator.serviceRadius,
        truckClasses,
      });
      setOperator(updated);
      setMsg({ msg: "Business profile updated.", ok: true });
    } catch (err) {
      setMsg({ msg: err instanceof Error ? err.message : "Failed to update business profile", ok: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;
  if (!operator) return null; // not an operator account — render nothing

  return (
    <form
      onSubmit={handleSave}
      style={{
        background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem",
        border: "1px solid #e8edf5", fontFamily: dm, maxWidth: 560,
      }}
    >
      <h3 style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.05rem", color: navy }}>
        Business profile
      </h3>
      <p style={{ margin: "0 0 1.25rem", color: "#6c7890", fontSize: "0.85rem" }}>
        This is what customers and dispatch see. Your business phone receives WhatsApp job offers.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        <div>
          <label htmlFor="op-business" style={labelStyle}>Business name</label>
          <input id="op-business" style={inputStyle} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="op-contact" style={labelStyle}>Contact person</label>
          <input id="op-contact" style={inputStyle} value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="op-email" style={labelStyle}>Business email</label>
          <input id="op-email" type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="op-phone" style={labelStyle}>Business phone (WhatsApp dispatch)</label>
          <input id="op-phone" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="op-address" style={labelStyle}>Base address</label>
          <input id="op-address" style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
          <div>
            <label htmlFor="op-type" style={labelStyle}>Service type</label>
            <select id="op-type" style={{ ...inputStyle, appearance: "auto" }} value={type} onChange={(e) => setType(e.target.value)}>
              {OPERATOR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="op-radius" style={labelStyle}>Service radius (km)</label>
            <input
              id="op-radius" type="number" min={1} max={100} style={inputStyle}
              value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Fleet / truck classes</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {Object.entries(TRUCK_CLASSES).map(([value, label]) => (
              <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.92rem", fontFamily: dm, color: navy }}>
                <input
                  type="checkbox"
                  checked={truckClasses.includes(value as TruckClass)}
                  onChange={() => handleTruckClassToggle(value as TruckClass)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "0.65rem 1.4rem", background: blue, color: "#fff", border: "none",
            borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", fontFamily: dm,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save business profile"}
        </button>
      </div>
      {msg && (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", fontWeight: 600, color: msg.ok ? "#19a56b" : "#dc2626" }}>
          {msg.msg}
        </p>
      )}
    </form>
  );
}

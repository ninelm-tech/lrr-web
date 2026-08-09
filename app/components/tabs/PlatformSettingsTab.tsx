// app/components/tabs/PlatformSettingsTab.tsx
"use client";
import { useEffect, useState } from "react";
import { useSettingsApi } from "../../hooks";

export default function PlatformSettingsTab() {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsApi();
  const [serviceFeePercent, setServiceFeePercent] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) {
      setServiceFeePercent(String(settings.serviceFeePercent));
      setDepositPercent(String(settings.depositPercent));
    }
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await updateSettings({
      serviceFeePercent: Number(serviceFeePercent),
      depositPercent: Number(depositPercent),
    });
    setSaved(true);
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Platform Settings</h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        These percentages apply to every new quote a motorist selects going forward.
        Jobs already in progress keep the terms the motorist originally agreed to.
      </p>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Service fee (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={serviceFeePercent}
            onChange={(e) => setServiceFeePercent(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Deposit (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={depositPercent}
            onChange={(e) => setDepositPercent(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
        </div>
        {error && <p style={{ color: "#c00" }}>{error}</p>}
        {saved && !error && <p style={{ color: "#0a0" }}>Saved.</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem 1.5rem", background: "#07152f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

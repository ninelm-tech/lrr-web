// app/components/tabs/PlatformSettingsTab.tsx
"use client";
import { useEffect, useState } from "react";
import { useSettingsApi } from "../../hooks";

export default function PlatformSettingsTab() {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsApi();
  const [serviceFeePercent, setServiceFeePercent] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [dispatchWindowMinutes, setDispatchWindowMinutes] = useState("");
  const [quoteCollectionMinutes, setQuoteCollectionMinutes] = useState("");
  const [dispatchBatchSize, setDispatchBatchSize] = useState("");
  const [disputeAlertPhoneNumber, setDisputeAlertPhoneNumber] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) {
      setServiceFeePercent(String(settings.serviceFeePercent));
      setDepositPercent(String(settings.depositPercent));
      setDispatchWindowMinutes(String(settings.dispatchWindowMinutes));
      setQuoteCollectionMinutes(String(settings.quoteCollectionMinutes));
      setDispatchBatchSize(String(settings.dispatchBatchSize));
      setDisputeAlertPhoneNumber(settings.disputeAlertPhoneNumber ?? "");
    }
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await updateSettings({
      serviceFeePercent: Number(serviceFeePercent),
      depositPercent: Number(depositPercent),
      dispatchWindowMinutes: Number(dispatchWindowMinutes),
      quoteCollectionMinutes: Number(quoteCollectionMinutes),
      dispatchBatchSize: Number(dispatchBatchSize),
      disputeAlertPhoneNumber: disputeAlertPhoneNumber || null,
    });
    setSaved(true);
  }

  return (
    <div style={{ maxWidth: 480 }}>
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
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Operator response window (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            step="1"
            value={dispatchWindowMinutes}
            onChange={(e) => setDispatchWindowMinutes(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            How long each batch of offered operators has to respond (quote or decline) before dispatch retries.
            Only applies before the first quote arrives.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Quote collection window (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            step="1"
            value={quoteCollectionMinutes}
            onChange={(e) => setQuoteCollectionMinutes(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            Once the first operator quotes, bidding closes after this many minutes (or sooner if everyone
            has responded) and the motorist is shown the quotes collected so far. Nothing can extend this
            window once it starts.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Operators per batch
          </label>
          <input
            type="number"
            min={1}
            max={20}
            step="1"
            value={dispatchBatchSize}
            onChange={(e) => setDispatchBatchSize(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            How many operators are offered a job at once, before the search radius expands to reach more.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Dispute alert number
          </label>
          <input
            type="tel"
            placeholder="e.g. +2348012345678"
            value={disputeAlertPhoneNumber}
            onChange={(e) => setDisputeAlertPhoneNumber(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            WhatsApp number alerted the moment a customer raises a dispute. Leave blank to disable staff alerts.
          </p>
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

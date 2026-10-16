// app/components/tabs/PlatformSettingsTab.tsx
"use client";
import { useEffect, useState } from "react";
import { useSettingsApi } from "../../hooks";

// `undefined` guards against a deploy-skew window where the web build ships
// before the service's matching field lands, and GET /admin/settings still
// returns the pre-migration shape.
function formatPhoneLines(numbers: string[] | undefined): string {
  return (numbers ?? []).join("\n");
}

function parsePhoneLines(value: string): string[] {
  return value
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
}

export default function PlatformSettingsTab() {
  const { settings, loading, error, fetchSettings, updateSettings } = useSettingsApi();
  const [serviceFeePercent, setServiceFeePercent] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [dispatchWindowMinutes, setDispatchWindowMinutes] = useState("");
  const [quoteCollectionMinutes, setQuoteCollectionMinutes] = useState("");
  const [dispatchBatchSize, setDispatchBatchSize] = useState("");
  const [disputeAlertPhoneNumbers, setDisputeAlertPhoneNumbers] = useState("");
  const [testCustomerPhoneNumbers, setTestCustomerPhoneNumbers] = useState("");
  const [newRequestAlertPhoneNumbers, setNewRequestAlertPhoneNumbers] = useState("");
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
      setDisputeAlertPhoneNumbers(formatPhoneLines(settings.disputeAlertPhoneNumbers));
      setTestCustomerPhoneNumbers(formatPhoneLines(settings.testCustomerPhoneNumbers));
      setNewRequestAlertPhoneNumbers(formatPhoneLines(settings.newRequestAlertPhoneNumbers));
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
      disputeAlertPhoneNumbers: parsePhoneLines(disputeAlertPhoneNumbers),
      testCustomerPhoneNumbers: parsePhoneLines(testCustomerPhoneNumbers),
      newRequestAlertPhoneNumbers: parsePhoneLines(newRequestAlertPhoneNumbers),
    });
    setSaved(true);
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Service fee (%) <span style={{ fontWeight: 400, color: "#8892a6" }}>(default: 10)</span>
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
            Deposit (%) <span style={{ fontWeight: 400, color: "#8892a6" }}>(default: 10, max: 50)</span>
          </label>
          <input
            type="number"
            min={0}
            max={50}
            step="0.1"
            value={depositPercent}
            onChange={(e) => setDepositPercent(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8 }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Operator response window (minutes) <span style={{ fontWeight: 400, color: "#8892a6" }}>(default: 10)</span>
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
            Quote collection window (minutes) <span style={{ fontWeight: 400, color: "#8892a6" }}>(default: 5)</span>
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
            Operators per batch <span style={{ fontWeight: 400, color: "#8892a6" }}>(default: 3)</span>
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
            Dispute/exception alert numbers <span style={{ fontWeight: 400, color: "#8892a6" }}>(one per line, max 10 — default: none, alerts disabled)</span>
          </label>
          <textarea
            placeholder={"+2348012345678\n+2348023456789"}
            value={disputeAlertPhoneNumbers}
            onChange={(e) => setDisputeAlertPhoneNumbers(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8, fontFamily: "inherit", resize: "vertical" }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            WhatsApp numbers alerted when a customer raises a dispute, a job gets a low rating, or a completed
            job&apos;s confirmation stalls. The first number is also shown to customers as the support line.
            Leave blank to disable these alerts.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            New-request alert numbers <span style={{ fontWeight: 400, color: "#8892a6" }}>(one per line, max 10 — default: none, alerts disabled)</span>
          </label>
          <textarea
            placeholder={"+2348012345678\n+2348023456789"}
            value={newRequestAlertPhoneNumbers}
            onChange={(e) => setNewRequestAlertPhoneNumbers(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8, fontFamily: "inherit", resize: "vertical" }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            WhatsApp numbers alerted every time a customer&apos;s request becomes dispatch-ready. Separate from
            the dispute/exception numbers above, since this fires on routine traffic, not just exceptions.
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>
            Test customer numbers <span style={{ fontWeight: 400, color: "#8892a6" }}>(one per line)</span>
          </label>
          <textarea
            placeholder={"+2348012345678\n+2348023456789"}
            value={testCustomerPhoneNumbers}
            onChange={(e) => setTestCustomerPhoneNumbers(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8, fontFamily: "inherit", resize: "vertical" }}
          />
          <p style={{ margin: "6px 0 0", fontSize: "0.82rem", color: "#8892a6" }}>
            SOS requests from these numbers are routed to isTest operators only, never real ones — and real
            customers never reach an isTest operator. Used to exercise the full live flow (real Paystack, real
            payout) without touching real traffic.
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

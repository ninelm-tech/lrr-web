"use client";
import { useEffect, useState } from "react";
import { useDispatchBoardApi } from "../../hooks";
import type { DispatchBoardRow } from "../../hooks";
import { useRescueRequestApi, useOperatorApi, useAuthState } from "../../hooks";
import type { Operator } from "../../hooks";

const POLL_MS = 15_000;

const REQUEST_STATUS_LABELS: Record<string, string> = {
  DISPATCHING: "Dispatching",
  OPERATOR_ASSIGNED: "Assigned",
  CANCELLED: "Cancelled",
};

const OFFER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fff3cd", text: "#856404" },
  QUOTED: { bg: "#cfe2ff", text: "#084298" },
  SELECTED_PENDING_PAYMENT: { bg: "#cfe2ff", text: "#084298" },
  ACCEPTED: { bg: "#d4edda", text: "#155724" },
  DECLINED: { bg: "#f8d7da", text: "#721c24" },
  NOT_SELECTED: { bg: "#e2e3e5", text: "#383d41" },
  TIMED_OUT: { bg: "#e2e3e5", text: "#383d41" },
};

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

function OperatorPicker({ operators, onPick, onCancel }: {
  operators: Operator[];
  onPick: (operatorId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", width: 420, maxHeight: "70vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 1rem" }}>Offer to which operator?</h3>
        {operators.filter((op) => op.status === "ACTIVE").map((op) => (
          <button
            key={op.id}
            onClick={() => onPick(op.id)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "0.6rem", marginBottom: 6, border: "1px solid #dde8f8", borderRadius: 8, background: "#fff", cursor: "pointer" }}
          >
            <strong>{op.businessName}</strong>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>
              {op.truckClasses.join(", ") || "No truck classes set"} · {op.address}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DispatchBoardTab() {
  const { fetchBoard, expandRadius, offerToOperator } = useDispatchBoardApi();
  const { cancelRequest } = useRescueRequestApi();
  const { operators, fetchAll } = useOperatorApi();
  const { role: myRole } = useAuthState();

  const [rows, setRows] = useState<DispatchBoardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    const board = await fetchBoard();
    setRows(board);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    fetchAll();
    const poll = setInterval(() => {
      load().catch(() => {});
    }, POLL_MS);
    return () => clearInterval(poll);
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this dispatch?")) return;
    setActionError(null);
    setBusy(id);
    try {
      await cancelRequest(id, "Cancelled by admin from dispatch board");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleExpandRadius(id: string) {
    setActionError(null);
    setBusy(id);
    try {
      await expandRadius(id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleOfferTo(id: string, operatorId: string) {
    setActionError(null);
    setBusy(id);
    setPickerFor(null);
    try {
      await offerToOperator(id, operatorId);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <div>Loading dispatch board…</div>;

  const errorBanner = actionError && (
    <p style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}>
      {actionError}
    </p>
  );

  if (rows.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {errorBanner}
        <p style={{ color: "#999" }}>No active or recent dispatches.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {errorBanner}
      {rows.map((row) => {
        const isLive = row.status === "DISPATCHING";
        return (
          <div key={row.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #dde8f8", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <strong>{row.vehicleType ?? "Unknown vehicle"}</strong>
                <span style={{ color: "#999", marginLeft: 8 }}>{row.destination ?? "No destination"}</span>
                <span style={{ marginLeft: 8, fontSize: "0.8rem", color: "#666" }}>Round {row.round}</span>
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: isLive ? "#084298" : "#666" }}>
                {REQUEST_STATUS_LABELS[row.status] ?? row.status}
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: isLive ? "0.75rem" : 0 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f8ff" }}>
                  {["Operator", "Status", "Quote", "Offered", "Responded"].map((h) => (
                    <th key={h} style={{ textAlign: "left", fontSize: "0.78rem", color: "#999", padding: "0.3rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {row.offers.map((o) => {
                  const st = OFFER_STATUS_STYLES[o.status] ?? { bg: "#e2e3e5", text: "#383d41" };
                  return (
                    <tr key={o.operatorId}>
                      <td style={{ padding: "0.3rem", fontSize: "0.85rem" }}>{o.businessName}</td>
                      <td style={{ padding: "0.3rem" }}>
                        <span style={{ background: st.bg, color: st.text, padding: "0.15rem 0.5rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>{o.status}</span>
                      </td>
                      <td style={{ padding: "0.3rem", fontSize: "0.85rem" }}>{o.quotedPrice ? `₦${(o.quotedPrice / 100).toLocaleString()}` : "—"}</td>
                      <td style={{ padding: "0.3rem", fontSize: "0.8rem", color: "#999" }}>{fmtTime(o.offeredAt)}</td>
                      <td style={{ padding: "0.3rem", fontSize: "0.8rem", color: "#999" }}>{o.respondedAt ? fmtTime(o.respondedAt) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {isLive && myRole !== "PRODUCT" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleCancel(row.id)} disabled={busy === row.id} style={{ padding: "0.4rem 0.8rem", background: "#f8d7da", color: "#721c24", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={() => handleExpandRadius(row.id)} disabled={busy === row.id} style={{ padding: "0.4rem 0.8rem", background: "#cfe2ff", color: "#084298", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                  Expand radius
                </button>
                <button onClick={() => setPickerFor(row.id)} disabled={busy === row.id} style={{ padding: "0.4rem 0.8rem", background: "#003DB4", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                  Offer to operator
                </button>
              </div>
            )}
          </div>
        );
      })}

      {pickerFor && (
        <OperatorPicker
          operators={operators}
          onPick={(operatorId) => handleOfferTo(pickerFor, operatorId)}
          onCancel={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

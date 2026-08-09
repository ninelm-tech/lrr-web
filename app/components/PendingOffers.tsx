"use client";
/**
 * PendingOffers
 * -------------
 * Live dispatch offers for the logged-in operator. Operators submit a price
 * quote or decline — both WhatsApp and the dashboard share the same backend
 * quote/decline logic, so whichever channel responds first wins.
 *
 * Polls every 15s while mounted (offers expire in minutes, so freshness matters).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRescueRequestApi } from "../hooks";
import type { PendingOffer } from "../hooks";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const POLL_MS = 15_000;

function secondsLeft(expiresAt: string) {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export default function PendingOffers() {
  const { fetchMyOffers, respondToOffer } = useRescueRequestApi();
  const [offers, setOffers]     = useState<PendingOffer[]>([]);
  const [prices, setPrices]     = useState<Record<string, string>>({});
  const [busy, setBusy]         = useState<string | null>(null); // offerId being responded to
  const [outcome, setOutcome]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [, forceTick]           = useState(0); // re-render for countdowns
  const mounted = useRef(true);

  const load = useCallback(async () => {
    const data = await fetchMyOffers();
    if (mounted.current) setOffers(data.filter((o) => secondsLeft(o.expiresAt) > 0));
  }, [fetchMyOffers]);

  useEffect(() => {
    mounted.current = true;
    load();
    const poll = setInterval(load, POLL_MS);
    const tick = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => { mounted.current = false; clearInterval(poll); clearInterval(tick); };
  }, [load]);

  async function handleQuote(offer: PendingOffer) {
    const priceNaira = Number(prices[offer.id]);
    if (!priceNaira || priceNaira <= 0) {
      setOutcome({ msg: "Enter a price before submitting a quote.", ok: false });
      return;
    }
    setBusy(offer.id);
    setOutcome(null);
    try {
      const res = await respondToOffer(offer.id, priceNaira);
      setOutcome({ msg: res.message, ok: res.quoted });
    } catch (err) {
      setOutcome({ msg: err instanceof Error ? err.message : "Failed to submit quote — try again.", ok: false });
    } finally {
      setBusy(null);
      load();
    }
  }

  async function handleDecline(offer: PendingOffer) {
    setBusy(offer.id);
    setOutcome(null);
    try {
      const res = await respondToOffer(offer.id, undefined);
      setOutcome({ msg: res.message, ok: true });
    } catch (err) {
      setOutcome({ msg: err instanceof Error ? err.message : "Failed to decline — try again.", ok: false });
    } finally {
      setBusy(null);
      load();
    }
  }

  if (offers.length === 0 && !outcome) return null;

  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem",
      border: "2px solid #003DB4", fontFamily: dm, marginBottom: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%", background: "#dc2626",
          display: "inline-block", animation: "lrr-pulse 1.2s ease-in-out infinite",
        }} />
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: navy }}>
          New job offer{offers.length > 1 ? "s" : ""}
        </h3>
      </div>
      <style>{`@keyframes lrr-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>

      {offers.map((offer) => {
        const secs = secondsLeft(offer.expiresAt);
        return (
          <div
            key={offer.id}
            style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "0.9rem 0", borderTop: "1px solid #f0f2f5",
            }}
          >
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, color: navy, fontSize: "0.95rem" }}>
                {offer.request.vehicleType ?? "Vehicle"} → {offer.request.destination ?? "Destination not specified"}
              </p>
              <p style={{ margin: 0, color: "#6c7890", fontSize: "0.82rem" }}>
                Offered {new Date(offer.offeredAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                <span style={{ color: secs <= 30 ? "#dc2626" : "#d97706", fontWeight: 600 }}>
                  {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")} left
                </span>
              </p>
              {offer.request.mediaLinks.length > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem" }}>
                  {offer.request.mediaLinks.map((link, i) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" style={{ marginRight: 8, color: "#003DB4" }}>
                      Photo {i + 1}
                    </a>
                  ))}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="number"
                min={0}
                placeholder="Price (₦)"
                value={prices[offer.id] ?? ""}
                onChange={(e) => setPrices((prev) => ({ ...prev, [offer.id]: e.target.value }))}
                disabled={busy !== null || secs === 0}
                style={{
                  padding: "0.55rem 0.8rem", border: "1px solid #dde8f8", borderRadius: 10,
                  fontFamily: dm, fontSize: "0.88rem", width: 140,
                }}
              />
              <button
                onClick={() => handleQuote(offer)}
                disabled={busy !== null || secs === 0}
                style={{
                  padding: "0.55rem 1.2rem", background: "#19a56b", color: "#fff",
                  border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.88rem", fontFamily: dm,
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy === offer.id ? 0.6 : 1,
                }}
              >
                {busy === offer.id ? "…" : "Submit Quote"}
              </button>
              <button
                onClick={() => handleDecline(offer)}
                disabled={busy !== null || secs === 0}
                style={{
                  padding: "0.55rem 1.2rem", background: "#fff", color: "#dc2626",
                  border: "1px solid #f3d4d4", borderRadius: 10, fontWeight: 600, fontSize: "0.88rem", fontFamily: dm,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Decline
              </button>
            </div>
          </div>
        );
      })}

      {outcome && (
        <p style={{
          margin: "0.75rem 0 0", fontSize: "0.88rem", fontWeight: 600, whiteSpace: "pre-line",
          color: outcome.ok ? "#19a56b" : "#dc2626",
        }}>
          {outcome.msg}
        </p>
      )}
    </div>
  );
}

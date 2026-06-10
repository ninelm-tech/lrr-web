"use client";
/**
 * Customer › Settings tab
 * Account management (shared ProfileSettings) + membership info.
 *
 * Self-service cancellation was removed by product decision (2026-06-09):
 * the annual plan is non-refundable, so cancellations go through support.
 */
import ProfileSettings from "../ProfileSettings";
import type { Subscription } from "../../types";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const blue = "#003DB4";

const SUPPORT_EMAIL = "info@ninelm.com";

interface SettingsTabProps {
  activeSubscription: Subscription | null;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function SettingsTab({ activeSubscription }: SettingsTabProps) {
  const isActive = activeSubscription?.status === "ACTIVE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontFamily: dm }}>
      <ProfileSettings />

      {isActive && (
        <div style={{
          background: "#fff", borderRadius: 18, padding: "1.5rem 1.75rem",
          border: "1px solid #e8edf5", maxWidth: 560,
        }}>
          <h3 style={{ margin: "0 0 0.25rem", fontWeight: 700, fontSize: "1.05rem", color: navy }}>
            Membership
          </h3>
          <p style={{ margin: "0 0 0.5rem", color: "#6c7890", fontSize: "0.88rem" }}>
            Your membership is active until <strong style={{ color: navy }}>{fmtDate(activeSubscription?.currentPeriodEnd)}</strong>.
          </p>
          <p style={{ margin: 0, color: "#6c7890", fontSize: "0.85rem" }}>
            Need to make changes to your membership? Contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: blue, fontWeight: 600 }}>{SUPPORT_EMAIL}</a>{" "}
            and we&apos;ll sort it out.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";
/**
 * Customer › Settings tab
 * Account management (shared ProfileSettings).
 */
import ProfileSettings from "../ProfileSettings";

const dm = "var(--font-dm-sans), sans-serif";

export default function SettingsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontFamily: dm }}>
      <ProfileSettings />
    </div>
  );
}

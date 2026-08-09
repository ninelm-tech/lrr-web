// app/(portal)/platform-settings/page.tsx
"use client";
/** /platform-settings — admin-only platform pricing config (service fee %, deposit %). */
import RequireRole from "../../components/portal/RequireRole";
import PlatformSettingsTab from "../../components/tabs/PlatformSettingsTab";

export default function PlatformSettingsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <PlatformSettingsTab />
    </RequireRole>
  );
}

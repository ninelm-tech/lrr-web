// app/(portal)/platform-settings/page.tsx
"use client";
/**
 * /platform-settings — platform pricing config (service fee %, deposit %).
 * SUPER_ADMIN only — matches nav.ts and the backend, which has been
 * SUPER_ADMIN-only for a while; this page guard was still letting ADMIN in.
 */
import RequireRole from "../../components/portal/RequireRole";
import PlatformSettingsTab from "../../components/tabs/PlatformSettingsTab";

export default function PlatformSettingsPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN"]}>
      <PlatformSettingsTab />
    </RequireRole>
  );
}

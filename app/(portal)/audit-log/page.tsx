"use client";
/**
 * /audit-log — durable record of security-sensitive and financial admin
 * actions. SUPER_ADMIN only — the actions it lists (staff creation,
 * refunds, payout retries, settings changes) already require that role.
 */
import RequireRole from "../../components/portal/RequireRole";
import AuditLogTab from "../../components/tabs/AuditLogTab";

export default function AuditLogPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN"]}>
      <AuditLogTab />
    </RequireRole>
  );
}

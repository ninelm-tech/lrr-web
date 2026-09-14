"use client";
/**
 * /operators — operator management. Matches nav.ts's STAFF_VISIBILITY —
 * PRODUCT can view this (and sees the nav link for it); mutating actions
 * like status changes stay ADMIN/SUPER_ADMIN-only at the API itself.
 */
import RequireRole from "../../components/portal/RequireRole";
import OperatorsTab from "../../components/tabs/OperatorsTab";

export default function OperatorsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN", "PRODUCT"]}>
      <OperatorsTab />
    </RequireRole>
  );
}

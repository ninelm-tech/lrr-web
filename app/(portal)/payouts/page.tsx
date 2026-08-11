"use client";
/** /payouts — operator payout ledger and manual retry. Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import PayoutsTab from "../../components/tabs/PayoutsTab";

export default function PayoutsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <PayoutsTab />
    </RequireRole>
  );
}

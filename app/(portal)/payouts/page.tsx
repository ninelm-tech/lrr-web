"use client";
/**
 * /payouts — operator payout ledger and manual retry. SUPER_ADMIN only —
 * this initiates real transfers, same rule as refund-deposit on the
 * service side. Must match PORTAL_NAV's entry for "/payouts" in nav.ts.
 */
import RequireRole from "../../components/portal/RequireRole";
import PayoutsTab from "../../components/tabs/PayoutsTab";

export default function PayoutsPage() {
  return (
    <RequireRole roles={["SUPER_ADMIN"]}>
      <PayoutsTab />
    </RequireRole>
  );
}

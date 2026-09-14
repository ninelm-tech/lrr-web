"use client";
/**
 * /payments — payment records. Matches nav.ts's [STAFF_VISIBILITY,
 * OPERATOR] — this page guard was missing PRODUCT, who could see the
 * nav link but got bounced on click.
 */
import { useAuthState } from "../../hooks";
import RequireRole from "../../components/portal/RequireRole";
import PaymentsTab from "../../components/tabs/PaymentsTab";

export default function PaymentsPage() {
  const { role } = useAuthState();
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN", "OPERATOR", "PRODUCT"]}>
      <PaymentsTab role={role} />
    </RequireRole>
  );
}

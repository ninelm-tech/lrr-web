"use client";
/** /payments — payment records. Admins + operators. */
import { useAuthState } from "../../hooks";
import RequireRole from "../../components/portal/RequireRole";
import PaymentsTab from "../../components/tabs/PaymentsTab";

export default function PaymentsPage() {
  const { role } = useAuthState();
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN", "OPERATOR"]}>
      <PaymentsTab role={role} />
    </RequireRole>
  );
}

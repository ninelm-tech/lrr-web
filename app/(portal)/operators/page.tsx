"use client";
/** /operators — operator management. Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import OperatorsTab from "../../components/tabs/OperatorsTab";

export default function OperatorsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <OperatorsTab />
    </RequireRole>
  );
}

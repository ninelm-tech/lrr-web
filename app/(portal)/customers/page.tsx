"use client";
/** /customers — customer lookup and corrections. Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import CustomersTab from "../../components/tabs/CustomersTab";

export default function CustomersPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <CustomersTab />
    </RequireRole>
  );
}

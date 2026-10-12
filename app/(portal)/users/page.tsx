"use client";
/** /users — internal staff (super admin / admin / product). Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import StaffTab from "../../components/tabs/StaffTab";

export default function UsersPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <StaffTab />
    </RequireRole>
  );
}

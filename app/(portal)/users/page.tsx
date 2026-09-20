"use client";
/** /users — user management. Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import ManageUsersTab from "../../components/tabs/ManageUsersTab";

export default function UsersPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <ManageUsersTab />
    </RequireRole>
  );
}

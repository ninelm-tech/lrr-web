"use client";
/** /dispatch-board — live dispatch operations view. Admins only. */
import RequireRole from "../../components/portal/RequireRole";
import DispatchBoardTab from "../../components/tabs/DispatchBoardTab";

export default function DispatchBoardPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <DispatchBoardTab />
    </RequireRole>
  );
}

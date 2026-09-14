"use client";
/**
 * /dispatch-board — live dispatch operations view. Matches nav.ts's
 * STAFF_VISIBILITY and the backend's dispatchBoard() endpoint, both of
 * which already allow PRODUCT — this page guard was the one place still
 * excluding it.
 */
import RequireRole from "../../components/portal/RequireRole";
import DispatchBoardTab from "../../components/tabs/DispatchBoardTab";

export default function DispatchBoardPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN", "PRODUCT"]}>
      <DispatchBoardTab />
    </RequireRole>
  );
}

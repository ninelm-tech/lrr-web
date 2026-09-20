"use client";
/** /team — operator team members. Operators only. */
import RequireRole from "../../components/portal/RequireRole";
import OperatorMembersTab from "../../components/tabs/OperatorMembersTab";

export default function TeamPage() {
  return (
    <RequireRole roles={["OPERATOR"]}>
      <OperatorMembersTab />
    </RequireRole>
  );
}

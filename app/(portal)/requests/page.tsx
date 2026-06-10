"use client";
/**
 * /requests — rescue requests, scoped by role:
 *  - Admins:    all requests, filters + mutations
 *  - Operators: live offers + their assigned jobs
 *  - Customers: their own request history
 */
import { useAuthState } from "../../hooks";
import RescueRequestsTabAdmin    from "../../components/tabs/RescueRequestsTabAdmin";
import RescueRequestsTabOperator from "../../components/tabs/RescueRequestsTabOperator";
import PendingOffers             from "../../components/PendingOffers";
import CustomerRequests          from "../../components/customer/RequestsTab";

export default function RequestsPage() {
  const { ready, role } = useAuthState();
  if (!ready) return null;

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return (
      <div>
        <RescueRequestsTabAdmin />
      </div>
    );
  }

  if (role === "OPERATOR") {
    return (
      <div>
        <PendingOffers />
        <RescueRequestsTabOperator role={role} />
      </div>
    );
  }

  return <CustomerRequests />;
}

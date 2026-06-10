"use client";
/**
 * /settings — account settings for every role.
 *  - Everyone:  personal details + password (shared ProfileSettings)
 *  - Operators: + business profile
 *  - Customers: + membership info (via SettingsTab, which wraps ProfileSettings)
 */
import { useEffect } from "react";
import { useAuthState, useSubscriptionApi } from "../../hooks";
import ProfileSettings     from "../../components/ProfileSettings";
import OperatorProfileForm from "../../components/OperatorProfileForm";
import CustomerSettingsTab from "../../components/customer/SettingsTab";

function CustomerSettings() {
  const { activeSubscription, fetchMySubscriptions } = useSubscriptionApi();
  useEffect(() => {
    fetchMySubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <CustomerSettingsTab activeSubscription={activeSubscription} />;
}

export default function SettingsPage() {
  const { ready, role } = useAuthState();
  if (!ready) return null;

  return (
    <div>
      {role === "CUSTOMER" ? (
        <CustomerSettings />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <ProfileSettings />
          {role === "OPERATOR" && <OperatorProfileForm />}
        </div>
      )}
    </div>
  );
}

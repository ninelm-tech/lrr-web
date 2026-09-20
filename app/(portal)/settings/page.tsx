"use client";
/**
 * /settings — account settings for every role.
 *  - Everyone:  personal details + password (shared ProfileSettings)
 *  - Operators: + business profile
 *  - Customers: via SettingsTab, which wraps ProfileSettings
 */
import { useAuthState } from "../../hooks";
import ProfileSettings     from "../../components/ProfileSettings";
import OperatorProfileForm from "../../components/OperatorProfileForm";
import CustomerSettingsTab from "../../components/customer/SettingsTab";

export default function SettingsPage() {
  const { ready, role } = useAuthState();
  if (!ready) return null;

  return (
    <div>
      {role === "CUSTOMER" ? (
        <CustomerSettingsTab />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <ProfileSettings />
          {role === "OPERATOR" && <OperatorProfileForm />}
        </div>
      )}
    </div>
  );
}

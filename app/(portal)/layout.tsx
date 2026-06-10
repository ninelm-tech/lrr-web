/**
 * Portal route group — one shell for every role.
 * Routes: /dashboard /requests /operators /users /team /payments /settings
 */
import PortalShell from "../components/portal/PortalShell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}

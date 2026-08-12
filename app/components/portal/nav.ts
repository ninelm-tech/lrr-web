/**
 * Portal navigation + permission config — single source of truth.
 *
 * One portal for every role: the shell (sidebar/header) is identical for
 * everyone; which menu items appear — and which routes a user may open —
 * is decided here, by role.
 */
import type { UserRole } from "../../types";

export type PortalIconName =
  | "layout-dashboard"
  | "sirens"
  | "car"
  | "users"
  | "user-cog"
  | "credit-card"
  | "settings";

export interface PortalNavItem {
  label: string;
  href: string;
  icon: PortalIconName;
  section: string; 
  roles: UserRole[];
}

const ALL: UserRole[]      = ["CUSTOMER", "OPERATOR", "PRODUCT", "ADMIN", "SUPER_ADMIN"];
const ADMINS: UserRole[]   = ["ADMIN", "SUPER_ADMIN"];
const OPERATOR: UserRole[] = ["OPERATOR"];
const SUPER_ADMIN_ONLY: UserRole[] = ["SUPER_ADMIN"];
const STAFF_VISIBILITY: UserRole[] = ["ADMIN", "SUPER_ADMIN", "PRODUCT"];

export const PORTAL_NAV: PortalNavItem[] = [
  { label: "Overview",     href: "/dashboard", icon: "layout-dashboard", section: "Main",       roles: ALL },
  { label: "Requests",     href: "/requests",  icon: "sirens",           section: "Main",       roles: ALL },
  { label: "Operators",    href: "/operators", icon: "car",              section: "Management", roles: STAFF_VISIBILITY },
  { label: "Dispatch Board", href: "/dispatch-board", icon: "sirens",    section: "Management", roles: STAFF_VISIBILITY },
  { label: "Manage Users", href: "/users",     icon: "users",            section: "Management", roles: ADMINS },
  { label: "Platform Settings", href: "/platform-settings", icon: "settings", section: "Management", roles: SUPER_ADMIN_ONLY },
  { label: "Team",         href: "/team",      icon: "user-cog",         section: "Management", roles: OPERATOR },
  { label: "Payments",     href: "/payments",  icon: "credit-card",      section: "Financial",  roles: [...STAFF_VISIBILITY, ...OPERATOR] },
  { label: "Payouts",      href: "/payouts",   icon: "credit-card",      section: "Financial",  roles: SUPER_ADMIN_ONLY },
  { label: "Settings",     href: "/settings",  icon: "settings",         section: "Account",    roles: ALL },
];

/** Menu items visible to a role. */
export function navForRole(role: UserRole | null): PortalNavItem[] {
  if (!role) return [];
  return PORTAL_NAV.filter((item) => item.roles.includes(role));
}

/** May this role open this route? */
export function canAccess(href: string, role: UserRole | null): boolean {
  const item = PORTAL_NAV.find((i) => i.href === href);
  if (!item) return false;
  return role !== null && item.roles.includes(role);
}

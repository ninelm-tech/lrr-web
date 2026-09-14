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
  | "settings"
  | "audit-log";

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
  { label: "Overview",     href: "/dashboard", icon: "layout-dashboard", section: "Main",           roles: ALL },
  // Same route, two audiences: a customer's own requests are a "Main"
  // concern; everyone running the platform treats requests as operational,
  // alongside Dispatch Board. Split rather than one shared section, since
  // no single section name fits both.
  { label: "Requests",     href: "/requests",  icon: "sirens",           section: "Main",           roles: ["CUSTOMER"] },
  { label: "Requests",     href: "/requests",  icon: "sirens",           section: "Operations",     roles: [...STAFF_VISIBILITY, ...OPERATOR] },
  { label: "Dispatch Board", href: "/dispatch-board", icon: "sirens",    section: "Operations",     roles: STAFF_VISIBILITY },
  { label: "Operators",    href: "/operators", icon: "car",              section: "Operations",     roles: STAFF_VISIBILITY },
  { label: "Payments",     href: "/payments",  icon: "credit-card",      section: "Financial",      roles: [...STAFF_VISIBILITY, ...OPERATOR] },
  { label: "Payouts",      href: "/payouts",   icon: "credit-card",      section: "Financial",      roles: SUPER_ADMIN_ONLY },
  { label: "Manage Users", href: "/users",     icon: "users",            section: "Administration", roles: ADMINS },
  { label: "Platform Settings", href: "/platform-settings", icon: "settings", section: "Administration", roles: SUPER_ADMIN_ONLY },
  { label: "Audit Log",    href: "/audit-log", icon: "audit-log",        section: "Administration", roles: SUPER_ADMIN_ONLY },
  { label: "Team",         href: "/team",      icon: "user-cog",         section: "Business",       roles: OPERATOR },
];

/** Menu items visible to a role. */
export function navForRole(role: UserRole | null): PortalNavItem[] {
  if (!role) return [];
  return PORTAL_NAV.filter((item) => item.roles.includes(role));
}

/**
 * May this role open this route? A route can appear as more than one
 * PortalNavItem (e.g. "Requests" is sectioned differently per audience but
 * shares an href) — checks every entry for it, not just the first.
 */
export function canAccess(href: string, role: UserRole | null): boolean {
  if (!role) return false;
  return PORTAL_NAV.some((i) => i.href === href && i.roles.includes(role));
}

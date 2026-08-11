/**
 * hooks/index.ts
 * --------------
 * Single import point for all LRR API hooks.
 *
 * Usage:
 *   import { useRescueRequestApi, useOperatorApi } from "@/hooks";
 *
 * Non-API utility hooks (address autocomplete, etc.) are not exported
 * here — import them directly from their files if needed.
 */

export { useAuthApi }         from "./useAuthApi";
export { useAuthState, dashboardPath } from "./useAuthState";
export { useRescueRequestApi } from "./useRescueRequestApi";
export { useOperatorApi }     from "./useOperatorApi";
export { useSubscriptionApi } from "./useSubscriptionApi";
export { usePaymentApi }      from "./usePaymentApi";
export { useSettingsApi }     from "./useSettingsApi";
export { useRatingApi }       from "./useRatingApi";

// Re-export types that components commonly need
export type { UserListItem, UserListResult, ListUsersOptions }    from "./useAuthApi";
export type { AdminOverviewStats, PendingOffer }                   from "./useRescueRequestApi";
export type { Operator, OperatorMember, OperatorStats,
              OperatorStatus, OperatorMemberRole,
              OperatorLeaderboardEntry }                           from "./useOperatorApi";
export type { PaymentRecord, PaymentSummary, PaymentListOptions } from "./usePaymentApi";
export type { SubscriptionPlanKey }                                from "./useSubscriptionApi";
export type { PlatformSettings }                                   from "./useSettingsApi";
export type { RatingDetail }                                       from "./useRatingApi";

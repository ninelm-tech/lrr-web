import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface PayoutListItem {
  id: string;
  amount: number;
  // Payouts are Payment rows now (type PAYOUT), not a dedicated Payout
  // table — these are PaymentStatus/PaymentBlockReason values, not the old
  // PayoutStatus/PayoutBlockReason ones.
  status: "PENDING" | "SUBMITTED" | "BLOCKED" | "SUCCEEDED" | "FAILED" | "REVERSED";
  blockReason:
    | "NO_BANK_DETAILS"
    | "INSUFFICIENT_BALANCE"
    | "ACCOUNT_RESTRICTED"
    | "PAYOUT_ON_HOLD"
    | "INVALID_RECIPIENT"
    | "INVALID_AMOUNT"
    | "INVALID_REFERENCE"
    | "PAYSTACK_VALIDATION"
    | "AWAITING_OTP"
    | "NEEDS_CUSTOMER_DETAILS"
    | null;
  failureReason: string | null;
  createdAt: string;
  settledAt: string | null;
  operator: { businessName: string };
  rescueRequest: { id: string; disputed: boolean; disputeResolvedAt: string | null };
  // True when a DIFFERENT row for this same job already succeeded (a normal
  // retry that resolved on a later sibling, or an admin reconciling a
  // payout paid directly at Paystack). This row's own status says nothing
  // about that — never offer Retry when this is true.
  alreadySucceeded: boolean;
  // Only the newest attempt for a job may be retried. Older failures remain
  // visible as immutable ledger history.
  isLatestAttempt?: boolean;
  // Authoritative server-side decision. Optional during rolling deployment
  // so the web remains compatible with the preceding API version.
  canRetry?: boolean;
}

export function usePayoutApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayouts = useCallback(async (status?: string): Promise<PayoutListItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await apiFetch(`/payouts${qs}`);
      return (res.data ?? []) as PayoutListItem[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch payouts";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Returns the server's description of what actually happened — a retry
   * can legitimately end up re-blocked (e.g. the operator still has no
   * bank details), which is not a success and shouldn't be reported as one.
   */
  const retryPayout = useCallback(async (id: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/payouts/${id}/retry`, { method: "POST" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to retry payout";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchPayouts, retryPayout };
}

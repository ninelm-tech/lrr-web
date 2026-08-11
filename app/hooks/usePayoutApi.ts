import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface PayoutListItem {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  blockReason: "NO_BANK_DETAILS" | "INSUFFICIENT_BALANCE" | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  operator: { businessName: string };
  rescueRequest: { id: string };
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

  const retryPayout = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/payouts/${id}/retry`, { method: "POST" });
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

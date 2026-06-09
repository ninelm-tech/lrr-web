/**
 * usePaymentApi
 * -------------
 * Financial / payment summary API calls.
 *
 * Payments in LRR live on RescueRequest rows (depositPaid, balancePaid,
 * depositAmount, balanceAmount).  This hook fetches rescue requests for
 * financial reporting and surfaces pre-computed summary totals.
 *
 * Covers:
 *  - Paginated payment list (filtered view of rescue requests)
 *  - Running summary totals across all records
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type { RescueRequestListItem } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaymentRecord extends RescueRequestListItem {
  depositAmount?: number;
  balanceAmount?: number;
}

export interface PaymentSummary {
  depositCollected:  number;  // kobo
  balanceCollected:  number;  // kobo
  totalCollected:    number;  // kobo
  depositPending:    number;  // kobo
  balancePending:    number;  // kobo
  totalOutstanding:  number;  // kobo
}

export interface PaymentListOptions {
  depositPaid?: boolean;
  balancePaid?: boolean;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePaymentApi() {
  const [records,  setRecords]  = useState<PaymentRecord[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(20);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── Paginated list for the payments table ─────────────────────────────────

  const fetchPaymentList = useCallback(async (opts: PaymentListOptions = {}): Promise<PaymentRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.depositPaid !== undefined) params.append("depositPaid", String(opts.depositPaid));
      if (opts.balancePaid !== undefined) params.append("balancePaid", String(opts.balancePaid));
      if (opts.from)  params.append("from",  opts.from);
      if (opts.to)    params.append("to",    opts.to);
      params.append("page",  String(opts.page  ?? 1));
      params.append("limit", String(opts.limit ?? 20));

      const res = await apiFetch(`/rescue-requests?${params.toString()}`);
      const data = (res.data ?? []) as PaymentRecord[];
      setRecords(data);
      setTotal(res.meta?.total ?? 0);
      setPage(res.meta?.page   ?? 1);
      setLimit(res.meta?.limit ?? 20);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch payments";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Summary totals (larger batch, no UI pagination) ───────────────────────
  /**
   * Fetches a large page of rescue requests and computes aggregate totals.
   * Uses conservative defaults for amounts when the API doesn't return them.
   */
  const fetchSummary = useCallback(async (): Promise<PaymentSummary> => {
    try {
      const res = await apiFetch("/rescue-requests?limit=500&page=1");
      const all = (res.data ?? []) as PaymentRecord[];

      let depositCollected = 0;
      let balanceCollected = 0;
      let depositPending   = 0;
      let balancePending   = 0;

      for (const r of all) {
        const dep = r.depositAmount ?? 500000;   // ₦5,000 default in kobo
        const bal = r.balanceAmount ?? 4500000;  // ₦45,000 default in kobo

        if (r.depositPaid)  depositCollected += dep;
        else                depositPending   += dep;

        if (r.balancePaid)            balanceCollected += bal;
        else if (r.depositPaid)       balancePending   += bal;
      }

      return {
        depositCollected,
        balanceCollected,
        totalCollected:   depositCollected + balanceCollected,
        depositPending,
        balancePending,
        totalOutstanding: depositPending   + balancePending,
      };
    } catch {
      return {
        depositCollected: 0, balanceCollected: 0, totalCollected:   0,
        depositPending:   0, balancePending:   0, totalOutstanding: 0,
      };
    }
  }, []);

  return {
    // State
    records,
    total,
    page,
    limit,
    loading,
    error,
    // Actions
    fetchPaymentList,
    fetchSummary,
  };
}

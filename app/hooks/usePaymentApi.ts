/**
 * usePaymentApi
 * -------------
 * Real payment-ledger reads for the admin/operator Payments page — backed by
 * GET /payments and /payments/summary (PaymentAdminService), which query the
 * Payment table directly. One row here is one attempt (see
 * docs/superpowers/specs/2026-09-12-payment-model-design.md), not one
 * rescue request — a request can have a FAILED attempt followed by a
 * SUCCEEDED one, and both show up.
 *
 * Covers:
 *  - Paginated payment list
 *  - Server-computed summary totals across all records this caller can see
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentType = "DEPOSIT" | "BALANCE" | "REFUND" | "PAYOUT";
export type PaymentStatus =
  | "PENDING"
  | "SUBMITTED"
  | "BLOCKED"
  | "SUCCEEDED"
  | "DUPLICATE_SUCCEEDED"
  | "FAILED"
  | "REVERSED";

export interface PaymentRecordParty {
  id: string;
  phoneNumber?: string | null;
  businessName?: string;
}

export interface PaymentRecord {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerFee: number | null;
  netAmount: number | null;
  failureReason: string | null;
  blockReason: string | null;
  checkoutUrl: string | null;
  paystackReference?: string | null;
  verifyAttempts: number;
  createdAt: string;
  settledAt: string | null;
  rescueRequestId: string;
  customer: PaymentRecordParty;
  assignedOperator: PaymentRecordParty | null;
  payoutOperator: PaymentRecordParty | null;
}

export interface PaymentSummary {
  depositCollected: number;
  balanceCollected: number;
  totalCollected: number;
  depositPending: number;
  balancePending: number;
  totalOutstanding: number;
}

export interface PaymentListOptions {
  type?: PaymentType;
  status?: PaymentStatus;
  operatorId?: string;
  rescueRequestId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const EMPTY_SUMMARY: PaymentSummary = {
  depositCollected: 0,
  balanceCollected: 0,
  totalCollected: 0,
  depositPending: 0,
  balancePending: 0,
  totalOutstanding: 0,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePaymentApi() {
  const [records,  setRecords]  = useState<PaymentRecord[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(20);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const buildParams = (opts: PaymentListOptions) => {
    const params = new URLSearchParams();
    if (opts.type)            params.append("type",            opts.type);
    if (opts.status)          params.append("status",          opts.status);
    if (opts.operatorId)      params.append("operatorId",      opts.operatorId);
    if (opts.rescueRequestId) params.append("rescueRequestId", opts.rescueRequestId);
    if (opts.from)            params.append("from",            opts.from);
    if (opts.to)               params.append("to",              opts.to);
    return params;
  };

  const fetchPaymentList = useCallback(async (opts: PaymentListOptions = {}): Promise<PaymentRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(opts);
      params.append("page",  String(opts.page  ?? 1));
      params.append("limit", String(opts.limit ?? 20));

      const res = await apiFetch(`/payments?${params.toString()}`);
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

  const fetchSummary = useCallback(async (opts: PaymentListOptions = {}): Promise<PaymentSummary> => {
    try {
      const params = buildParams(opts);
      const res = await apiFetch(`/payments/summary?${params.toString()}`);
      return res ?? EMPTY_SUMMARY;
    } catch {
      return EMPTY_SUMMARY;
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

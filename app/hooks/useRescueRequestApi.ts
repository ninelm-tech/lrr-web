/**
 * useRescueRequestApi
 * -------------------
 * All rescue-request API calls.
 *
 * Covers:
 *  - Paginated list with filters (admin, operator, customer — backend scopes by role)
 *  - Single request detail
 *  - Assign operator, update status, cancel
 *  - Admin overview stats (active counts, completed-today)
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type {
  RescueRequestListItem,
  RescueRequestDetail,
  RescueRequestListResponse,
  FetchListOptions,
} from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminOverviewStats {
  totalRequests:    number;
  dispatching:      number;
  operatorAssigned: number;
  inProgress:       number;
  completedToday:   number;
  /** dispatching + operatorAssigned + inProgress */
  activeTotal:      number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRescueRequestApi() {
  const [requests, setRequests] = useState<RescueRequestListItem[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [limit,    setLimit]    = useState(20);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── List ─────────────────────────────────────────────────────────────────

  const fetchList = useCallback(async (opts: FetchListOptions = {}): Promise<RescueRequestListResponse> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.status)      params.append("status",      opts.status);
      if (opts.issueType)   params.append("issueType",   opts.issueType);
      if (opts.operatorId)  params.append("operatorId",  opts.operatorId);
      if (opts.depositPaid !== undefined) params.append("depositPaid", String(opts.depositPaid));
      if (opts.balancePaid !== undefined) params.append("balancePaid", String(opts.balancePaid));
      if (opts.from)   params.append("from",  opts.from);
      if (opts.to)     params.append("to",    opts.to);
      if (opts.search) params.append("search", opts.search);
      if (opts.page)   params.append("page",  String(opts.page));
      if (opts.limit)  params.append("limit", String(opts.limit));

      const qs = params.toString();
      const res = await apiFetch(`/rescue-requests${qs ? `?${qs}` : ""}`) as RescueRequestListResponse;
      setRequests(res.data);
      setTotal(res.meta.total);
      setPage(res.meta.page);
      setLimit(res.meta.limit);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch requests";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Detail ───────────────────────────────────────────────────────────────

  const fetchDetail = useCallback(async (id: string): Promise<RescueRequestDetail> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/rescue-requests/${id}`) as RescueRequestDetail;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch request details";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Mutations ────────────────────────────────────────────────────────────

  const assignOperator = useCallback(async (id: string, operatorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/rescue-requests/${id}/assign-operator`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ operatorId }),
      });
      await fetchList();
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign operator";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/rescue-requests/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      await fetchList();
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  const cancelRequest = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/rescue-requests/${id}/cancel`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reason }),
      });
      await fetchList();
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel request";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  // ── Admin overview stats ──────────────────────────────────────────────────
  /**
   * Fires several lightweight count-only queries in parallel and returns
   * an aggregated AdminOverviewStats object.  No local state is mutated —
   * callers handle display state themselves.
   */
  const fetchAdminOverviewStats = useCallback(async (): Promise<AdminOverviewStats> => {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [allRes, dispRes, assignedRes, inProgressRes, completedTodayRes] = await Promise.all([
      apiFetch("/rescue-requests?limit=1").catch(() => null),
      apiFetch("/rescue-requests?limit=1&status=DISPATCHING").catch(() => null),
      apiFetch("/rescue-requests?limit=1&status=OPERATOR_ASSIGNED").catch(() => null),
      apiFetch("/rescue-requests?limit=1&status=IN_PROGRESS").catch(() => null),
      apiFetch(`/rescue-requests?limit=1&status=COMPLETED&from=${todayStart.toISOString()}&to=${todayEnd.toISOString()}`).catch(() => null),
    ]);

    const dispatching     = dispRes?.meta?.total          ?? 0;
    const operatorAssigned = assignedRes?.meta?.total     ?? 0;
    const inProgress      = inProgressRes?.meta?.total    ?? 0;

    return {
      totalRequests:    allRes?.meta?.total           ?? 0,
      dispatching,
      operatorAssigned,
      inProgress,
      completedToday:   completedTodayRes?.meta?.total ?? 0,
      activeTotal:      dispatching + operatorAssigned + inProgress,
    };
  }, []);

  /** Thin wrapper — fetch customer's own requests without touching shared state. */
  const fetchMyRequests = useCallback(async (opts: FetchListOptions = {}): Promise<RescueRequestListResponse> => {
    const params = new URLSearchParams();
    if (opts.limit)  params.append("limit",  String(opts.limit ?? 10));
    if (opts.page)   params.append("page",   String(opts.page  ?? 1));
    if (opts.status) params.append("status", opts.status);
    const qs = params.toString();
    return apiFetch(`/rescue-requests${qs ? `?${qs}` : ""}`);
  }, []);

  return {
    // State
    requests,
    total,
    page,
    limit,
    loading,
    error,
    // Read
    fetchList,
    fetchDetail,
    fetchMyRequests,
    fetchAdminOverviewStats,
    // Write
    assignOperator,
    updateStatus,
    cancelRequest,
  };
}

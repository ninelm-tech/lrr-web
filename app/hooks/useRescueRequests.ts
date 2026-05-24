import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type {
  RescueRequestListItem,
  RescueRequestDetail,
  RescueRequestListResponse,
  FetchListOptions,
  AssignOperatorRequest,
  StatusUpdateRequest,
  CancelRequest,
} from "../types";

const BASE_API = "/rescue-requests";

export function useRescueRequests() {
  const [requests, setRequests] = useState<RescueRequestListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (options: FetchListOptions = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.issueType) params.append("issueType", options.issueType);
      if (options.operatorId) params.append("operatorId", options.operatorId);
      if (options.depositPaid !== undefined) params.append("depositPaid", String(options.depositPaid));
      if (options.balancePaid !== undefined) params.append("balancePaid", String(options.balancePaid));
      if (options.from) params.append("from", options.from);
      if (options.to) params.append("to", options.to);
      if (options.search) params.append("search", options.search);
      if (options.page) params.append("page", String(options.page));
      if (options.limit) params.append("limit", String(options.limit));

      const queryString = params.toString();
      const url = queryString ? `${BASE_API}?${queryString}` : BASE_API;

      const response = (await apiFetch(url)) as RescueRequestListResponse;
      setRequests(response.data);
      setTotal(response.meta.total);
      setPage(response.meta.page);
      setLimit(response.meta.limit);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch rescue requests";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: string): Promise<RescueRequestDetail> => {
    setLoading(true);
    setError(null);
    try {
      const response = (await apiFetch(`${BASE_API}/${id}`)) as RescueRequestDetail;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch rescue request details";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignOperator = useCallback(
    async (id: string, operatorId: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: AssignOperatorRequest = { operatorId };
        const response = await apiFetch(`${BASE_API}/${id}/assign-operator`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Refresh list after update
        await fetchList();
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to assign operator";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchList]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: StatusUpdateRequest = { status: status as any };
        const response = await apiFetch(`${BASE_API}/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Refresh list after update
        await fetchList();
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update status";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchList]
  );

  const cancel = useCallback(
    async (id: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: CancelRequest = { reason };
        const response = await apiFetch(`${BASE_API}/${id}/cancel`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // Refresh list after update
        await fetchList();
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to cancel request";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchList]
  );

  return {
    requests,
    total,
    page,
    limit,
    loading,
    error,
    fetchList,
    fetchDetail,
    assignOperator,
    updateStatus,
    cancel,
  };
}

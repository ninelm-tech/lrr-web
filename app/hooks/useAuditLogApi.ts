import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface AuditLogEntry {
  id: string;
  category: string;
  message: string;
  details: Record<string, unknown> | null;
  actorId: string | null;
  actorName: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface AuditLogListMeta {
  total: number;
  page: number;
  limit: number;
}

export function useAuditLogApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = useCallback(
    async (opts: { category?: string; page?: number; limit?: number } = {}): Promise<{
      data: AuditLogEntry[];
      meta: AuditLogListMeta;
    }> => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (opts.category) params.append("category", opts.category);
        params.append("page", String(opts.page ?? 1));
        params.append("limit", String(opts.limit ?? 25));
        const res = await apiFetch(`/audit-log?${params.toString()}`);
        return {
          data: (res.data ?? []) as AuditLogEntry[],
          meta: res.meta ?? { total: 0, page: 1, limit: 25 },
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch audit log";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const markReviewed = useCallback(async (id: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/audit-log/${id}/review`, { method: "PATCH" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to mark reviewed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchAuditLog, markReviewed };
}

import { useState, useCallback } from "react";
import { apiFetch } from "./api";

export interface OperatorStats {
  totalOffered: number;
  totalAccepted: number;
  totalDeclined: number;
  totalTimedOut: number;
  acceptanceRate: number;  // 0–1
  avgResponseSec: number;
}

export interface Operator {
  id: string;
  businessName: string;
  contactName: string;
  phoneNumber: string;
  email: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceRadius: number;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  isAvailable: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  members?: Array<{ role: string; user: { id: string; name?: string; email?: string } }>;
}

export interface OperatorWithStats extends Operator {
  stats?: OperatorStats;
}

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/operators");
      setOperators(res.data);
      return res.data as Operator[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch operators";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllStats = useCallback(async (days = 30) => {
    try {
      const res = await apiFetch(`/operators/all-stats?days=${days}`);
      return res.data as Array<{
        operatorId: string;
        businessName: string;
        phoneNumber: string;
        status: string;
        stats: OperatorStats;
      }>;
    } catch (err) {
      console.error("Failed to fetch operator stats:", err);
      return [];
    }
  }, []);

  const fetchStats = useCallback(async (id: string, days = 30): Promise<OperatorStats | null> => {
    try {
      const res = await apiFetch(`/operators/${id}/stats?days=${days}`);
      return res.data as OperatorStats;
    } catch (err) {
      console.error("Failed to fetch operator stats:", err);
      return null;
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED") => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/operators/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        // Refresh list
        await fetchAll();
        return res.data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update operator status";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAll],
  );

  const setAvailability = useCallback(
    async (id: string, isAvailable: boolean) => {
      try {
        const res = await apiFetch(`/operators/${id}/availability`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable }),
        });
        setOperators((prev) =>
          prev.map((op) => (op.id === id ? { ...op, isAvailable } : op)),
        );
        return res.data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update availability";
        setError(msg);
        throw err;
      }
    },
    [],
  );

  return {
    operators,
    loading,
    error,
    fetchAll,
    fetchAllStats,
    fetchStats,
    updateStatus,
    setAvailability,
  };
}

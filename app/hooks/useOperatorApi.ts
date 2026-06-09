/**
 * useOperatorApi
 * --------------
 * All operator API calls.
 *
 * Covers:
 *  - List all operators
 *  - Get the authenticated user's own operator record (GET /operators/me)
 *  - Get a single operator by ID
 *  - Performance stats (single + leaderboard)
 *  - Update status / toggle availability
 *  - Team member management (list / add / remove)
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OperatorStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type OperatorMemberRole = "OWNER" | "MANAGER" | "DISPATCHER" | "DRIVER" | "STAFF";

export interface OperatorStats {
  totalOffered:    number;
  totalAccepted:   number;
  totalDeclined:   number;
  totalTimedOut:   number;
  acceptanceRate:  number;  // 0–1
  avgResponseSec:  number;
}

export interface Operator {
  id:            string;
  businessName:  string;
  contactName:   string;
  phoneNumber:   string;
  email:         string | null;
  type:          string;
  address:       string;
  latitude:      number;
  longitude:     number;
  serviceRadius: number;
  status:        OperatorStatus;
  isAvailable:   boolean;
  verifiedAt:    string | null;
  createdAt:     string;
  updatedAt:     string;
  members?: OperatorMember[];
}

export interface OperatorMember {
  id:         string;
  role:       OperatorMemberRole;
  createdAt:  string;
  user: {
    id:          string;
    name:        string | null;
    email:       string | null;
    phoneNumber: string | null;
    role:        string;
  };
}

export interface OperatorLeaderboardEntry {
  operatorId:   string;
  businessName: string;
  phoneNumber:  string;
  status:       string;
  stats:        OperatorStats;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOperatorApi() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── List ─────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async (): Promise<Operator[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/operators");
      const data = (res.data ?? []) as Operator[];
      setOperators(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch operators";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Returns the operator record that belongs to the currently-logged-in user. */
  const fetchMe = useCallback(async (): Promise<Operator | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/operators/me");
      return (res.data ?? null) as Operator | null;
    } catch (err) {
      // 404 means this user has no operator account — not a hard error
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string): Promise<Operator | null> => {
    try {
      const res = await apiFetch(`/operators/${id}`);
      return (res.data ?? null) as Operator | null;
    } catch {
      return null;
    }
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (id: string, days = 30): Promise<OperatorStats | null> => {
    try {
      const res = await apiFetch(`/operators/${id}/stats?days=${days}`);
      return (res.data ?? null) as OperatorStats | null;
    } catch {
      return null;
    }
  }, []);

  const fetchAllStats = useCallback(async (days = 30): Promise<OperatorLeaderboardEntry[]> => {
    try {
      const res = await apiFetch(`/operators/all-stats?days=${days}`);
      return (res.data ?? []) as OperatorLeaderboardEntry[];
    } catch {
      return [];
    }
  }, []);

  // ── Status / Availability ────────────────────────────────────────────────

  const updateStatus = useCallback(async (id: string, status: OperatorStatus): Promise<Operator> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/operators/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      // Reflect update in local list if it's loaded
      setOperators((prev) => prev.map((op) => op.id === id ? { ...op, status } : op));
      return res.data as Operator;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setAvailability = useCallback(async (id: string, isAvailable: boolean): Promise<Operator> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/operators/${id}/availability`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isAvailable }),
      });
      setOperators((prev) => prev.map((op) => op.id === id ? { ...op, isAvailable } : op));
      return res.data as Operator;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update availability";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Members ──────────────────────────────────────────────────────────────

  const fetchMembers = useCallback(async (operatorId: string): Promise<OperatorMember[]> => {
    try {
      const res = await apiFetch(`/operators/${operatorId}/members`);
      return (res.data ?? []) as OperatorMember[];
    } catch {
      return [];
    }
  }, []);

  const addMember = useCallback(async (
    operatorId: string,
    userId: string,
    role: OperatorMemberRole = "STAFF",
  ): Promise<OperatorMember> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/operators/${operatorId}/members`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, role }),
      });
      return res.data as OperatorMember;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add member";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (operatorId: string, memberId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/operators/${operatorId}/members/${memberId}`, { method: "DELETE" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove member";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    operators,
    loading,
    error,
    // Read
    fetchAll,
    fetchMe,
    fetchById,
    fetchStats,
    fetchAllStats,
    // Write
    updateStatus,
    setAvailability,
    // Members
    fetchMembers,
    addMember,
    removeMember,
  };
}

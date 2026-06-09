/**
 * useSubscriptionApi
 * ------------------
 * All subscription API calls.
 *
 * Covers:
 *  - Available plans
 *  - Current user's subscriptions
 *  - Subscribe (initiates Paystack checkout)
 *  - Cancel subscription
 */

import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type { SubscriptionPlan, Subscription } from "../types";

export function useSubscriptionApi() {
  const [plans,          setPlans]   = useState<SubscriptionPlan[]>([]);
  const [mySubscriptions, setMySubs] = useState<Subscription[]>([]);
  const [loading,  setLoading]       = useState(false);
  const [error,    setError]         = useState<string | null>(null);

  // ── Plans ─────────────────────────────────────────────────────────────────

  const fetchPlans = useCallback(async (): Promise<SubscriptionPlan[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/subscriptions/plans");
      const data: SubscriptionPlan[] = Array.isArray(res) ? res : (res.data ?? []);
      setPlans(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load plans";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── My subscriptions ──────────────────────────────────────────────────────

  const fetchMySubscriptions = useCallback(async (): Promise<Subscription[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/subscriptions/me");
      const data: Subscription[] = Array.isArray(res) ? res : (res.data ?? []);
      setMySubs(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load subscriptions";
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Subscribe ─────────────────────────────────────────────────────────────

  /** Initiates Paystack checkout. Returns the redirect URL on success. */
  const subscribe = useCallback(async (planKey: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/subscriptions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ planKey }),
      });
      return res.url ?? res.data?.url ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start checkout";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Cancel ────────────────────────────────────────────────────────────────

  const cancelSubscription = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/subscriptions/${id}`, { method: "DELETE" });
      await fetchMySubscriptions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMySubscriptions]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeSubscription = mySubscriptions.find((s) => s.status === "ACTIVE") ?? null;
  const towsLeft = activeSubscription
    ? activeSubscription.towsIncludedPerMonth - activeSubscription.towsUsedThisMonth
    : 0;

  return {
    // State
    plans,
    mySubscriptions,
    activeSubscription,
    towsLeft,
    loading,
    error,
    // Actions
    fetchPlans,
    fetchMySubscriptions,
    subscribe,
    cancelSubscription,
  };
}

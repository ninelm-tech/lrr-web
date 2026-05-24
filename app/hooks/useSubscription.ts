import { useState, useCallback } from "react";
import { apiFetch } from "./api";
import type { SubscriptionPlan, Subscription } from "../types";

export function useSubscription() {
  const [plans, setPlans]               = useState<SubscriptionPlan[]>([]);
  const [mySubscriptions, setMySubs]    = useState<Subscription[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/subscriptions/plans");
      // API returns { data: SubscriptionPlan[] } or just an array
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

  const fetchMySubscriptions = useCallback(async () => {
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

  const subscribe = useCallback(async (planKey: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      // Returns { url: "https://checkout.paystack.com/..." }
      return res.url ?? res.data?.url ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start checkout";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (id: string) => {
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

  const activeSubscription = mySubscriptions.find((s) => s.status === "ACTIVE") ?? null;
  const towsLeft = activeSubscription
    ? activeSubscription.towsIncludedPerMonth - activeSubscription.towsUsedThisMonth
    : 0;

  return {
    plans,
    mySubscriptions,
    activeSubscription,
    towsLeft,
    loading,
    error,
    fetchPlans,
    fetchMySubscriptions,
    subscribe,
    cancelSubscription,
  };
}

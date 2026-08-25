import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface PlatformSettings {
  serviceFeePercent: number;
  depositPercent: number;
  dispatchWindowMinutes: number;
  quoteCollectionMinutes: number;
  dispatchBatchSize: number;
  disputeAlertPhoneNumber: string | null;
}

export function useSettingsApi() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (): Promise<PlatformSettings> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/settings");
      const data = res.data as PlatformSettings;
      setSettings(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch settings";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = res.data as PlatformSettings;
      setSettings(updated);
      return updated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update settings";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { settings, loading, error, fetchSettings, updateSettings };
}

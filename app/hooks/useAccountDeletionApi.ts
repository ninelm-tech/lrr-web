import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export function useAccountDeletionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (id: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/users/${id}`, { method: "DELETE" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOperator = useCallback(async (id: string): Promise<{ message: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch(`/operators/${id}`, { method: "DELETE" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete operator";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, deleteUser, deleteOperator };
}

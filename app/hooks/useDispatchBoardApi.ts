import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface DispatchBoardOffer {
  operatorId: string;
  businessName: string;
  status: string;
  quotedPrice: number | null;
  offeredAt: string;
  respondedAt: string | null;
}

export interface DispatchBoardRow {
  id: string;
  status: string;
  vehicleType: string | null;
  destination: string | null;
  round: number;
  createdAt: string;
  offers: DispatchBoardOffer[];
}

export function useDispatchBoardApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async (): Promise<DispatchBoardRow[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/rescue-requests/dispatch-board");
      return (res.data ?? []) as DispatchBoardRow[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch dispatch board";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const expandRadius = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/rescue-requests/${id}/expand-radius`, { method: "POST" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to expand radius";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const offerToOperator = useCallback(async (id: string, operatorId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/rescue-requests/${id}/offer-to/${operatorId}`, { method: "POST" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send offer";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchBoard, expandRadius, offerToOperator };
}

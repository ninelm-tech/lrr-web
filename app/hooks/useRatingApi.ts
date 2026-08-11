import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface RatingDetail {
  ratedName: string;
  score: number;
  comment: string | null;
}

export function useRatingApi() {
  const [rating, setRating] = useState<RatingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRating = useCallback(async (id: string): Promise<RatingDetail> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/ratings/${id}`);
      const data = res.data as RatingDetail;
      setRating(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load rating";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitComment = useCallback(async (id: string, comment: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/ratings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit feedback";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rating, loading, error, fetchRating, submitComment };
}

import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export function useOtpApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = useCallback(async (phoneNumber: string): Promise<{ required: boolean; available?: boolean }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch("/otp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send code";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (phoneNumber: string, code: string): Promise<{ token: string }> => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch("/otp/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to verify code";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, sendCode, verifyCode };
}

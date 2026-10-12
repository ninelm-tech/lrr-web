import { useCallback, useState } from "react";
import { apiFetch } from "./api";
import type { UserRole } from "../types";

export interface StaffMember {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResult {
  data: StaffMember[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ListStaffOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useStaffApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listStaff = useCallback(async (opts: ListStaffOptions = {}): Promise<StaffListResult> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.search) params.append("search", opts.search);
      if (opts.page)   params.append("page",   String(opts.page));
      if (opts.limit)  params.append("limit",  String(opts.limit));
      const qs = params.toString();
      return await apiFetch(`/admin/staff${qs ? `?${qs}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list staff");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (
    id: string,
    data: { name?: string; role?: "ADMIN" | "PRODUCT" },
  ): Promise<StaffMember> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff member");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, listStaff, updateStaff };
}

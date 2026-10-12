import { useCallback, useState } from "react";
import { apiFetch } from "./api";

export interface CustomerListItem {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CustomerListResult {
  data: CustomerListItem[];
  meta: { page: number; limit: number; total: number; pages: number };
}

export interface ListCustomersOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useCustomersApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listCustomers = useCallback(async (opts: ListCustomersOptions = {}): Promise<CustomerListResult> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.search) params.append("search", opts.search);
      if (opts.page)   params.append("page",   String(opts.page));
      if (opts.limit)  params.append("limit",  String(opts.limit));
      const qs = params.toString();
      return await apiFetch(`/admin/customers${qs ? `?${qs}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list customers");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** email: null clears it. Phone is not editable (it is the login identity). */
  const updateCustomer = useCallback(async (
    id: string,
    data: { name?: string; email?: string | null },
  ): Promise<CustomerListItem> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, listCustomers, updateCustomer };
}

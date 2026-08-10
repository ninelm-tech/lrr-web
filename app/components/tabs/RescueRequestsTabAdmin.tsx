import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, Flag, RefreshCcw, XCircle } from "lucide-react";
import { useRescueRequestApi, useOperatorApi } from "../../hooks";
import type { RescueRequestListItem, RescueRequestStatus, RescueRequestDetail } from "../../types";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "#fff3cd", text: "#856404" },
  OPERATOR_ASSIGNED: { bg: "#d1ecf1", text: "#0c5460" },
  IN_PROGRESS: { bg: "#cce5ff", text: "#004085" },
  ARRIVED: { bg: "#d4edda", text: "#155724" },
  COMPLETED: { bg: "#d4edda", text: "#155724" },
  CANCELLED: { bg: "#f8d7da", text: "#721c24" },
  STALLED: { bg: "#fff3cd", text: "#856404" },
  DISPATCHING: { bg: "#e2e3e5", text: "#383d41" },
};

interface AvailableOperator { id: string; businessName: string; phoneNumber: string; }

export default function RescueRequestsTab() {
  const {
    requests, loading, error, total, page, limit,
    fetchList, fetchDetail, assignOperator, updateStatus, cancelRequest: cancel,
  } = useRescueRequestApi();
  const { fetchAll: fetchAllOperators } = useOperatorApi();

  const [filters, setFilters] = useState({ status: "", issueType: "", search: "" });
  const [selectedRequest, setSelectedRequest] = useState<RescueRequestListItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<RescueRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [availableOperators, setAvailableOperators] = useState<AvailableOperator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const loadAvailableOperators = useCallback(async () => {
    try {
      const ops = await fetchAllOperators();
      setAvailableOperators(
        ops.filter(o => o.status === "ACTIVE").map(o => ({
          id: o.id, businessName: o.businessName, phoneNumber: o.phoneNumber,
        }))
      );
    } catch { /* silently ignore */ }
  }, [fetchAllOperators]);

  const openModal = useCallback((req: RescueRequestListItem) => {
    setSelectedRequest(req);
    setSelectedDetail(null);
    setSelectedOperatorId(req.assignedOperator?.id ?? "");
    setActionMsg(null);
    if (["DISPATCHING", "WAITING_FOR_DEPOSIT"].includes(req.status)) {
      loadAvailableOperators();
    }
    setDetailLoading(true);
    fetchDetail(req.id)
      .then(setSelectedDetail)
      .catch(() => { /* modal still works with list-item data if detail fetch fails */ })
      .finally(() => setDetailLoading(false));
  }, [loadAvailableOperators, fetchDetail]);

  const handleAssign = async () => {
    if (!selectedRequest || !selectedOperatorId) return;
    setActionLoading(true);
    try {
      await assignOperator(selectedRequest.id, selectedOperatorId);
      setActionMsg({ text: "Operator assigned and customer notified ✓", ok: true });
      setSelectedRequest(prev => prev ? { ...prev, status: "OPERATOR_ASSIGNED" as RescueRequestStatus } : null);
    } catch (e: unknown) {
      setActionMsg({ text: e instanceof Error ? e.message : "Failed to assign", ok: false });
    } finally { setActionLoading(false); }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await updateStatus(selectedRequest.id, status);
      setActionMsg({ text: `Status updated to ${status} ✓`, ok: true });
      setSelectedRequest(prev => prev ? { ...prev, status: status as RescueRequestStatus } : null);
    } catch (e: unknown) {
      setActionMsg({ text: e instanceof Error ? e.message : "Failed to update status", ok: false });
    } finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await cancel(selectedRequest.id, "Cancelled by admin");
      setActionMsg({ text: "Request cancelled and customer notified ✓", ok: true });
      setSelectedRequest(prev => prev ? { ...prev, status: "CANCELLED" as RescueRequestStatus } : null);
    } catch (e: unknown) {
      setActionMsg({ text: e instanceof Error ? e.message : "Failed to cancel", ok: false });
    } finally { setActionLoading(false); }
  };

  useEffect(() => {
    fetchList({ page: 1, limit: 20 });
  }, [fetchList]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchList({
      status: filters.status || undefined,
      issueType: filters.issueType || undefined,
      search: filters.search || undefined,
      page: 1,
      limit: 20,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (latitude: string, longitude: string) => {
    return `${latitude}, ${longitude}`;
  };

  const formatPhoneNumber = (phone: string) => {
    return phone;
  };

  if (loading && requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#003DB4" }}>Loading rescue requests...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters Section */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,61,180,0.08)",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.05rem", fontWeight: 600, color: "#333" }}>
          Filters
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 6, color: "#666" }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #dde8f8",
                borderRadius: 6,
                fontSize: "0.9rem",
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="OPERATOR_ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ARRIVED">Arrived</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="STALLED">Stalled</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 6, color: "#666" }}>
              Issue Type
            </label>
            <select
              value={filters.issueType}
              onChange={(e) => handleFilterChange("issueType", e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #dde8f8",
                borderRadius: 6,
                fontSize: "0.9rem",
              }}
            >
              <option value="">All Types</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="ACCIDENT">Accident</option>
              <option value="FUEL">Fuel</option>
              <option value="TYRE">Tyre</option>
              <option value="BATTERY">Battery</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: 6, color: "#666" }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Phone, operator name..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #dde8f8",
                borderRadius: 6,
                fontSize: "0.9rem",
              }}
            />
          </div>

          <button
            onClick={applyFilters}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#003DB4",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: 8,
            marginBottom: "1rem",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* Table Section */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,61,180,0.08)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F6FAFF", borderBottom: "2px solid #dde8f8" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Time
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Customer Phone
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Issue
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Status
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Deposit
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Balance
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Operator
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Location
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Last Updated
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request: RescueRequestListItem) => {
                const colors = STATUS_COLORS[request.status] || { bg: "#e2e3e5", text: "#383d41" };
                return (
                  <tr key={request.id} style={{ borderBottom: "1px solid #dde8f8" }}>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#333" }}>{formatTime(request.createdAt)}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#333" }}>
                        {formatPhoneNumber(request.customer.phoneNumber)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#333" }}>{request.issueType}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.4rem 0.8rem",
                          background: colors.bg,
                          color: colors.text,
                          borderRadius: 4,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.9rem", color: request.depositPaid ? "#155724" : "#721c24" }}>
                        {request.depositPaid ? "✓ Paid" : "✗ Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.9rem", color: request.balancePaid ? "#155724" : "#721c24" }}>
                        {request.balancePaid ? "✓ Paid" : "✗ Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#333" }}>
                        {request.assignedOperator?.businessName || "Unassigned"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        {formatLocation(request.latitude, request.longitude)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#666" }}>{formatTime(request.updatedAt)}</span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => openModal(request)}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "#003DB4",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
            <p>No rescue requests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.9rem", color: "#666" }}>
          Page {page} of {Math.ceil(total / limit)} ({total} total)
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            disabled={page === 1}
            onClick={() => fetchList({ page: page - 1, limit })}
            style={{
              padding: "0.6rem 1.2rem",
              background: page === 1 ? "#e0e0e0" : "#003DB4",
              color: page === 1 ? "#999" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => fetchList({ page: page + 1, limit })}
            style={{
              padding: "0.6rem 1.2rem",
              background: page >= Math.ceil(total / limit) ? "#e0e0e0" : "#003DB4",
              color: page >= Math.ceil(total / limit) ? "#999" : "#fff",
              border: "none",
              borderRadius: 6,
              cursor: page >= Math.ceil(total / limit) ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* ── Detail & Actions Modal ── */}
      {selectedRequest && (() => {
        const isActive = !["COMPLETED", "CANCELLED"].includes(selectedRequest.status);
        const canAssign = ["DISPATCHING", "WAITING_FOR_DEPOSIT", "OPERATOR_ASSIGNED"].includes(selectedRequest.status);
        const canMarkArrived = selectedRequest.status === "OPERATOR_ASSIGNED";
        const canMarkComplete = ["OPERATOR_ASSIGNED", "IN_PROGRESS", "ARRIVED"].includes(selectedRequest.status);
        const colors = STATUS_COLORS[selectedRequest.status] || { bg: "#e2e3e5", text: "#383d41" };
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
            onClick={() => { setSelectedRequest(null); setSelectedDetail(null); }}
          >
            <div
              style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px 0", color: "#003DB4", fontSize: "1.25rem" }}>Rescue Request</h2>
                  <code style={{ fontSize: "0.78rem", color: "#999" }}>{selectedRequest.id}</code>
                </div>
                <span style={{ padding: "0.35rem 0.9rem", background: colors.bg, color: colors.text, borderRadius: 20, fontSize: "0.82rem", fontWeight: 700 }}>
                  {selectedRequest.status}
                </span>
              </div>

              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1.5rem", marginBottom: "1.5rem", padding: "1.25rem", background: "#F6FAFF", borderRadius: 10, border: "1px solid #dde8f8" }}>
                {[
                  ["Issue", selectedRequest.issueType ?? "—"],
                  ["Vehicle", selectedDetail?.vehicleType ?? "—"],
                  ["Destination", selectedDetail?.destination ?? "—"],
                  ["Customer", formatPhoneNumber(selectedRequest.customer?.phoneNumber ?? "")],
                  ["Created", formatTime(selectedRequest.createdAt)],
                  ["Updated", formatTime(selectedRequest.updatedAt)],
                  ["Deposit", selectedRequest.depositPaid ? "✓ Paid" : "✗ Pending"],
                  ["Balance", selectedRequest.balancePaid ? "✓ Paid" : "✗ Pending"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#999", fontWeight: 600, textTransform: "uppercase" }}>{label}</p>
                    <p style={{ margin: "2px 0 0 0", fontWeight: 600, color: "#333", fontSize: "0.92rem" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Map link */}
              {selectedRequest.latitude && selectedRequest.longitude && (
                <a
                  href={`https://maps.google.com/?q=${selectedRequest.latitude},${selectedRequest.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.7rem 1rem", background: "#dde8f8", borderRadius: 8, fontSize: "0.9rem", fontWeight: 600, color: "#003DB4", textDecoration: "none", marginBottom: "1.5rem" }}
                >
                  📍 Open in Google Maps — {selectedRequest.latitude}, {selectedRequest.longitude}
                </a>
              )}

              {/* ── Media links ── */}
              {selectedDetail && selectedDetail.mediaLinks.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>Media</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {selectedDetail.mediaLinks.map((link, i) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer"
                        style={{ padding: "0.4rem 0.9rem", background: "#dde8f8", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, color: "#003DB4", textDecoration: "none" }}>
                        Photo {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Quotes (admin-only, read-only) ── */}
              {detailLoading && (
                <p style={{ color: "#999", fontSize: "0.88rem", marginBottom: "1.5rem" }}>Loading quotes…</p>
              )}
              {selectedDetail?.offers && selectedDetail.offers.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ margin: "0 0 0.75rem 0", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                    Quotes ({selectedDetail.offers.length})
                  </p>
                  <div style={{ border: "1px solid #dde8f8", borderRadius: 10, overflow: "hidden" }}>
                    {selectedDetail.offers.map((offer, i) => (
                      <div key={offer.operatorId + offer.offeredAt} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0.75rem 1rem", fontSize: "0.88rem",
                        borderTop: i === 0 ? "none" : "1px solid #f0f2f5",
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>{offer.businessName}</p>
                          <p style={{ margin: "2px 0 0 0", color: "#999", fontSize: "0.78rem" }}>
                            Offered {formatTime(offer.offeredAt)}
                            {offer.respondedAt ? ` · Responded ${formatTime(offer.respondedAt)}` : ""}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontWeight: 700, color: "#003DB4" }}>
                            {offer.quotedPrice ? `₦${(offer.quotedPrice / 100).toLocaleString()}` : "—"}
                          </p>
                          {offer.motoristFacingTotal && (
                            <p style={{ margin: "2px 0 0 0", color: "#999", fontSize: "0.78rem" }}>
                              ₦{(offer.motoristFacingTotal / 100).toLocaleString()} to motorist
                            </p>
                          )}
                          <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", fontWeight: 700, color: "#6c7890" }}>
                            {offer.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Manual Assign ── */}
              {canAssign && (
                <div style={{ marginBottom: "1.5rem", padding: "1.25rem", background: selectedRequest.assignedOperator ? "#f0fff4" : "#fff8e1", border: `1px solid ${selectedRequest.assignedOperator ? "#c8e6c9" : "#ffe082"}`, borderRadius: 10 }}>
                  <p style={{ margin: "0 0 0.75rem 0", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                    {selectedRequest.assignedOperator ? `✏️ Reassign operator` : `⚡ Manually assign operator`}
                  </p>
                  {selectedRequest.assignedOperator && (
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.88rem", color: "#555" }}>
                      Current: <strong>{selectedRequest.assignedOperator.businessName}</strong>
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10 }}>
                    <select
                      value={selectedOperatorId}
                      onChange={e => setSelectedOperatorId(e.target.value)}
                      style={{ flex: 1, padding: "0.6rem", border: "1px solid #dde8f8", borderRadius: 6, fontSize: "0.9rem" }}
                    >
                      <option value="">— Select operator —</option>
                      {availableOperators.map(op => (
                        <option key={op.id} value={op.id}>{op.businessName} ({op.phoneNumber})</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={!selectedOperatorId || actionLoading}
                      style={{ padding: "0.6rem 1.2rem", background: selectedOperatorId ? "#003DB4" : "#ccc", color: "#fff", border: "none", borderRadius: 6, cursor: selectedOperatorId ? "pointer" : "not-allowed", fontWeight: 700, fontSize: "0.9rem" }}
                    >
                      {actionLoading ? "…" : "Assign"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Status Actions ── */}
              {isActive && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ margin: "0 0 0.75rem 0", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>Actions</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {canMarkArrived && (
                      <button onClick={() => handleStatusUpdate("ARRIVED")} disabled={actionLoading}
                        style={{ padding: "0.55rem 1.1rem", background: "#28a745", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={14} /> Mark Arrived
                      </button>
                    )}
                    {canMarkComplete && (
                      <button onClick={() => handleStatusUpdate("COMPLETED")} disabled={actionLoading}
                        style={{ padding: "0.55rem 1.1rem", background: "#003DB4", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Flag size={14} /> Mark Complete
                      </button>
                    )}
                    {selectedRequest.status === "DISPATCHING" && (
                      <button onClick={() => handleStatusUpdate("IN_PROGRESS")} disabled={actionLoading}
                        style={{ padding: "0.55rem 1.1rem", background: "#6f42c1", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <RefreshCcw size={14} /> Force In-Progress
                      </button>
                    )}
                    <button onClick={handleCancel} disabled={actionLoading}
                      style={{ padding: "0.55rem 1.1rem", background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <XCircle size={14} /> Cancel Request
                    </button>
                  </div>
                </div>
              )}

              {/* Action result message */}
              {actionMsg && (
                <div style={{ padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1rem", background: actionMsg.ok ? "#d4edda" : "#f8d7da", color: actionMsg.ok ? "#155724" : "#721c24", fontWeight: 600, fontSize: "0.9rem" }}>
                  {actionMsg.text}
                </div>
              )}

              <button
                onClick={() => { setSelectedRequest(null); setSelectedDetail(null); }}
                style={{ padding: "0.6rem 1.5rem", background: "#dde8f8", color: "#003DB4", border: "1px solid #003DB4", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

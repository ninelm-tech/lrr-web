import { useEffect, useState } from "react";
import { useRescueRequestApi } from "../../hooks";
import type { UserRole, RescueRequestListItem, RescueRequestStatus } from "../../types";

interface RescueRequestsTabProps {
  role: UserRole | null;
}

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

export default function RescueRequestsTabOperator({ role }: RescueRequestsTabProps) {
  const { requests, loading, error, fetchList, total, page, limit } = useRescueRequestApi();
  const [filters, setFilters] = useState({
    status: "",
  });
  const [selectedRequest, setSelectedRequest] = useState<RescueRequestListItem | null>(null);

  useEffect(() => {
    fetchList({ page: 1, limit: 20 });
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchList({
      status: filters.status || undefined,
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
            gridTemplateColumns: "1fr 1fr",
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
              <option value="OPERATOR_ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ARRIVED">Arrived</option>
              <option value="COMPLETED">Completed</option>
            </select>
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
                  Status
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Location
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Customer Phone
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: 600, fontSize: "0.9rem", color: "#666" }}>
                  Payment
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
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        {formatLocation(request.latitude, request.longitude)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#333" }}>
                        {formatPhoneNumber(request.customer.phoneNumber)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: request.balancePaid ? "#155724" : "#721c24",
                        }}
                      >
                        {request.balancePaid ? "✓ Paid" : "⏳ Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <button
                        onClick={() => setSelectedRequest(request)}
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
            <p>No rescue requests assigned to you</p>
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

      {/* Detail View Placeholder */}
      {selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "2rem",
              maxWidth: 600,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 1rem 0", color: "#003DB4" }}>Request Details</h2>
            <div style={{ color: "#333", lineHeight: 1.8 }}>
              <p>
                <strong>ID:</strong> {selectedRequest.id}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequest.status}
              </p>
              <p>
                <strong>Issue Type:</strong> {selectedRequest.issueType}
              </p>
              <p>
                <strong>Customer Phone:</strong> {formatPhoneNumber(selectedRequest.customer.phoneNumber)}
              </p>
              <p>
                <strong>Location:</strong> {formatLocation(selectedRequest.latitude, selectedRequest.longitude)}
              </p>
              <p>
                <strong>Deposit Paid:</strong> {selectedRequest.depositPaid ? "Yes" : "No"}
              </p>
              <p>
                <strong>Balance Paid:</strong> {selectedRequest.balancePaid ? "Yes" : "No"}
              </p>
              <p>
                <strong>Created:</strong> {formatTime(selectedRequest.createdAt)}
              </p>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              style={{
                marginTop: "1.5rem",
                padding: "0.6rem 1.5rem",
                background: "#dde8f8",
                color: "#003DB4",
                border: "1px solid #003DB4",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

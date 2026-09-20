"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRatingApi } from "../../hooks";

const dm = "var(--font-dm-sans), sans-serif";
const navy = "#07152f";
const blue = "#003DB4";

export default function FeedbackPage() {
  const params = useParams();
  const ratingId = String(params.ratingId);
  const { rating, loading, error, fetchRating, submitComment } = useRatingApi();

  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchRating(ratingId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitComment(ratingId, comment);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F6FAFF", fontFamily: dm, padding: "1.5rem",
    }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        {loading && !rating ? (
          <p style={{ color: "#999" }}>Loading…</p>
        ) : error && !rating ? (
          <p style={{ color: "#dc2626" }}>This feedback link isn&apos;t valid.</p>
        ) : rating ? (
          <>
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: navy }}>
              Thanks for rating {rating.ratedName}
            </h1>
            <p style={{ margin: "0 0 1.5rem 0", color: "#6c7890", fontSize: "0.9rem" }}>
              You gave {rating.score}/5. Want to tell us more?
            </p>
            {rating.comment ? (
              <p style={{ color: "#19a56b", fontWeight: 600 }}>Feedback already received for this rating — thank you!</p>
            ) : submitted ? (
              <p style={{ color: "#19a56b", fontWeight: 600 }}>Thank you — your feedback has been recorded.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about your experience (optional)"
                  rows={5}
                  style={{ width: "100%", padding: "0.75rem", border: "1.5px solid #dde8f8", borderRadius: 8, fontFamily: dm, fontSize: "0.9rem", boxSizing: "border-box", marginBottom: "1rem" }}
                />
                {submitError && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{submitError}</p>}
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  style={{ padding: "0.75rem 1.5rem", background: blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {submitting ? "Submitting…" : "Submit feedback"}
                </button>
              </form>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

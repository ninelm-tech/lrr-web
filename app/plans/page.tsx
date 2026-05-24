"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSubscription } from "../hooks/useSubscription";
import type { SubscriptionPlan } from "../types";

const PLAN_ICONS: Record<string, string> = {
  INDIVIDUAL_MONTHLY:  "🚗",
  INDIVIDUAL_ANNUAL:   "⭐",
  COMMERCIAL_MONTHLY:  "🏢",
};

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  INDIVIDUAL_MONTHLY:  ["2 free tows per month", "Skip the deposit queue", "Priority dispatch", "Cancel anytime"],
  INDIVIDUAL_ANNUAL:   ["2 free tows per month", "Save vs monthly", "Skip the deposit queue", "Priority dispatch"],
  COMMERCIAL_MONTHLY:  ["5 free tows per month", "Fleet coverage", "Dedicated support line", "Priority dispatch"],
};

function fmt(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const { plans, loading, error, fetchPlans, subscribe } = useSubscription();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchPlans();
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    }
  }, []);

  async function handleSubscribe(planKey: string) {
    if (!isLoggedIn) {
      router.push(`/register/customer?next=plans`);
      return;
    }
    setSubscribing(planKey);
    try {
      const url = await subscribe(planKey);
      if (url) {
        window.location.href = url; // redirect to Paystack checkout
      }
    } finally {
      setSubscribing(null);
    }
  }

  // Fallback static plans if API hasn't loaded yet
  const displayPlans: SubscriptionPlan[] = plans.length > 0 ? plans : [
    { key: "INDIVIDUAL_MONTHLY",  name: "Individual Monthly",  amountKobo: 300000,   interval: "monthly",   intervalCount: 1, towsPerMonth: 2 },
    { key: "INDIVIDUAL_ANNUAL",   name: "Individual Annual",   amountKobo: 3000000,  interval: "annually",  intervalCount: 1, towsPerMonth: 2 },
    { key: "COMMERCIAL_MONTHLY",  name: "Commercial Monthly",  amountKobo: 1500000,  interval: "monthly",   intervalCount: 1, towsPerMonth: 5 },
  ];

  const intervalLabel = (p: SubscriptionPlan) =>
    p.interval === "annually" ? "/ year" : "/ month";

  const savingsBadge = (p: SubscriptionPlan) => {
    if (p.interval === "annually") return "Save 17%";
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f8ff 0%, #f8fbff 100%)", padding: "0 1rem 4rem" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", paddingTop: "3rem", textAlign: "center" }}>
        {isWelcome && (
          <div style={{
            display: "inline-block", background: "#d4edda", color: "#155724",
            border: "1px solid #c3e6cb", borderRadius: 8,
            padding: "0.6rem 1.2rem", fontSize: "0.95rem", fontWeight: 600, marginBottom: "1.5rem",
          }}>
            ✅ Account created! Choose a plan to unlock your tow coverage.
          </div>
        )}

        <h1 style={{ fontSize: "2.6rem", fontWeight: 800, color: "#0070f3", margin: "0 0 0.5rem 0", letterSpacing: "-1px" }}>
          Simple, Honest Pricing
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#666", margin: "0 0 0.5rem 0", maxWidth: 520, marginInline: "auto" }}>
          Subscribe once, never pay a deposit again. Your tow is covered — just send SOS on WhatsApp.
        </p>
        <p style={{ fontSize: "0.95rem", color: "#999", marginBottom: "2.5rem" }}>
          Non-subscribers pay a ₦5,000 deposit per rescue call.
        </p>

        {error && (
          <div style={{ background: "#fff3cd", color: "#856404", border: "1px solid #ffc107", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ⚠️ Using estimated pricing — live plans unavailable right now.
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          {displayPlans.map((plan) => {
            const isPopular = plan.key === "INDIVIDUAL_ANNUAL";
            const savings = savingsBadge(plan);
            const highlights = PLAN_HIGHLIGHTS[plan.key] ?? [`${plan.towsPerMonth} free tows per month`, "Priority dispatch", "Skip deposit queue"];
            const icon = PLAN_ICONS[plan.key] ?? "🚗";

            return (
              <div
                key={plan.key}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "2rem",
                  border: isPopular ? "2.5px solid #0070f3" : "1.5px solid #e0f3ff",
                  boxShadow: isPopular ? "0 8px 32px rgba(0,112,243,0.18)" : "0 2px 12px rgba(0,112,243,0.07)",
                  position: "relative",
                  textAlign: "left",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,112,243,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = isPopular ? "0 8px 32px rgba(0,112,243,0.18)" : "0 2px 12px rgba(0,112,243,0.07)";
                }}
              >
                {/* Popular / savings badge */}
                {isPopular && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(90deg,#0070f3,#00c6ff)",
                    color: "#fff", borderRadius: 20, padding: "0.3rem 1rem",
                    fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    MOST POPULAR
                  </div>
                )}
                {savings && !isPopular && (
                  <div style={{
                    position: "absolute", top: -12, right: 20,
                    background: "#d4edda", color: "#155724",
                    borderRadius: 20, padding: "0.25rem 0.8rem",
                    fontSize: "0.78rem", fontWeight: 700,
                  }}>
                    {savings}
                  </div>
                )}

                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{icon}</div>

                <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.25rem", fontWeight: 700, color: "#333" }}>
                  {plan.name}
                </h2>

                <div style={{ margin: "1rem 0 1.5rem 0" }}>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, color: "#0070f3" }}>
                    {fmt(plan.amountKobo)}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#999", marginLeft: 4 }}>
                    {intervalLabel(plan)}
                  </span>
                  {plan.interval === "annually" && (
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#27ae60" }}>
                      = {fmt(Math.round(plan.amountKobo / 12))} / month
                    </p>
                  )}
                </div>

                <ul style={{ margin: "0 0 1.5rem 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {highlights.map((h) => (
                    <li key={h} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem", color: "#444" }}>
                      <span style={{ color: "#0070f3", fontWeight: 700, fontSize: "1rem" }}>✓</span>
                      {h}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={subscribing === plan.key}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: subscribing === plan.key ? "#ccc"
                      : isPopular ? "linear-gradient(90deg,#0070f3,#00c6ff)"
                      : "#f0f8ff",
                    color: isPopular ? "#fff" : "#0070f3",
                    border: isPopular ? "none" : "2px solid #0070f3",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: subscribing === plan.key ? "wait" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {subscribing === plan.key ? "Opening checkout…" : isLoggedIn ? "Subscribe Now" : "Get Started"}
                </button>
              </div>
            );
          })}
        </div>

        {/* No-subscription note */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "1.5rem 2rem",
          border: "1px solid #e0f3ff", maxWidth: 600, marginInline: "auto",
          textAlign: "left", boxShadow: "0 2px 8px rgba(0,112,243,0.06)",
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#333", fontSize: "1.05rem" }}>Pay per rescue</h3>
          <p style={{ margin: 0, color: "#666", fontSize: "0.92rem", lineHeight: 1.6 }}>
            No subscription required. Just send SOS on WhatsApp and pay a ₦5,000 deposit to confirm dispatch,
            then ₦45,000 balance on completion. Total: ₦50,000 per rescue.
          </p>
        </div>

        {/* FAQ / reassurance */}
        <div style={{ marginTop: "2.5rem", color: "#999", fontSize: "0.88rem", lineHeight: 1.8 }}>
          <p>Payments processed securely via Paystack · Subscriptions renew automatically · Cancel anytime</p>
          {!isLoggedIn && (
            <p>
              Already subscribed?{" "}
              <a href="/login" style={{ color: "#0070f3", fontWeight: 600, textDecoration: "none" }}>Sign in</a>{" "}
              to view your plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "4rem", color: "#0070f3" }}>Loading plans…</div>}>
      <PlansContent />
    </Suspense>
  );
}

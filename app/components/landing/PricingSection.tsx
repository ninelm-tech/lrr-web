"use client";
import Link from "next/link";
import { useAuthState, dashboardPath } from "../../hooks";

const perks = ["Unlimited dispatch access", "Priority support response", "Member-only roadside rates"];

const included = [
  { label: "Emergency dispatch",    value: "Included" },
  { label: "Member support",        value: "24/7" },
  { label: "Digital service history", value: "Included" },
];

export default function PricingSection() {
  const { isLoggedIn, role } = useAuthState();
  const membershipHref = isLoggedIn ? dashboardPath(role) : "/register/customer";

  return (
    <section id="pricing" className="py-20 sm:py-28" style={{ background: "#f6f9fc" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-10 items-center">

        {/* Left copy */}
        <div style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
          <p
            className="text-xs uppercase tracking-[0.22em] font-semibold"
            style={{ color: "#003DB4", letterSpacing: "0.12rem" }}
          >
            Membership
          </p>
          <h2
            className="mt-4 leading-tight"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 2.6rem)",
              color: "#0b1736",
            }}
          >
            One plan. Year-round peace of mind.
          </h2>
          <p className="mt-4 leading-7 max-w-xl" style={{ color: "#6c7890" }}>
            A simple annual membership that keeps you covered whenever the unexpected happens on the road.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ color: "#0b1736" }}>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing card */}
        <article
          className="bg-white border border-slate-200 rounded-[28px] p-7 sm:p-8 shadow-sm"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm" style={{ color: "#6c7890" }}>LRR Annual Membership</p>
              <div className="mt-4 flex items-end gap-2">
                <span
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontWeight: 700,
                    fontSize: "2.75rem",
                    color: "#0b1736",
                    lineHeight: 1,
                  }}
                >
                  ₦50,000
                </span>
                <span className="pb-1" style={{ color: "#6c7890" }}>/ year</span>
              </div>
            </div>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "#eef5ff", color: "#003DB4" }}
            >
              Most popular
            </span>
          </div>

          <div className="h-px bg-slate-200 my-7" />

          <div className="space-y-4 text-sm" style={{ color: "#6c7890" }}>
            {included.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span>{label}</span>
                <span className="font-semibold" style={{ color: "#0b1736" }}>{value}</span>
              </div>
            ))}
          </div>

          <Link
            href={membershipHref}
            className="block w-full mt-8 text-white py-4 rounded-xl font-semibold text-center transition hover:opacity-90"
            style={{ background: "#003DB4" }}
          >
            Join Membership
          </Link>
        </article>

      </div>
    </section>
  );
}

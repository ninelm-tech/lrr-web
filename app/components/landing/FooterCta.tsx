"use client";
import Link from "next/link";
import { useAuthState, dashboardPath } from "../../hooks";

export default function FooterCta() {
  const { isLoggedIn, role } = useAuthState();

  return (
    <>
      {/* CTA band */}
      <section className="py-12" style={{ background: "#07152f" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h2
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                color: "#fff",
              }}
            >
              Drive with confidence.
            </h2>
            <p className="mt-2" style={{ color: "rgba(219,232,255,0.8)", fontFamily: "var(--font-dm-sans), sans-serif" }}>
              Join Lagos Roadside Rescue today and stay covered wherever the road takes you.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {isLoggedIn ? (
              <Link
                href={dashboardPath(role)}
                className="px-5 py-3 rounded-xl font-semibold transition hover:bg-blue-50"
                style={{ background: "#fff", color: "#07152f", fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/register/customer"
                  className="px-5 py-3 rounded-xl font-semibold transition hover:bg-blue-50"
                  style={{ background: "#fff", color: "#07152f", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Join Membership
                </Link>
                <Link
                  href="/login"
                  className="border border-white/20 px-5 py-3 rounded-xl font-semibold transition hover:bg-white/10"
                  style={{ color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{ background: "#000f26", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img
          src="/lrr-logo-white.png"
          alt="LRR"
          className="h-8 mx-auto mb-4 object-contain"
          style={{ opacity: 0.6 }}
        />
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.85rem", fontFamily: "var(--font-dm-sans), sans-serif" }}>
          © {new Date().getFullYear()} LRR — Lagos Roadside Rescue. A Ninelm product.
        </p>
      </footer>
    </>
  );
}

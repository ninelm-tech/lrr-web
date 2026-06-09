"use client";
import Link from "next/link";
import { useState } from "react";
import LoginModal from "../LoginModal";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

// Lekki-Ikoyi Link Bridge, Lagos — photo by Opeyemi Adisa on Unsplash (free)
const heroImageSrc =
  "https://images.unsplash.com/photo-1648023200201-8fcede127835?fm=jpg&q=80&w=1800&auto=format&fit=crop";

const steps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z" />
      </svg>
    ),
    label: "You reach out",
    color: "#25D366",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 8h4l3 4v4h-7V8z" />
      </svg>
    ),
    label: "We dispatch",
    color: "#003DB4",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: "Operator en route",
    color: "#003DB4",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Help arrives",
    color: "#19a56b",
    done: true,
  },
];

interface HeroProps {
  autoLogin?: boolean;
  next?: string;
}

export default function HeroSection({ autoLogin = false, next = "" }: HeroProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen]       = useState(autoLogin);

  // If already logged in, "Join Membership" goes to dashboard, not registration
  const membershipHref =
    typeof window !== "undefined" && localStorage.getItem("accessToken")
      ? "/customer"
      : "/register/customer";

  return (
    <section className="relative overflow-hidden text-white">
      {/* Full-bleed background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImageSrc}
        alt="Lagos Lekki-Ikoyi bridge at night"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(5,14,40,0.92) 0%, rgba(5,14,40,0.80) 50%, rgba(5,14,40,0.55) 100%)",
        }}
      />

      {/* ── NAV ────────────────────────────────────── */}
      <header className="relative z-20">
        <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Go to homepage">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lrr-logo-white.png"
              alt="Lagos Roadside Rescue"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          <div
            className="hidden lg:flex items-center gap-8 text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a href="#pricing"      className="hover:text-white transition">Membership</a>
            <a href="#operators"    className="hover:text-white transition">For operators</a>
            <a href="#faq"          className="hover:text-white transition">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoginOpen(true)}
              className="inline-flex text-sm font-medium transition hover:text-white"
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Login
            </button>
            {/* Register dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegisterOpen(o => !o)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ background: "#003DB4", color: "#fff" }}
              >
                Register
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5" style={{ transition: "transform .2s", transform: registerOpen ? "rotate(180deg)" : "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {registerOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRegisterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#fff", border: "1px solid #e2e8f0", minWidth: 200 }}>
                    <Link
                      href="/register/customer"
                      onClick={() => setRegisterOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-blue-50"
                      style={{ color: "#0b1736", borderBottom: "1px solid #f0f2f5" }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#eef5ff" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#003DB4" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold" style={{ color: "#0b1736" }}>As a Customer</p>
                        <p className="text-xs" style={{ color: "#6c7890" }}>Get roadside coverage</p>
                      </div>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setRegisterOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-blue-50"
                      style={{ color: "#0b1736" }}
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#07152f" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2} className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 8h4l3 4v4h-7V8z" />
                        </svg>
                      </span>
                      <div>
                        <p className="font-semibold" style={{ color: "#0b1736" }}>As an Operator</p>
                        <p className="text-xs" style={{ color: "#6c7890" }}>Join the dispatch network</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ── HERO BODY ────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-14 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_auto_auto] gap-8 lg:gap-12 items-center pt-8 lg:pt-10">

          {/* LEFT — copy */}
          <div style={{ animation: "fadeUp .7s ease both" }}>
            <div
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] rounded-full px-4 py-2 mb-8"
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(219,232,255,0.9)",
                fontWeight: 600,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              Reliable help, right when you need it
            </div>

            <h1
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 700,
                fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                lineHeight: 1.12,
                color: "#fff",
              }}
            >
              Roadside rescue,<br />
              reimagined for{" "}
              <span style={{ color: "#4d8bff" }}>Lagos.</span>
            </h1>

            <p
              className="mt-7 max-w-md leading-8"
              style={{ color: "rgba(219,232,255,0.78)", fontSize: "1.05rem", animation: "fadeUp .7s .1s ease both" }}
            >
              Get fast, verified roadside assistance from a trusted
              network of operators — dispatched in minutes, tracked in real time.
            </p>

            {/* WhatsApp SOS strip */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=SOS`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 transition hover:opacity-90"
              style={{
                background: "rgba(37,211,102,0.12)",
                border: "1px solid rgba(37,211,102,0.3)",
                textDecoration: "none",
                animation: "fadeUp .7s .18s ease both",
                display: "inline-flex",
              }}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#25D366" }}
              >
                <svg viewBox="0 0 24 24" fill="white" width={18} height={18}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z"/>
                </svg>
              </span>
              <div>
                <p className="font-bold text-sm" style={{ color: "#fff", margin: 0, lineHeight: 1.2 }}>
                  Stranded? Send <span style={{ color: "#4eff91", fontFamily: "monospace", fontSize: "1rem" }}>"SOS"</span> on WhatsApp
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(219,232,255,0.65)", margin: 0 }}>
                  +234 800 000 0000 · No app download needed
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} width={16} height={16} className="ml-1 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            <div
              className="mt-10 flex flex-col sm:flex-row gap-3"
              style={{ animation: "fadeUp .7s .2s ease both" }}
            >
              <Link
                href={membershipHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition hover:opacity-90"
                style={{ background: "#003DB4", color: "#fff" }}
              >
                Join Membership
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
              >
                Register as Operator
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="mt-10 flex flex-wrap gap-6 text-sm"
              style={{ color: "rgba(219,232,255,0.75)", animation: "fadeUp .7s .3s ease both" }}
            >
              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                  label: "Verified operators",
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: "24/7 coverage",
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
                  label: "Live tracking",
                },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-2">
                  {icon}
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* CENTER — dispatch flow card */}
          <div
            className="hidden lg:flex flex-col gap-0 rounded-2xl overflow-hidden self-center"
            style={{
              background: "rgba(8,20,55,0.72)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              minWidth: 200,
              animation: "fadeUp .7s .15s ease both",
            }}
          >
            {steps.map(({ icon, label, color, done }, i) => (
              <div key={label}>
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ opacity: done ? 1 : 0.9 }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color}22`, color }}
                  >
                    {icon}
                  </span>
                  <span className="text-sm font-medium" style={{ color: done ? "#fff" : "rgba(219,232,255,0.85)" }}>
                    {label}
                  </span>
                  {done && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#19a56b" strokeWidth={2.5} className="w-4 h-4 ml-auto shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className="ml-9 border-l border-dashed border-white/15 h-4" />
                )}
              </div>
            ))}
          </div>

          {/* RIGHT — phone mockup */}
          <div
            className="hidden lg:block self-end"
            style={{ animation: "fadeUp .7s .2s ease both" }}
          >
            <div
              className="relative rounded-[36px] overflow-hidden shadow-2xl"
              style={{
                width: 210,
                height: 380,
                background: "#0b1736",
                border: "8px solid rgba(255,255,255,0.12)",
              }}
            >
              {/* Status bar */}
              <div className="flex justify-between items-center px-4 pt-3 pb-1 text-white" style={{ fontSize: 9 }}>
                <span>9:41</span>
                <div className="flex gap-1 items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M20 10v4a2 2 0 000-4z"/></svg>
                </div>
              </div>

              {/* Map area */}
              <div className="mx-2 rounded-xl overflow-hidden" style={{ height: 180, background: "#1a2f5e", position: "relative" }}>
                <svg width="100%" height="100%" style={{ opacity: 0.4 }}>
                  {[0,1,2,3,4,5].map(i => <line key={`h${i}`} x1="0" y1={i*36} x2="300" y2={i*36} stroke="#4d8bff" strokeWidth="0.5"/>)}
                  {[0,1,2,3,4,5,6].map(i => <line key={`v${i}`} x1={i*36} y1="0" x2={i*36} y2="200" stroke="#4d8bff" strokeWidth="0.5"/>)}
                  <polyline points="30,160 50,130 80,110 110,80 140,55" stroke="#003DB4" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 3"/>
                  <circle cx="30" cy="160" r="5" fill="#003DB4"/>
                  <circle cx="140" cy="55" r="5" fill="#19a56b"/>
                </svg>
                <div
                  className="absolute top-3 right-3 rounded-lg px-2 py-1 text-white"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", fontSize: 9 }}
                >
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>Help requested</div>
                  <div style={{ fontWeight: 600 }}>Victoria Island, Lagos</div>
                </div>
                <div
                  className="absolute bottom-3 left-3 rounded-lg px-2 py-1 text-white"
                  style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", fontSize: 9 }}
                >
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>Operator on the way</div>
                  <div style={{ fontWeight: 600 }}>ETA 12 mins</div>
                </div>
              </div>

              {/* Live dispatch card */}
              <div className="mx-2 mt-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: "rgba(219,232,255,0.55)", fontSize: 9 }}>Live Dispatch</span>
                  <span style={{ color: "rgba(219,232,255,0.4)", fontSize: 9 }}>×</span>
                </div>
                <p className="font-semibold text-white" style={{ fontSize: 13 }}>Operator en route</p>
                <div className="flex items-center justify-between mt-2">
                  <span style={{ color: "rgba(219,232,255,0.6)", fontSize: 10 }}>ETA</span>
                  <span style={{ color: "#4d8bff", fontWeight: 700, fontSize: 11 }}>12 mins</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <div className="h-full rounded-full" style={{ width: "65%", background: "#003DB4" }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} next={next || undefined} />

      {/* Floating WhatsApp SOS button — visible throughout the page */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=SOS`}
        target="_blank"
        rel="noreferrer"
        aria-label="Send SOS on WhatsApp"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          display: "flex", alignItems: "center", gap: 10,
          background: "#25D366", color: "#fff",
          borderRadius: 50, padding: "0.75rem 1.2rem",
          textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
          boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
          fontFamily: "var(--font-dm-sans), sans-serif",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; }}
      >
        <svg viewBox="0 0 24 24" fill="white" width={20} height={20}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z"/>
        </svg>
        <span>SOS — Send Help</span>
      </a>
    </section>
  );
}

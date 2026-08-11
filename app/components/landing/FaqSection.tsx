"use client";
import { useState } from "react";

const faqs = [
  {
    q: "How much does it cost?",
    a: "There's no subscription or membership fee. You only pay per rescue — operators quote you a price for the job, and you pay a small deposit to confirm plus the balance once you're helped.",
  },
  {
    q: "How quickly can help arrive?",
    a: "Response times vary by location and traffic, but our network is designed to match you with the nearest qualified operator as quickly as possible — typically within 12 minutes.",
  },
  {
    q: "Can operators join the network?",
    a: "Yes. We partner with vetted operators who meet our service, safety, and reliability standards. Register your business to apply.",
  },
  {
    q: "Do I need an app to use LRR?",
    a: "No app required. You can request help directly via WhatsApp — just send a message to our number and we handle everything from there.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28" style={{ background: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center">
          <p
            className="text-xs uppercase tracking-[0.22em] font-semibold"
            style={{ color: "#003DB4", letterSpacing: "0.12rem" }}
          >
            FAQ
          </p>
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: "#0b1736",
            }}
          >
            Questions, answered.
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map(({ q, a }, i) => (
            <div key={q} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
              <button
                className="w-full flex justify-between items-center text-left p-5 gap-4"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span
                  className="font-medium"
                  style={{ color: "#0b1736", fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  {q}
                </span>
                <svg
                  className="w-5 h-5 shrink-0 text-slate-400 transition-transform"
                  style={{ transform: open === i ? "rotate(45deg)" : "rotate(0)" }}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p
                    className="leading-7 text-[15px]"
                    style={{ color: "#6c7890", fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    {a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

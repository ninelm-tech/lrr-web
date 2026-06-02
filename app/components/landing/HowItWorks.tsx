const steps = [
  {
    num: "01",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
      </svg>
    ),
    title: "Request assistance",
    copy: "Tell us what happened and share your current location in just a few taps.",
  },
  {
    num: "02",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      </svg>
    ),
    title: "We dispatch the right operator",
    copy: "Our system matches you with a verified nearby operator based on your need.",
  },
  {
    num: "03",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
      </svg>
    ),
    title: "Track help in real time",
    copy: "Follow your operator's route, ETA, and updates from dispatch to resolution.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <p
            className="text-xs uppercase tracking-[0.22em] font-semibold"
            style={{ color: "#003DB4", letterSpacing: "0.12rem" }}
          >
            How it works
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
            Help is three simple steps away.
          </h2>
          <p className="mt-4 leading-7" style={{ color: "#6c7890" }}>
            Built for speed, clarity, and peace of mind from the moment you need help.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {steps.map(({ num, icon, title, copy }) => (
            <article
              key={num}
              className="rounded-2xl border border-slate-200 p-6 bg-white"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
                {icon}
              </div>
              <p className="text-xs text-slate-400 font-semibold">{num}</p>
              <h3 className="mt-3 font-semibold text-lg" style={{ color: "#0b1736" }}>{title}</h3>
              <p className="mt-3 leading-7 text-[15px]" style={{ color: "#6c7890" }}>{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

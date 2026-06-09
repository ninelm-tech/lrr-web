const steps = [
  {
    num: "01",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.854L0 24l6.324-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.213-3.728.889.923-3.636-.234-.374A9.818 9.818 0 1112 21.818z"/>
      </svg>
    ),
    title: 'Send "SOS" on WhatsApp',
    copy: `WhatsApp "SOS" to ${process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "our number"}. Share your location and we handle everything from there — no app needed.`,
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
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                style={num === "01"
                  ? { background: "#e8faf0", color: "#25D366" }
                  : { background: "#eff6ff", color: "#1d4ed8" }}
              >
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

import Link from "next/link";

const cards = [
  {
    img: "/dispatch-operator.png",
    alt: "Operator receiving a roadside assistance request on their device",
    title: "Smarter dispatch",
    copy: "Receive the right jobs, faster, with clear locations and request context.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    img: "/operational-visibility.png",
    alt: "Operator viewing live operational data on their device",
    title: "Live operational visibility",
    copy: "Track requests, driver locations, and progress in one connected workspace.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    img: "/reliable-earnings.png",
    alt: "Operator receiving payment on their phone after completing a job",
    title: "Reliable earnings",
    copy: "Spend less time chasing work and more time completing trusted jobs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function OperatorsSection() {
  return (
    <section id="operators" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Header row */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center mb-10">
          <div className="max-w-xl">
            <p
              className="text-xs uppercase tracking-[0.22em] font-semibold mb-3"
              style={{ color: "#003DB4" }}
            >
              For operators
            </p>
            <h2
              className="leading-tight"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontWeight: 700,
                fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)",
                color: "#0b1736",
              }}
            >
              Built to help operators<br />do their best work.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8">
            <p
              className="max-w-xs leading-7 text-sm"
              style={{ color: "#6c7890", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Smarter dispatch, clearer jobs, and the tools to operate with confidence at scale.
            </p>
            <Link
              href="/register"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition hover:opacity-90"
              style={{ background: "#003DB4", color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Become an Operator
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(({ img, alt, title, copy, icon }) => (
            <article
              key={title}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={alt}
                className="w-full object-cover"
                style={{ height: "clamp(160px, 20vw, 220px)" }}
                loading="lazy"
              />
              <div className="p-5 flex items-start gap-4">
                <span
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#003DB4", color: "#fff" }}
                >
                  {icon}
                </span>
                <div>
                  <h3 className="font-semibold text-base" style={{ color: "#0b1736" }}>{title}</h3>
                  <p className="mt-1 leading-6 text-sm" style={{ color: "#6c7890" }}>{copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

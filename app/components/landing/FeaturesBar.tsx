const features = [
  { title: "WhatsApp only",    description: "No app to install — just message us" },
  { title: "Upfront quotes",   description: "See the price before you confirm" },
  { title: "Vetted operators", description: "Every operator is verified before going live" },
  { title: "Pay per job",      description: "No subscriptions or membership fees" },
];

export default function FeaturesBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map(({ title, description }) => (
          <div key={title}>
            <p className="text-2xl font-bold" style={{ color: "#0b1736", fontFamily: "var(--font-dm-sans), sans-serif" }}>
              {title}
            </p>
            <p className="text-sm mt-1" style={{ color: "#6c7890" }}>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

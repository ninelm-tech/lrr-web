const stats = [
  { value: "12 min", label: "Average response time" },
  { value: "24/7",   label: "Always-on dispatch" },
  { value: "150+",   label: "Verified operators" },
  { value: "98%",    label: "Successful resolutions" },
];

export default function StatsBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-2xl font-bold" style={{ color: "#0b1736", fontFamily: "var(--font-dm-sans), sans-serif" }}>
              {value}
            </p>
            <p className="text-sm mt-1" style={{ color: "#6c7890" }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

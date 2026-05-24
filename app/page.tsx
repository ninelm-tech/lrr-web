
export default function Home() {
  return (
    <main>
      <section className="landing-hero">
        <h1>LRR: Roadside Rescue, Reimagined</h1>
        <p>
          Fast, reliable, and professional roadside assistance across Lagos.
          Subscribe for peace of mind — or pay per rescue. Help is always one WhatsApp message away.
        </p>
        <div className="cta-buttons">
          <a href="/register/customer" style={{ background: "linear-gradient(90deg,#0070f3,#00c6ff)", color: "#fff", fontWeight: 700 }}>
            Get Covered →
          </a>
          <a href="/plans">View Plans</a>
        </div>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.75 }}>
          Already a member? <a href="/login" style={{ textDecoration: "underline" }}>Sign in</a>
          {" · "}
          <a href="/register" style={{ textDecoration: "underline" }}>Register as an operator</a>
        </p>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <h3>🚨 Instant Dispatch</h3>
          <p>Send SOS on WhatsApp and we'll match you with the nearest verified tow operator in seconds.</p>
        </div>
        <div className="landing-feature">
          <h3>💳 Subscriber Benefits</h3>
          <p>Subscribe from ₦3,000/month and skip the deposit entirely. Your tow is covered — no hassle.</p>
        </div>
        <div className="landing-feature">
          <h3>✅ Verified Operators</h3>
          <p>All operators are vetted, rated by response speed and reliability before joining the network.</p>
        </div>
      </section>

      <section style={{ textAlign: "center", padding: "3rem 1rem", background: "#f8fbff" }}>
        <h2 style={{ color: "#0070f3", fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          How it works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: 800, margin: "1.5rem auto 0" }}>
          {[
            { n: "1", title: "Send SOS",       desc: "WhatsApp our number — no app needed" },
            { n: "2", title: "Share location", desc: "Drop your location pin in the chat" },
            { n: "3", title: "Get rescued",    desc: "Nearest operator is dispatched in minutes" },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", border: "1px solid #e0f3ff", boxShadow: "0 2px 8px rgba(0,112,243,0.07)" }}>
              <div style={{ width: 36, height: 36, background: "#e0f3ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0070f3", margin: "0 auto 0.75rem" }}>{n}</div>
              <h4 style={{ margin: "0 0 0.4rem 0", color: "#333" }}>{title}</h4>
              <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>{desc}</p>
            </div>
          ))}
        </div>
        <a href="/register/customer" style={{ display: "inline-block", marginTop: "2rem", padding: "0.85rem 2rem", background: "linear-gradient(90deg,#0070f3,#00c6ff)", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: "1rem", textDecoration: "none", boxShadow: "0 2px 12px rgba(0,112,243,0.2)" }}>
          Create Free Account →
        </a>
      </section>
    </main>
  );
}

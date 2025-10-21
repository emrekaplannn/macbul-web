export default function Stats() {
  const stats = [
    { v: "5000+", t: "Aktif Kullanıcı" },
    { v: "1200+", t: "Tamamlanan Maç" },
    { v: "50+", t: "Halı Saha" },
    { v: "4.8/5", t: "Kullanıcı Puanı" },
  ];
  return (
    <section className="mb-stats">
      <div className="mb-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="mb-stat">
            <h3>{s.v}</h3>
            <p>{s.t}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

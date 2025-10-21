export default function Features() {
  const items = [
    { icon: "📍", title: "Yakınındaki Maçlar", text: "Konumuna göre en yakın açık maçları görüntüle, harita üzerinden sahaları keşfet." },
    { icon: "⚡", title: "Anında Katılım", text: "Tek tıkla maça kaydol, ödeme yap ve hazır ol. Kolay ve hızlı." },
    { icon: "⚖️", title: "Dengeli Takımlar", text: "Overall puanlama ile dengeli ve rekabetçi takımlar." },
    { icon: "💳", title: "Güvenli Ödeme", text: "Cüzdan ile güvenli ödeme, kolay bakiye yönetimi ve otomatik iadeler." },
    { icon: "⭐", title: "Performans Takibi", text: "Maç sonrası puanlama, istatistikler ve gelişimini takip et." },
    { icon: "🎥", title: "Maç Videoları", text: "Maç anlarını kaydet, gol kesitlerini izle ve paylaş." },
  ];
  return (
    <section id="ozellikler" className="mb-features">
      <div className="mb-features-wrap">
        <h2 className="mb-sec-title">Neden MaçBul?</h2>
        <p className="mb-sec-sub">Futbol oynamayı seven herkes için en kolay çözüm</p>
        <div className="mb-features-grid">
          {items.map((it, i) => (
            <div key={i} className="mb-feature-card">
              <div className="mb-feature-icon">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

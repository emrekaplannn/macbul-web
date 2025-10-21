import Link from "next/link";

export default function Hero() {
  return (
    <section className="mb-hero">
      <div className="mb-hero-content">
        <h1>Halı Saha Maçını Bul, Hemen Katıl</h1>
        <p>Yakınındaki açık maçları keşfet, tek tıkla kaydol ve sahaya in. Yeni takım arkadaşları bul, futbol keyfini yaşa.</p>
        <div className="mb-hero-actions">
          <Link className="mb-btn-primary" href="/login">Hemen Başla</Link>
          <a className="mb-btn-secondary" href="#nasil-calisir">Nasıl Çalışır?</a>
        </div>
      </div>
    </section>
  );
}

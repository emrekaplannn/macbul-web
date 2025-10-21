import Link from "next/link";

export default function Cta() {
  return (
    <section className="mb-cta-sec">
      <div className="mb-cta-wrap">
        <h2>Bugün Sahaya Çıkmaya Hazır mısın?</h2>
        <p>Hemen kaydol, yakınındaki maçları keşfet ve futbol tutkunu paylaş.</p>
        <Link href="/register" className="mb-btn-primary">Ücretsiz Kaydol</Link>
      </div>
    </section>
  );
}

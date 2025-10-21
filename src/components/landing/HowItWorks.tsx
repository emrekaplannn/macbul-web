export default function HowItWorks() {
  const steps = [
    { n: 1, title: "Kaydol", text: "Hızlı kayıt ol, profilini oluştur ve cüzdanına bakiye yükle." },
    { n: 2, title: "Maç Bul", text: "Yakınındaki açık maçları keşfet, tarih ve konuma göre filtrele." },
    { n: 3, title: "Sahaya İn", text: "Tek tıkla katıl, ödeme yap ve takım arkadaşlarınla tanış." },
  ];
  return (
    <section id="nasil-calisir" className="mb-how">
      <div className="mb-steps-wrap">
        <h2 className="mb-sec-title">Nasıl Çalışır?</h2>
        <p className="mb-sec-sub">3 adımda sahada olabilirsin</p>
        <div className="mb-steps">
          {steps.map(s => (
            <div key={s.n} className="mb-step">
              <div className="mb-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

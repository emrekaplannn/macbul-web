import Progress from "./Progress";
import type { Step } from "./types";

export default function LeftPanel({ step }: { step: Step }) {
  return (
    <div className="hidden md:flex flex-col justify-between relative overflow-hidden rounded-l-2xl brand-gradient text-white p-8">
      <div className="z-10">
        <div className="text-3xl font-extrabold mb-2">MaçBul</div>
        <p className="opacity-95 mb-10">Futbol tutkunlarının buluşma noktası</p>
        <Progress step={step} />
      </div>

      <div className="z-10">
        <h3 className="text-lg font-semibold mb-3">Neden MaçBul?</h3>
        <ul className="space-y-2 list-none">
          <li>✓ Yakınındaki maçları keşfet</li>
          <li>✓ Dengeli takımlarla oyna</li>
          <li>✓ Performansını takip et</li>
          <li>✓ Güvenli ödeme sistemi</li>
        </ul>
      </div>

      {/* Dekoratif arka plan top ikonu */}
      <div className="absolute -right-6 -bottom-6 text-[12rem] opacity-10 -rotate-12 select-none">
        ⚽
      </div>
    </div>
  );
}

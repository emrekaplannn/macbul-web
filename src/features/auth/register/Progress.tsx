import type { Step } from "./types";

export default function Progress({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3].map((i) => {
        const active = step === i;
        const completed = step > i;

        return (
          <div
            key={i}
            className={`flex items-center gap-4 ${
              active
                ? "opacity-100"
                : completed
                ? "opacity-75"
                : "opacity-60"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg
                ${
                  active
                    ? "bg-white text-brand border-white"
                    : completed
                    ? "bg-white/30 border-white/40 text-white"
                    : "bg-white/20 border-white/40 text-white/80"
                }`}
            >
              {completed ? "✓" : i}
            </div>

            <div>
              <h3 className="text-base font-semibold">
                {i === 1 && "Kişisel Bilgiler"}
                {i === 2 && "Hesap Bilgileri"}
                {i === 3 && "Oyuncu Profili"}
              </h3>
              <p className="text-sm opacity-90">
                {i === 1 && "Ad, soyad ve iletişim"}
                {i === 2 && "E-posta ve şifre"}
                {i === 3 && "Pozisyon ve tercihler"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

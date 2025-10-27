"use client";

export default function WalletCard() {
  return (
    <div className="card-profile">
      <div className="flex items-center justify-between mb-4">
        <div className="card-title">💳 Cüzdan</div>
        <a href="#" onClick={(e)=>e.preventDefault()} className="text-[#17a2b8] font-semibold text-sm">
          Tümünü Gör →
        </a>
      </div>

      <div className="bg-gradient-to-br from-[#17a2b8] to-[#138496] text-white rounded-xl p-6 mb-4">
        <div className="text-sm opacity-90 mb-1">Mevcut Bakiye</div>
        <div className="text-4xl font-bold mb-3">₺0</div>
        <div className="flex gap-3">
          <button className="flex-1 border-2 border-white rounded-lg py-2 font-semibold hover:bg-white hover:text-[#17a2b8]">
            💰 Bakiye Yükle
          </button>
          <button className="flex-1 border-2 border-white rounded-lg py-2 font-semibold hover:bg-white hover:text-[#17a2b8]">
            📤 Para Çek
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-red-100 text-red-700">📤</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Örnek İşlem</div>
            <div className="text-sm text-gray-500">Cüzdan entegrasyonu eklendiğinde doldurulacak</div>
          </div>
          <div className="font-bold text-red-600">-₺0</div>
        </div>
      </div>
    </div>
  );
}

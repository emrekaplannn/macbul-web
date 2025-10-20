export default function Success() {
  return (
    <div className="text-center p-6 animate-fade">
      <div className="text-6xl mb-2">🎉</div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Hoş Geldin!</h2>
      <p className="text-slate-600 mb-6">
        Hesabın başarıyla oluşturuldu. Şimdi e-mail adresini doğrulayıp maçları keşfetmeye başlayabilirsin.
      </p>
      <a href="/verify-email" className="btn-primary inline-block">Maçları Keşfet</a>
    </div>
  );
}

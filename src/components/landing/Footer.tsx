export default function Footer() {
  return (
    <footer className="mb-footer" id="hakkimizda">
      <div className="mb-footer-grid">
        <div className="mb-foot-col">
          <h4>MaçBul</h4>
          <p>Türkiye'nin en büyük halı saha maç bulma platformu.</p>
        </div>
        <div className="mb-foot-col">
          <h4>Hızlı Linkler</h4>
          <ul>
            <li><a href="#hakkimizda">Hakkımızda</a></li>
            <li><a href="#nasil-calisir">Nasıl Çalışır</a></li>
            <li><a href="/faq">Sıkça Sorulan Sorular</a></li>
            <li><a href="/contact">İletişim</a></li>
          </ul>
        </div>
        <div className="mb-foot-col">
          <h4>Destek</h4>
          <ul>
            <li><a href="/help">Yardım Merkezi</a></li>
            <li><a href="/terms">Kullanım Koşulları</a></li>
            <li><a href="/privacy">Gizlilik Politikası</a></li>
            <li><a href="/security">Güvenlik</a></li>
          </ul>
        </div>
        <div className="mb-foot-col">
          <h4>Bize Ulaşın</h4>
          <ul>
            <li><a href="mailto:info@macbul.com">info@macbul.com</a></li>
            <li><a href="tel:+905551234567">+90 555 123 45 67</a></li>
          </ul>
        </div>
      </div>
      <div className="mb-foot-bottom">
        <p>&copy; {new Date().getFullYear()} MaçBul. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}

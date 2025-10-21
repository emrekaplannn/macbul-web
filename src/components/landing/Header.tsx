"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="mb-header">
      <nav className="mb-nav">
        <Link href="/" className="mb-logo">MaçBul</Link>
        <ul className="mb-nav-links">
          <li><a href="#ozellikler">Özellikler</a></li>
          <li><a href="#nasil-calisir">Nasıl Çalışır</a></li>
          <li><a href="#hakkimizda">Hakkımızda</a></li>
        </ul>
        <Link href="/login" className="mb-cta">Giriş Yap</Link>
      </nav>
    </header>
  );
}

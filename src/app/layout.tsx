import "./globals.css";
import Providers from "@/components/providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MaçBul",
  description: "Halı saha maçlarını bul, oluştur, katıl.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

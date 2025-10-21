import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero"; 
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "MaçBul - Halı Saha Maçını Bul, Hemen Katıl",
};

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

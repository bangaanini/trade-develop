// Server component - can use database
import MobileHeroSlider from "@/components/mobile/MobileHeroSlider";
import Hero from "@/components/Hero";
import MobileHomeActions from "@/components/mobile/MobileHomeActions";
import CompanyIntro from "@/components/sections/CompanyIntro";
import JourneyStart from "@/components/sections/JourneyStart";
import LeadingPlatform from "@/components/sections/LeadingPlatform";
import HomeMarketSection from "@/components/HomeMarketSection";
import DownloadAppSection from "@/components/sections/DownloadAppSection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* MOBILE HERO SLIDER */}
      <MobileHeroSlider />

      {/* DESKTOP HERO */}
      <div className="hidden md:block">
        <Hero />
      </div>

      {/* MOBILE ACTIONS (Dynamic based on Auth) */}
      <MobileHomeActions />

      {/* MARKET LIST (client component with state) */}
      <HomeMarketSection />

      {/* DESKTOP-ONLY SECTIONS (server components with DB) */}
      <div className="hidden md:block">
        <LeadingPlatform />
        <JourneyStart />
        <DownloadAppSection />
        <CompanyIntro />
        <Footer />
      </div>

    </div>
  );
}

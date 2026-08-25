import CompanyIntro from "@/components/sections/CompanyIntro";
import Footer from "@/components/sections/Footer";
import DownloadContent from "@/components/download/DownloadContent";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0b1426]">
      {/* Navbar Placeholder (Assuming global layout handles this, but adding spacing) */}
      <div className="h-16"></div>

      <DownloadContent />
      
      <CompanyIntro />
      <Footer />
    </div>
  );
}

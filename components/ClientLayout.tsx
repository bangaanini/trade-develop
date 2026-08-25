"use client";

import Header from "@/components/Header";
import MobileNavbar from "@/components/MobileNavbar";
import IOSInstallBanner from "@/components/pwa/IOSInstallBanner";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPage && (
        <>
          <div className="fixed top-0 left-0 w-full z-50 hidden md:block">
            <Header />
          </div>
          <MobileNavbar />
        </>
      )}
      <div className={isAdminPage ? "" : "pt-0 pb-16"}>
          {children}
          {!isAdminPage && <IOSInstallBanner />}
      </div>
    </>
  );
}


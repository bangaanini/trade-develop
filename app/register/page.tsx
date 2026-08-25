"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterRedirect() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect to login page (which now has register tab)
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">{t('common.redirecting')}</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileGuestButtons() {
  const { t } = useLanguage();

  return (
    <div className="md:hidden grid grid-cols-2 gap-3 px-4 py-6 bg-background">
      <Link
        href="/register"
        className="flex items-center justify-center bg-primary text-primary-foreground py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20"
      >
        {t('auth.register')}
      </Link>

      <Link
        href="/login"
        className="flex items-center justify-center border border-border text-foreground py-4 rounded-lg text-lg font-semibold hover:bg-muted transition"
      >
        {t('auth.login')}
      </Link>
    </div>
  );
}

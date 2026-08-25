"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileQuickActions() {
  const { t } = useLanguage();
  return (
    <div className="md:hidden grid grid-cols-2 gap-3 px-4 py-6 bg-background">

      <Link href="/withdraw" className="flex items-center justify-center border border-border text-foreground py-4 rounded-lg text-lg font-semibold hover:bg-muted transition center">
        {t('common.withdraw')}
      </Link>

      <Link href="/deposit" className="flex items-center justify-center border border-border text-foreground py-4 rounded-lg text-lg font-semibold hover:bg-muted transition center">
        {t('common.deposit')}
      </Link>

    </div>
  );
}


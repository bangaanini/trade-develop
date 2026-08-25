"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, TrendingUp, User, ChartCandlestick } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function MobileNavbar() {
  const path = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-card shadow-[0_-1px_3px_rgba(0,0,0,0.1)] border-t border-border z-40 text-foreground transition-colors duration-200 safe-area-pb">
      <div className="flex justify-around py-3 text-xs items-end h-[60px]">

        <NavItem 
          title={t('nav.home')} 
          Icon={Home} 
          active={path === "/"} 
          onClick={() => router.push("/")} 
        />
        
        <NavItem 
          title={t('nav.spot')} 
          Icon={ChartCandlestick} 
          active={path === "/spot"} 
          onClick={() => router.push("/spot")} 
        />

        <NavItem 
          title={t('nav.trading')} 
          Icon={TrendingUp} 
          active={path === "/option"} 
          onClick={() => router.push("/option")} 
        />

        <NavItem 
          title={t('nav.account')} 
          Icon={User} 
          active={path === "/account"} 
          onClick={() => router.push("/account")} 
        />

      </div>
    </div>
  );
}

function NavItem({ title, Icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full ${active ? "text-yellow-400" : "text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className={`w-6 h-6 mb-1 ${active ? "fill-current" : ""}`} />
      <span className="text-[10px] font-medium">{title}</span>
    </button>
  );
}

function MenuButton({ icon, label, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 p-4 rounded-xl transition border border-border"
        >
            <span className="text-2xl mb-2">{icon}</span>
            <span className="font-semibold text-sm">{label}</span>
        </button>
    )
}

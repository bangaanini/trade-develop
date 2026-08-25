"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, ArrowDownLeft, ArrowUpRight, 
  History, Settings, Wallet, BarChart2, X, List, FileText, MessageCircle, MessageSquare, LogOut, Database
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

  import { useAdmin } from "@/components/admin/AdminContext";

  export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const { t } = useLanguage();
    const { role } = useAdmin();
    const path = usePathname();
    const [counts, setCounts] = useState({ deposits: 0, withdraws: 0, kycPending: 0, chatUnread: 0, activeTrades: 0 });

    useEffect(() => {
      async function fetchStats() {
         try {
            // Parallel fetch to optimize speed
            const [resStats, resTrades] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/stats/trades")
            ]);

            const dataStats = resStats.ok ? await resStats.json() : {};
            const dataTrades = resTrades.ok ? await resTrades.json() : { count: 0 };
            
             setCounts({ 
              deposits: dataStats.deposits || 0, 
              withdraws: dataStats.withdraws || 0,
              kycPending: dataStats.kycPending || 0,
              chatUnread: dataStats.chatUnread || 0,
              activeTrades: dataTrades.count || 0
            });

         } catch(e) {
             console.error(e);
         }
      }
      
      fetchStats();
      const timer = setInterval(fetchStats, 5000); // Poll every 5s - optimized for VPS
      return () => clearInterval(timer);
    }, []);

    const menu = [
      { title: t('admin.dashboard'), href: "/admin", icon: LayoutDashboard },
      { title: t('admin.users'), href: "/admin/users", icon: Users },
      { title: 'Trade', href: "/admin/trades", icon: BarChart2, count: counts.activeTrades },
      
      // SUPERADMIN ONLY
      ...(role === 'superadmin' ? [
          { title: t('admin.kyc'), href: "/admin/kyc", icon: FileText, count: counts.kycPending },
      ] : []),

      { title: t('admin.live_chat'), href: "/admin/chat", icon: MessageCircle, count: counts.chatUnread },
      { title: t('admin.tickets'), href: "/admin/tickets", icon: MessageSquare },
      { title: t('admin.deposits'), href: "/admin/deposits", icon: ArrowDownLeft, count: counts.deposits },
      { title: t('admin.withdraws'), href: "/admin/withdraws", icon: ArrowUpRight, count: counts.withdraws },
      { title: t('admin.transactions'), href: "/admin/transactions", icon: List },
      
      // SUPERADMIN ONLY
      ...(role === 'superadmin' ? [
          { title: t('admin.deposit_methods'), href: "/admin/deposit-methods", icon: Wallet },
          { title: t('admin.option_settings'), href: "/admin/option", icon: BarChart2 },
          { title: 'Database', href: "/admin/database", icon: Database },
      ] : []),

      ...(role === 'superadmin' ? [
           { title: t('admin.settings'), href: "/admin/settings", icon: Settings },
      ] : []),


    ];

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] border-r border-gray-800 transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:flex md:flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
              {t('admin.admin_panel')}
            </h2>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menu.map((m) => {
              const isActive = path === m.href;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => onClose()} // Close on navigate (mobile)
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors group ${
                    isActive 
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.icon className={`w-5 h-5 ${isActive ? "text-yellow-400" : "text-gray-500 group-hover:text-white"}`} />
                    <span className="font-medium text-sm">{m.title}</span>
                  </div>
                  
                  {m.count !== undefined && m.count > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        {m.count}
                    </span>
                  )}
                </Link>
              )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all group"
            >
               <LogOut className="w-5 h-5" />
               <span className="font-medium text-sm">{t('common.logout')}</span>
            </button>
        </div>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 text-center">
            {t('admin.control_center')}
        </div>
      </aside>
    </>
  );
}

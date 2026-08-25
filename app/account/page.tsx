"use client";

import ProfileCard from "@/components/account/ProfileCard";
import QuickActions from "@/components/account/QuickActions";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Lock, Wallet, Settings, ChevronRight, LogOut, Gift, MessageSquare, Globe, Check, X, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountPage() {
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
      async function checkAuth() {
          try {
              const res = await fetch("/api/auth/me");
              if (!res.ok) {
                  router.push("/login");
                  return;
              }
              const data = await res.json();
              if(!data.user) {
                  router.push("/login");
              }
          } catch(e) {
              router.push("/login");
          } finally {
              setLoading(false);
          }
      }
      checkAuth();
  }, [router]);

  const handleLogout = async () => {
      try {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
      } catch(e) {
          console.error(e);
      }
  };

  if(loading) return null;

  return (
    <div className="max-w-7xl mx-auto text-foreground pb-20 pt-15 mt-6 px-4 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Profile (Sticky on Desktop) */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-6 space-y-6">
            <ProfileCard />
            
            {/* Logout on Desktop - below profile */}
            <div className="hidden lg:block">
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold">{t('common.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold mb-4 hidden lg:block">{t('common.dashboard')}</h3>
            {/* Mobile: List, Desktop: Grid */}
            <div className="block lg:hidden">
              <QuickActions variant="list" />
            </div>
            <div className="hidden lg:block">
              <QuickActions variant="grid" />
            </div>
          </div>
          
          {/* Settings Grid for Desktop / Stack for Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
             {/* Account Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">{t('account.section_account')}</h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full">
                <SettingItem 
                  icon={Gift} 
                  title={t('account.my_invitation')} 
                  onClick={() => router.push("/account/referral")} 
                />
                <SettingItem 
                  icon={Lock} 
                  title={t('account.security_center')} 
                  onClick={() => router.push("/account/security")} 
                />
                <SettingItem 
                  icon={Wallet} 
                  title={t('account.bind_address')} 
                  onClick={() => router.push("/account/bind-address")} 
                  last
                />
              </div>
            </div>

            {/* Universal Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground px-1">{t('account.section_universal')}</h3>
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full">
                <SettingItem 
                  icon={MessageSquare} 
                  title={t('account.submit_ticket')} 
                  onClick={() => router.push("/account/ticket")} 
                />

                <div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/10 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                      </svg>
                    </div>
                    <span className="font-medium text-sm">{t('account.dark_mode')}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ThemeSwitcher />
                  </div>
                </div>

                <SettingItem 
                  icon={Globe} 
                  title={t('account.language')} 
                  onClick={() => setShowLanguageModal(true)} 
                />

                <SettingItem 
                  icon={Download} 
                  title={t('account.download_app')} 
                  onClick={() => router.push("/download")} 
                  last
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Logout Button (Mobile Only) */}
      <div className="lg:hidden mt-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-semibold">{t('common.logout')}</span>
        </button>
      </div>
      
      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowLanguageModal(false)}>
          <div className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold">{t('account.language')}</h3>
              <button onClick={() => setShowLanguageModal(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'de', label: 'Deutsch' },
                { code: 'fr', label: 'Français' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code as any);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition ${
                    locale === lang.code ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <span className="font-medium">{lang.label}</span>
                  {locale === lang.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingItem({ icon: Icon, title, onClick, last }: any) {
  return (
    <div 
      className={`flex items-center justify-between p-4 ${!last ? 'border-b border-border' : ''} hover:bg-muted/10 transition cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

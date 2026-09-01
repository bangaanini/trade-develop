"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const [user, setUser] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/settings/public")
        ]);
        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        }
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.data?.images?.logo?.file_url) {
            setLogoUrl(sData.data.images.logo.file_url);
          }
        }
      } catch (error) {
        console.error("Failed to load header data", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll && current > 80) {
        setShow(false);
      } else {
        setShow(true);
      }

      setLastScroll(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  }, [lastScroll]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${show ? "translate-y-0" : "-translate-y-full"}
      bg-background/80 backdrop-blur border-b border-border`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-6">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src={logoUrl} alt="logo" className="w-28 h-13 rounded-2xl shadow-lg object-contain" />
          </Link>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/option" className="hover:text-primary transition-colors">{t('nav.option')}</a>
          <a href="/spot" className="hover:text-primary transition-colors">{t('nav.spot')}</a>
          
          {/* Show these menus only when user is logged in */}
          {user && (
            <>
              <a href="/swap" className="hover:text-primary transition-colors">{t('nav.swap')}</a>
              <a href="/wallet" className="hover:text-primary transition-colors">{t('common.wallet')}</a>
              <a href="/deposit" className="hover:text-primary transition-colors">{t('common.deposit')}</a>
              <a href="/withdraw" className="hover:text-primary transition-colors">{t('common.withdraw')}</a>
            </>
          )}
          
          <a href="/support" className="hover:text-primary transition-colors">{t('nav.support')}</a>
        </nav>

        <div className="flex items-center gap-4">
          {/* USER NOT LOGGED IN */}
          {!user && (
            <>
              <button
                className="bg-card hover:bg-muted border border-border px-4 py-1.5 rounded-md text-sm transition-colors"
                onClick={() => (window.location.href = "/login")}
              >
                Sign in
              </button>

              <button
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition-opacity"
                onClick={() => (window.location.href = "/register")}
              >
                Account Registration
              </button>
            </>
          )}

          {/* USER LOGGED IN */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="bg-card hover:bg-muted border border-border px-4 py-1.5 rounded-md text-sm transition-colors"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {user.email}
              </button>

              {/* DROPDOWN */}
              <div
                className={`absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-lg ${
                  menuOpen ? "block" : "hidden"
                }`}
              >
                <button
                  onClick={() => (window.location.href = "/account")}
                  className="block w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-danger hover:bg-muted transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* LANGUAGE SWITCHER */}
          <LanguageSwitcher />

          {/* DARK MODE TOGGLE */}
          <ThemeSwitcher />

        </div>
      </div>
    </header>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const [siteName, setSiteName] = useState<string>("Trade Freedom");

  useEffect(() => {
    async function loadPublicSettings() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.images?.logo?.file_url) {
            setLogoUrl(json.data.images.logo.file_url);
          }
          const sName = json.data?.settings?.seo?.site_name;
          if (sName) {
            setSiteName(sName);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadPublicSettings();
  }, []);

  return (
    <footer className="bg-[#0b1633] text-gray-400 py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoUrl} alt={siteName} className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-bold text-white">{siteName}</span>
          </div>
          <p className="text-sm">
            The world's leading digital asset trading platform. Safe, reliable, and fast.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-white font-semibold mb-4">{t('common.support') || "Support"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/support" className="hover:text-blue-400 transition">{t('common.support_center') || "Support Center"}</Link></li>
            <li><Link href="/ticket" className="hover:text-blue-400 transition">{t('ticket.title') || "Submit Ticket"}</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-white font-semibold mb-4">{t('common.about') || "About Us"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="https://wa.me/15419655537" target="_blank" className="hover:text-blue-400 transition">Business Contacts</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition">Terms & Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 className="text-white font-semibold mb-4">{t('common.products') || "Products"}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/spot" className="hover:text-blue-400 transition">{t('nav.spot') || "Spot Trading"}</Link></li>
            <li><Link href="/option" className="hover:text-blue-400 transition">{t('nav.option') || "Binary Option"}</Link></li>
            <li><Link href="/swap" className="hover:text-blue-400 transition">{t('nav.swap') || "Instant Swap"}</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-xs text-gray-500">
        © {currentYear} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}

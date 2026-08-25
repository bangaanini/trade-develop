"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1633] text-gray-400 py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="Trade Freedom" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-white">Trade Freedom</span>
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
            <li><Link href="https://instagram.com/crypto.co.id" target="_blank" className="hover:text-blue-400 transition">Community</Link></li>
          </ul>
        </div>

         {/* Links Column 3 */}
         <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-blue-400 transition">{t('auth.terms_service') || "Terms of Service"}</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition">{t('auth.privacy_policy') || "Privacy Policy"}</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p>&copy; {currentYear} Trade Freedom. All rights reserved.</p>
        <div className="flex gap-4">
            <span>Global | USD</span>
        </div>
      </div>
    </footer>
  );
}

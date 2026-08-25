"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
         if(data.user) setUser(data.user);
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
          >
              <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
      </div>

      {user && <span className="text-gray-300 hidden md:block">{user.email}</span>}
    </div>
  );
}

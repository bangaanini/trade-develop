"use client";

import { useEffect, useState } from "react";
import { Users, ArrowDownLeft, ArrowUpRight, Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

import { useAdmin } from "@/components/admin/AdminContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { role } = useAdmin();
  const [stats, setStats] = useState({
    users: 0,
    deposits: 0,
    withdraws: 0,
    runningOptions: 0,
  });

  async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
           const data = await res.json();
           setStats(data);
        }
      } catch (e) {
         console.error(e);
      }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000); // Real-time update (5s) - optimized for VPS
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {role === 'superadmin' && (
            <Box 
                title={t('admin.total_users')}
                value={stats.users} 
                icon={Users}
                color="bg-blue-500" 
            />
          )}
          <Box 
            title={t('admin.pending_deposits')}
            value={stats.deposits} 
            icon={ArrowDownLeft}
            color="bg-green-500"
            alert={stats.deposits > 0} 
          />
          <Box 
            title={t('admin.pending_withdraws')}
            value={stats.withdraws} 
            icon={ArrowUpRight} 
            color="bg-orange-500"
            alert={stats.withdraws > 0} 
          />
          <Box 
            title={t('admin.running_options')}
            value={stats.runningOptions} 
            icon={Activity} 
            color="bg-purple-500" 
          />
       </div>

       {/* Quick Actions or Charts could go here */}
       <div className="p-8 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500">
           {t('admin.select_menu')}
       </div>
    </div>
  );
}

function Box({ title, value, icon: Icon, color, alert }: any) {
  return (
    <div className={`relative p-6 bg-[#1f2937] border border-gray-700 rounded-xl shadow-lg hover:border-gray-600 transition overflow-hidden group`}>
      <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-gray-400 font-medium">{title}</h3>
          <div className={`p-2 rounded-lg bg-opacity-20 ${color} text-white`}>
              <Icon className="w-5 h-5" />
          </div>
      </div>
      <p className="text-3xl font-bold relative z-10">{value}</p>
      
      {/* Background Glow */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition ${color}`} />
      
      {alert && (
          <span className="absolute top-4 right-4 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
      )}
    </div>
  );
}

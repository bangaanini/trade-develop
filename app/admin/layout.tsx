"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminContext } from "@/components/admin/AdminContext";


export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
          const res = await fetch("/api/auth/me");
          if (!res.ok) {
             router.replace("/login");
             return;
          }
          const data = await res.json();
          const user = data.user;

          if (user.role !== "admin" && user.role !== "superadmin") {
            router.replace("/");
            return;
          }

          setRole(user.role);
          setAllowed(true);
      } catch (e) {
          router.replace("/login");
      }
    }

    checkAuth();
  }, []);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking access...
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ role, loading: allowed === null }}>
      <div className="flex min-h-screen bg-[#0f172a] text-white dark">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 p-6 w-full"> {/* w-full ensures width control on mobile */}
          <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
          {children}
        </div>
      </div>
    </AdminContext.Provider>
  );
}

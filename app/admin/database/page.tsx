"use client";

import { useAdmin } from "@/components/admin/AdminContext";
import DatabaseViewer from "@/components/admin/DatabaseViewer";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DatabasePage() {
  const { role, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== 'superadmin') {
        router.push('/admin');
    }
  }, [role, loading, router]);

  if (loading) return null;

  if (role !== 'superadmin') return null; // Should redirect, but safe return

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
                    Database Browser
                </h1>
                <p className="text-gray-500 text-sm mt-1">Direct access to database tables and records</p>
            </div>
            <div className="flex items-center gap-2 bg-red-900/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs">
                <ShieldAlert className="w-4 h-4" />
                Super Admin Access Only
            </div>
        </div>

        <DatabaseViewer />
    </div>
  );
}

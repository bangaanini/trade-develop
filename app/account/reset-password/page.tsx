"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(form.newPassword !== form.confirmPassword) {
          toast.error("New passwords do not match");
          return;
      }

      setLoading(true);
      try {
          const res = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  currentPassword: form.currentPassword,
                  newPassword: form.newPassword
              })
          });
          const json = await res.json();
          if(json.success) {
              toast.success("Password changed successfully!");
              router.back();
          } else {
              toast.error(json.error || "Failed using reset password");
          }
      } catch(e) {
          console.error(e);
          toast.error("An error occurred");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-md mx-auto text-foreground mt-4 px-4 pb-20">
       <div className="flex items-center gap-2 mb-6">
           <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
               <ChevronLeft className="w-5 h-5" />
           </button>
           <h1 className="text-xl font-bold">Reset Password</h1>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
           {/* Current */}
           <div className="space-y-1">
               <label className="text-sm text-gray-400">Current Password</label>
               <div className="relative">
                   <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                   <input 
                     type="password"
                     required
                     className="w-full bg-card border border-border rounded-lg p-3 pl-10 outline-none focus:border-yellow-400 transition"
                     placeholder="Enter current password"
                     value={form.currentPassword}
                     onChange={e => setForm({...form, currentPassword: e.target.value})}
                   />
               </div>
           </div>

           {/* New */}
           <div className="space-y-1">
               <label className="text-sm text-gray-400">New Password</label>
               <div className="relative">
                   <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                   <input 
                     type="password"
                     required
                     minLength={6}
                     className="w-full bg-card border border-border rounded-lg p-3 pl-10 outline-none focus:border-yellow-400 transition"
                     placeholder="Enter new password"
                     value={form.newPassword}
                     onChange={e => setForm({...form, newPassword: e.target.value})}
                   />
               </div>
           </div>

           {/* Confirm */}
           <div className="space-y-1">
               <label className="text-sm text-gray-400">Confirm New Password</label>
               <div className="relative">
                   <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                   <input 
                     type="password"
                     required
                     minLength={6}
                     className="w-full bg-card border border-border rounded-lg p-3 pl-10 outline-none focus:border-yellow-400 transition"
                     placeholder="Confirm new password"
                     value={form.confirmPassword}
                     onChange={e => setForm({...form, confirmPassword: e.target.value})}
                   />
               </div>
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg mt-6 shadow-lg transition"
           >
               {loading ? "Updating..." : "Update Password"}
           </button>

       </form>
    </div>
  );
}

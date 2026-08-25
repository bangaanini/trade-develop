"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Key } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

export default function SecurityCenterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "withdraw">("login");
  
  // Login Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Withdraw Password State
  const [currentWithdrawPassword, setCurrentWithdrawPassword] = useState("");
  const [newWithdrawPassword, setNewWithdrawPassword] = useState("");
  const [confirmWithdrawPassword, setConfirmWithdrawPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleResetLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwords_no_match'));
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error(t('auth.password_min_chars'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/reset-login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('security.success_login'));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error("Failed to update password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithdrawPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newWithdrawPassword !== confirmWithdrawPassword) {
      toast.error(t('auth.passwords_no_match'));
      return;
    }
    
    if (newWithdrawPassword.length < 6) {
      toast.error(t('auth.password_min_chars'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/reset-withdraw-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: currentWithdrawPassword, 
          newPassword: newWithdrawPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('security.success_withdraw'));
        setCurrentWithdrawPassword("");
        setNewWithdrawPassword("");
        setConfirmWithdrawPassword("");
      } else {
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error("Failed to update password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('security.title')}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-6">
        
        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 font-semibold text-sm transition ${
                activeTab === "login"
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              {t('security.login_password')}
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-3 px-4 font-semibold text-sm transition ${
                activeTab === "withdraw"
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Key className="w-4 h-4 inline mr-2" />
              {t('security.withdraw_password')}
            </button>
          </div>
        </div>

        {/* Login Password Form */}
        {activeTab === "login" && (
          <form onSubmit={handleResetLoginPassword} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold mb-4">{t('security.reset_login')}</h2>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.current_password')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.new_password')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.confirm_password')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.processing') : t('security.update_login')}
            </button>
          </form>
        )}

        {/* Withdraw Password Form */}
        {activeTab === "withdraw" && (
          <form onSubmit={handleResetWithdrawPassword} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold mb-4">{t('security.reset_withdraw')}</h2>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.current_withdraw')}
              </label>
              <input
                type="password"
                value={currentWithdrawPassword}
                onChange={(e) => setCurrentWithdrawPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.new_withdraw')}
              </label>
              <input
                type="password"
                value={newWithdrawPassword}
                onChange={(e) => setNewWithdrawPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t('security.confirm_withdraw')}
              </label>
              <input
                type="password"
                value={confirmWithdrawPassword}
                onChange={(e) => setConfirmWithdrawPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.processing') : t('security.update_withdraw')}
            </button>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-400">
                <strong>ℹ️ Note:</strong> {t('security.note')}
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

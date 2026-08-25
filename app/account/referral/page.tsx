"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Users, QrCode as QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/context/LanguageContext";

export default function ReferralPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const [referralUrl, setReferralUrl] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReferralInfo();
  }, []);

  async function loadReferralInfo() {
    try {
      const res = await fetch("/api/account/referral");
      
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode || "");
        setReferralUrl(data.referralUrl || "");
        setTotalReferrals(data.totalReferrals || 0);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to load referral info");
      }
    } catch (e: any) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t('referral.title')}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-6">
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-500 font-bold mb-2">⚠️ Error</p>
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button 
              onClick={loadReferralInfo}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Referral Stats */}
            <div className="bg-linear-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-yellow-500" />
                <h2 className="text-lg font-bold">{t('referral.total_referrals')}</h2>
              </div>
              <p className="text-4xl font-bold text-yellow-500">{totalReferrals}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('referral.people_invited')}</p>
            </div>

            {/* Referral Code */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('referral.your_code')}</h3>
              <div className="flex items-center justify-center py-4">
                <p className="text-3xl font-bold tracking-wider text-primary">{referralCode || "Loading..."}</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">{t('referral.client_link')}</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralUrl}
                  readOnly
                  className="flex-1 p-3 rounded-lg bg-input border border-border text-sm"
                  placeholder="Loading..."
                />
                <button
                  onClick={handleCopy}
                  disabled={!referralUrl}
                  className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                    copied 
                      ? "bg-green-500 text-white" 
                      : "bg-primary hover:bg-primary/80 text-white disabled:opacity-50"
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('referral.copied') : t('referral.copy')}
                </button>
              </div>
            </div>

            {/* QR Code */}
            {referralUrl && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <QrCodeIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-muted-foreground">{t('referral.qr_code')}</h3>
                </div>
                
                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={referralUrl} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {t('referral.share_hint')}
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                <strong>ℹ️ </strong> {t('referral.how_it_works')}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

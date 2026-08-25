"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import KYCModal from "@/components/modals/KYCModal";
import { useLanguage } from "@/context/LanguageContext";

interface MobileServiceButtonsProps {
  user: any;
}

export default function MobileServiceButtons({ user }: MobileServiceButtonsProps) {
  const { t } = useLanguage();
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  async function loadKYCStatus() {
    try {
      const res = await fetch("/api/kyc/submit");
      if (res.ok) {
        const data = await res.json();
        if (data.kyc) {
          setKycStatus(data.kyc.status);
        }
      }
    } catch (e) {
      console.error("Failed to load KYC status");
    }
  }

  const handleKYCClick = () => {
    if (!user) {
      toast.error(t('common.login_required'));
      window.location.href = "/login";
      return;
    }

    if (kycStatus === "approved") {
      toast.success(`✅ ${t('common.kyc_approved_alert')}`);
      return;
    }

    if (kycStatus === "pending") {
      toast(`⏳ ${t('common.kyc_pending_alert')}`, { icon: '⏳' });
      return;
    }

    setKycModalOpen(true);
  };

  const handleLiveChatClick = () => {
    // Navigate to support page
    window.location.href = '/support';
  };

  const getKYCButtonText = () => {
    if (!user) return t('common.kyc_verification');
    if (kycStatus === "approved") return t('common.kyc_verified');
    if (kycStatus === "pending") return t('common.kyc_pending');
    if (kycStatus === "rejected") return t('common.resubmit_kyc');
    return t('common.kyc_verification');
  };

  const getKYCButtonStyle = () => {
    if (kycStatus === "approved") {
      return "border-success text-success bg-success/10";
    }
    if (kycStatus === "pending") {
      return "border-primary text-primary bg-primary/10";
    }
    return "border-border text-foreground hover:bg-muted";
  };

  return (
    <>
      <div className="md:hidden grid grid-cols-2 gap-3 px-4 py-4">
        {/* KYC Verification Button */}
        <button
          onClick={handleKYCClick}
          className={`flex flex-col items-center justify-center py-5 rounded-lg border transition ${getKYCButtonStyle()}`}
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <span className="text-sm font-semibold">{getKYCButtonText()}</span>
        </button>

        {/* Live Chat Button */}
        <button
          onClick={handleLiveChatClick}
          className="flex flex-col items-center justify-center py-5 rounded-lg border border-border text-foreground hover:bg-muted transition"
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-semibold">{t('common.live_support')}</span>
        </button>
      </div>

      {/* KYC Modal */}
      <KYCModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onSuccess={loadKYCStatus}
      />
    </>
  );
}

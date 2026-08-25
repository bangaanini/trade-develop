"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WalletSummary from "@/components/account/WalletSummary";
import DepositHistory from "@/components/account/DepositHistory";
import WithdrawHistory from "@/components/account/WithdrawHistory";
import WalletAuditLog from "@/components/account/WalletAuditLog";
import Accordion from "@/components/ui/Accordion";
import { useLanguage } from "@/context/LanguageContext";

export default function WalletPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
        try {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            if(!data.user) {
                router.push("/login");
            }
        } catch(e) {
            router.push("/login");
        } finally {
            setLoading(false);
        }
    }
    checkAuth();
  }, [router]);

  if(loading) return null;

  return (
    <div className="max-w-5xl mx-auto text-foreground space-y-6 pb-20 mt-15 px-4">
      <WalletSummary />
      
      <div className="space-y-4">
        <Accordion title={t('wallet.deposit_history')}>
             <DepositHistory />
        </Accordion>

        <Accordion title={t('wallet.withdraw_history')}>
            <WithdrawHistory />
        </Accordion>

        <Accordion title={t('wallet.wallet_logs')}>
            <WalletAuditLog />
        </Accordion>
      </div>
    </div>
  );
}

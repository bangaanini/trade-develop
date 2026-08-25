"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User, Wallet, History, ArrowLeftRight, Shield, Monitor, ExternalLink } from "lucide-react";

import WalletList from "@/components/admin/WalletList";
import UserInfoForm from "@/components/admin/UserInfoForm";
import UserDepositHistory from "@/components/admin/UserDepositHistory";
import UserWithdrawHistory from "@/components/admin/UserWithdrawHistory";
import UserKYCStatus from "@/components/admin/UserKYCStatus";
import UserWinRateControl from "@/components/admin/UserWinRateControl";
import UserBindAddresses from "@/components/admin/UserBindAddresses";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDetail({ params }: { params: Promise<{ id: string }> }) {
    const { t } = useLanguage();
    const { id } = use(params);
    const [user, setUser] = useState<any>(null);
    const [wallets, setWallets] = useState<any[]>([]);
    const [depositNetworks, setDepositNetworks] = useState<any[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>("");
    const [loading, setLoading] = useState(true);

    async function loadData() {
        try {
            const res = await fetch(`/api/admin/users/${id}`);
            if (!res.ok) return;
            const json = await res.json();

            setUser(json.user);
            setWallets(json.wallets || []);
            setDepositNetworks(json.depositNetworks || []);
            setCurrentUserRole(json.userRole);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                {t('admin.loading_details')}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10 text-red-500">
                {t('admin.user_not_found')}
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/users"
                    className="p-2 rounded-lg bg-[#1f2937] text-gray-400 hover:text-white hover:bg-gray-700 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-400">
                        {t('admin.user_details')}
                    </h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {id}</p>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* USER INFO CARD */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <User className="w-5 h-5" />
                        <h2 className="font-semibold text-lg">{t('admin.profile_info')}</h2>
                    </div>
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-sm">
                        <UserInfoForm user={user} reload={loadData} currentUserRole={currentUserRole} />
                    </div>

                    {/* REGISTRATION INFO */}
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2 text-yellow-500 mb-2">
                            <Monitor className="w-5 h-5" />
                            <h2 className="font-semibold text-lg">Registration Info</h2>
                        </div>
                        <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-sm space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-mono block mb-1">IP Address</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-mono bg-gray-800 px-2 py-1 rounded text-sm">{user.registration_ip || "Unknown"}</p>
                                    {user.registration_ip && (
                                        <a
                                            href={`https://whatismyipaddress.com/ip/${user.registration_ip}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#3b82f6] hover:text-[#60a5fa] hover:bg-[#3b82f6]/10 p-1 rounded transition"
                                            title={t('admin.check_ip_location')}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-mono block mb-1">Device / User Agent</label>
                                <p className="text-gray-300 text-xs font-mono break-all bg-gray-800/50 p-3 rounded border border-gray-700">
                                    {user.registration_device || "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WALLET CARD */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <Wallet className="w-5 h-5" />
                        <h2 className="font-semibold text-lg">{t('admin.wallet_balances')}</h2>
                    </div>
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 shadow-sm">
                        <WalletList wallets={wallets} userId={id} depositNetworks={depositNetworks} reload={async () => loadData()} />
                    </div>

                    {/* WIN RATE CONTROL */}
                    <UserWinRateControl userId={id} initialWinRate={user.win_rate} />

                    {/* BIND ADDRESSES */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-500 mb-2">
                            <Wallet className="w-5 h-5" />
                            <h2 className="font-semibold text-lg">Bind / Withdraw Addresses</h2>
                        </div>
                        <UserBindAddresses userId={id} currentUserRole={currentUserRole} />
                    </div>
                </div>
            </div>

            {/* KYC STATUS CARD */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                    <Shield className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">{t('admin.kyc')}</h2>
                </div>
                <UserKYCStatus userId={id} />
            </div>

            {/* HISTORY SECTION */}
            <div className="pt-6 border-t border-gray-800 space-y-8">

                {/* DEPOSITS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <History className="w-5 h-5" />
                        <h3 className="font-semibold text-white">{t('admin.deposit_history')}</h3>
                    </div>
                    <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden">
                        <UserDepositHistory userId={id} />
                    </div>
                </div>

                {/* WITHDRAWS */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <ArrowLeftRight className="w-5 h-5" />
                        <h3 className="font-semibold text-white">{t('admin.withdrawal_history')}</h3>
                    </div>
                    <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden">
                        <UserWithdrawHistory userId={id} />
                    </div>
                </div>

            </div>

        </div>
    );
}

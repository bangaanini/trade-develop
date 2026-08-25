"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, FileText, Shield } from "lucide-react";

interface UserKYCStatusProps {
  userId: string;
}

interface KYCData {
  id: string;
  full_name: string;
  address: string;
  phone: string;
  id_card_filename: string;
  status: string;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export default function UserKYCStatus({ userId }: UserKYCStatusProps) {
  const [kyc, setKyc] = useState<KYCData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKYC();
  }, [userId]);

  async function loadKYC() {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`);
      if (res.ok) {
        const data = await res.json();
        setKyc(data.kyc);
      }
    } catch (e) {
      console.error("Failed to load KYC", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-gray-500 text-sm">Loading KYC status...</div>
    );
  }

  if (!kyc) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3 text-gray-400">
          <Shield className="w-5 h-5" />
          <div>
            <p className="font-medium">No KYC Submission</p>
            <p className="text-xs text-gray-500">User has not submitted KYC verification</p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      label: "Pending Review",
    },
    approved: {
      icon: CheckCircle2,
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-400",
      label: "Approved ✓",
    },
    rejected: {
      icon: XCircle,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Rejected",
    },
  };

  const config = statusConfig[kyc.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <>
      <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Icon className={`w-6 h-6 ${config.text} mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className={`font-semibold ${config.text}`}>KYC {config.label}</p>
              </div>
              <p className="text-sm text-gray-400">
                Submitted: {new Date(kyc.submitted_at).toLocaleDateString()}
              </p>
              {kyc.reviewed_at && (
                <p className="text-xs text-gray-500">
                  Reviewed: {new Date(kyc.reviewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
          >
            {showDetails ? "Hide" : "Show"} Details
          </button>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Full Name</p>
                <p className="text-white font-medium">{kyc.full_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Phone</p>
                <p className="text-white font-medium">{kyc.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1">Address</p>
              <p className="text-white text-sm">{kyc.address}</p>
            </div>

            {kyc.admin_note && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-xs text-red-400 font-medium mb-1">Admin Note:</p>
                <p className="text-sm text-gray-300">{kyc.admin_note}</p>
              </div>
            )}

            <div>
              <p className="text-gray-500 text-xs mb-2">ID Card Image</p>
              <img
                src={`/api/uploads/kyc/${kyc.id_card_filename}`}
                alt="ID Card"
                className="max-w-sm rounded border border-gray-700"
              />
            </div>

            <a
              href="/admin/kyc"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              <FileText className="w-4 h-4" />
              Review in KYC Panel →
            </a>
          </div>
        )}
      </div>
    </>
  );
}

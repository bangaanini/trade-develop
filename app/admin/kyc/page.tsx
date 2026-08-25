"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, FileText, User, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAdmin } from "@/components/admin/AdminContext";
import { toast } from "react-hot-toast";

interface KYCSubmission {
  id: string;
  user_id: string;
  email: string;
  name: string;
  id_card_number: string;
  id_card_front_filename: string;
  id_card_back_filename: string;
  status: string;
  admin_note: string | null;
  submitted_at: string;
}

export default function AdminKYCPage() {
  const { role } = useAdmin();
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSubmissions() {
    try {
      const res = await fetch("/api/admin/kyc");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error("Failed to load KYC submissions", e);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function handleAction(action: "approve" | "reject") {
    if (!selectedKYC) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: selectedKYC.id,
          action,
          adminNote: adminNote || null,
        }),
      });

      if (res.ok) {
        toast.success(t('admin.kyc_success'));
        setSelectedKYC(null);
        setAdminNote("");
        loadSubmissions();
      } else {
        toast.error(t('admin.kyc_fail'));
      }
    } catch (e) {
      toast.error("Error processing KYC");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.delete_confirm'))) return;

    try {
      const res = await fetch(`/api/admin/kyc?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("KYC deleted successfully");
        loadSubmissions();
        if (selectedKYC?.id === id) setSelectedKYC(null);
      } else {
        toast.error("Failed to delete KYC");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting KYC");
    }
  }


  if (role !== "superadmin") {
    return <div className="text-red-400 p-6">Access denied</div>;
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('admin.pending_kyc')}
          value={pendingCount}
          icon={Clock}
          color="bg-orange-500"
          alert={pendingCount > 0}
        />
        <StatCard
          title={t('admin.approved')}
          value={submissions.filter((s) => s.status === "approved").length}
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <StatCard
          title={t('admin.rejected')}
          value={submissions.filter((s) => s.status === "rejected").length}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      {/* KYC List */}
      <div className="bg-[#1f2937] border border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            {t('admin.kyc_submissions')}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111827] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('auth.email')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('admin.profile_info')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('admin.id_card_number')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('admin.status')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('admin.date')}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">{t('admin.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('admin.no_kyc')}
                  </td>
                </tr>
              )}
              {submissions.map((kyc) => (
                <tr
                  key={kyc.id}
                  className="hover:bg-[#1a1f2e] transition cursor-pointer"
                  onClick={() => setSelectedKYC(kyc)}
                >
                  <td className="px-6 py-4 text-sm">{kyc.email}</td>
                  <td className="px-6 py-4 text-sm font-medium">{kyc.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{kyc.id_card_number}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={kyc.status} t={t} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(kyc.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedKYC(kyc);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                      {t('admin.review')} →
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(kyc.id);
                        }}
                        className="ml-3 text-red-500 hover:text-red-400"
                        title={t('admin.delete')}
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Detail Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1f2937] border border-gray-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedKYC.name}</h3>
                  <p className="text-gray-400">{selectedKYC.email}</p>
                </div>
                <button
                  onClick={() => setSelectedKYC(null)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label={t('admin.profile_info')} value={selectedKYC.name} />
                <InfoField label={t('admin.id_card_number')} value={selectedKYC.id_card_number} />
                <InfoField label={t('admin.status')} value={<StatusBadge status={selectedKYC.status} t={t} />} />
                <InfoField
                  label={t('admin.date')}
                  value={new Date(selectedKYC.submitted_at).toLocaleString()}
                />
              </div>

              {/* ID Card Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.id_card_front')}</label>
                  <img
                    src={`/api/uploads/kyc/${selectedKYC.id_card_front_filename}`}
                    alt="ID Card Front"
                    className="max-w-full rounded-lg border border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('admin.id_card_back')}</label>
                  <img
                    src={`/api/uploads/kyc/${selectedKYC.id_card_back_filename}`}
                    alt="ID Card Back"
                    className="max-w-full rounded-lg border border-gray-700"
                  />
                </div>
              </div>

              {/* Admin Note (if rejected) */}
              {selectedKYC.admin_note && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-400 mb-1">{t('admin.admin_note')}:</p>
                  <p className="text-sm text-gray-300">{selectedKYC.admin_note}</p>
                </div>
              )}

              {/* Actions (only for pending) */}
              {selectedKYC.status === "pending" && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t('admin.admin_note')}
                    </label>
                    <textarea
                      className="w-full p-3 bg-[#111827] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder={t('admin.reason_rejection')}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      {t('admin.reject')}
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {t('admin.approve')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
  return (
    <div className="relative p-6 bg-[#1f2937] border border-gray-700 rounded-xl shadow-lg hover:border-gray-600 transition overflow-hidden group">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-opacity-20 ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold relative z-10">{value}</p>

      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition ${color}`}
      />

      {alert && (
        <span className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const config = {
    pending: { bg: "bg-orange-500/20", text: "text-orange-400", label: t?.('admin.pending') || "Pending" },
    approved: { bg: "bg-green-500/20", text: "text-green-400", label: t?.('admin.approved') || "Approved" },
    rejected: { bg: "bg-red-500/20", text: "text-red-400", label: t?.('admin.rejected') || "Rejected" },
  };

  const { bg, text, label } = config[status as keyof typeof config] || config.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

function InfoField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}

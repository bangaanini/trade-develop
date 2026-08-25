"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, User, Calendar, Tag, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

interface Ticket {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const res = await fetch("/api/admin/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      console.error("Failed to load tickets", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.delete_confirm'))) return;

    try {
      const res = await fetch(`/api/admin/tickets?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Ticket deleted successfully");
        setTickets((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error("Failed to delete ticket");
      }
    } catch (e) {
      console.error("Error deleting ticket:", e);
      toast.error("Error deleting ticket");
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      in_progress: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      closed: "bg-green-500/20 text-green-500 border-green-500/30",
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.support_tickets')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.manage_tickets')}
          </p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('admin.no_tickets')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_id')}</th>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_user')}</th>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_title')}</th>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_status')}</th>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_date')}</th>
                  <th className="text-left p-4 text-sm font-semibold">{t('admin.ticket_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/10 transition">
                    <td className="p-4">
                      <span className="text-xs font-mono text-muted-foreground">
                        {ticket.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{ticket.user_email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.content}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                        <Tag className="w-3 h-3" />
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toast(`View details: ${ticket.title}\n\n${ticket.content}`, { 
                          icon: '📝',
                          duration: 6000
                        })}
                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded text-xs font-semibold transition"
                      >
                        {t('admin.view_ticket')}
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="ml-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded text-xs font-semibold transition"
                        title={t('admin.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

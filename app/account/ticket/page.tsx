"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "react-hot-toast";

export default function SubmitTicketPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length > 255) {
      toast.error("Title must be 255 characters or less");
      return;
    }
    
    if (content.length < 10) {
      toast.error(t('ticket.min_chars'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('ticket.success'));
        setTitle("");
        setContent("");
        router.push("/account");
      } else {
        toast.error(`❌ ${data.error}`);
      }
    } catch (err: any) {
      toast.error("❌ Failed to submit ticket: " + err.message);
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
          <h1 className="text-xl font-bold">{t('ticket.title')}</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-6">
        
        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-400">
                {t('ticket.need_help')}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('ticket.form_title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ticket.placeholder_title')}
              className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              required
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/255 {t('ticket.chars')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t('ticket.content')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('ticket.placeholder_content')}
              className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
              minLength={10}
              rows={8}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('ticket.min_chars')} ({content.length} {t('ticket.chars')})
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !title || content.length < 10}
            className="w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.processing') : t('ticket.submit')}
          </button>
        </form>

      </div>
    </div>
  );
}

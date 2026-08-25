"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: string;
  message: string;
  senderType: "user" | "admin";
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch("/api/chat/session");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          setError("Failed to initialize chat session");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSessionId(data.sessionId);
        setLoading(false);
      } catch (err) {
        setError("Connection error");
        setLoading(false);
      }
    }

    initSession();
  }, [router]);

  // Fetch messages (polling every 3 seconds)
  useEffect(() => {
    if (!sessionId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          
          // Mark admin messages as read
          await fetch("/api/chat/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [sessionId]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !sessionId || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send message");
        setSending(false);
        return;
      }

      setNewMessage("");
      // Message will appear via polling
    } catch (err) {
      setError("Connection error");
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400">{t('chat.loading_chat')}</p>
        </div>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition"
          >
            {t('chat.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col h-[calc(100dvh-4rem)] md:h-auto md:min-h-screen pt-[env(safe-area-inset-top)] -mb-16 md:mb-0">
      {/* Header */}
      <div className="bg-[#1e293b] border-b border-gray-700 shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <MessageCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{t('chat.live_chat_support')}</h1>
            <p className="text-sm text-gray-400">{t('chat.contact_admin')}</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto px-0 md:px-4 md:py-6">
        <div className="bg-[#1e293b] md:rounded-xl md:border md:border-gray-700 md:shadow-xl overflow-hidden flex flex-col h-full md:h-[calc(100vh-200px)]">
          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('chat.start_conversation')}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${msg.senderType === "user" ? "order-2" : "order-1"}`}>
                    {msg.senderType === "admin" && (
                      <p className="text-xs text-gray-400 mb-1 ml-2">
                        {msg.senderName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.senderType === "user"
                          ? "bg-linear-to-r from-yellow-500 to-orange-500 text-black"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap wrap-break-word">
                        {msg.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-2">
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4 bg-[#111827]">
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setNewMessage(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={t('chat.type_message')}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                rows={1}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              {newMessage.length}/1000 {t('chat.characters_left')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

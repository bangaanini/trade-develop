"use client";

import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, Loader2, CheckCheck, User, Trash2, Pencil, X, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAdmin } from "@/components/admin/AdminContext";

interface ChatSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
  lastMessage: string;
}

interface Message {
  id: string;
  message: string;
  senderType: "user" | "admin";
  senderName: string;
  isRead: boolean;
  createdAt: string;
  isEdited?: boolean;
  editedAt?: string | null;
}

export default function AdminChatPage() {
  const { t } = useLanguage();
  const { role } = useAdmin();
  const isSuperAdmin = role === "superadmin";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTime, setEditTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!editingId) scrollToBottom();
  }, [messages, editingId]);

  // Fetch sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch(`/api/admin/chat/sessions?status=${statusFilter}`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
      setLoading(false);
    }

    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [statusFilter]);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    async function fetchMessages() {
      if (!selectedSession) return; // Guard against null during async operations

      try {
        const res = await fetch(`/api/chat/messages?sessionId=${selectedSession.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);

          // Mark messages as read
          await fetch("/api/chat/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: selectedSession.id }),
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [selectedSession]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || sending) return;

    setSending(true);

    try {
      const res = await fetch("/api/admin/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Message will appear via polling
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Close session
  const handleCloseSession = async () => {
    if (!selectedSession) return;

    const confirmed = confirm(t('admin.close_session_confirm'));
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSession.id }),
      });

      if (res.ok) {
        setSelectedSession(null);
        // Sessions will refresh via polling
      }
    } catch (err) {
      console.error("Error closing session:", err);
    }
  };

  // Delete session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm(t('admin.delete_confirm'))) return;

    try {
      const res = await fetch(`/api/admin/chat/delete?sessionId=${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedSession?.id === sessionId) setSelectedSession(null);
        // Sessions will refresh via polling
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  // Begin editing a message (superadmin)
  const beginEditMessage = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.message);
    // Convert ISO to local datetime-local string (YYYY-MM-DDTHH:mm)
    const d = new Date(msg.createdAt);
    const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
    const local = new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 16);
    setEditTime(local);
  };

  const cancelEditMessage = () => {
    setEditingId(null);
    setEditText("");
    setEditTime("");
  };

  // Save edited message
  const saveEditMessage = async () => {
    if (!editingId) return;
    const trimmed = editText.trim();
    if (!trimmed || savingEdit) return;

    const original = messages.find((m) => m.id === editingId);
    const payload: Record<string, any> = {
      messageId: editingId,
      message: trimmed,
    };

    if (editTime) {
      const localDate = new Date(editTime);
      if (!isNaN(localDate.getTime())) {
        const originalIso = original ? new Date(original.createdAt).toISOString() : null;
        const newIso = localDate.toISOString();
        if (originalIso !== newIso) payload.createdAt = newIso;
      }
    }

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/chat/message", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setMessages((prev) =>
          prev
            .map((m) =>
              m.id === editingId
                ? {
                    ...m,
                    message: updated.message,
                    createdAt: updated.createdAt,
                    isEdited: true,
                    editedAt: updated.editedAt,
                  }
                : m
            )
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
        );
        cancelEditMessage();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to edit message");
      }
    } catch (err) {
      console.error("Error editing message:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message permanently? This cannot be undone.")) return;

    setDeletingId(messageId);
    try {
      const res = await fetch(`/api/admin/chat/message?messageId=${messageId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (editingId === messageId) cancelEditMessage();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <MessageCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('admin.live_chat_title')}</h1>
            <p className="text-sm text-gray-400">{t('admin.live_chat_desc')}</p>
          </div>
        </div>
        {isSuperAdmin && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            Superadmin: edit/delete enabled
          </span>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 bg-[#1f2937] border border-gray-700 rounded-xl overflow-hidden">
          {/* Filter Tabs */}
          <div className="border-b border-gray-700 p-2 flex gap-2">
            {[t('admin.chat_open'), t('admin.chat_closed'), t('admin.chat_all')].map((filter, index) => {
               const rawFilter = ["open", "closed", "all"][index];
               return (
                <button
                  key={rawFilter}
                  onClick={() => setStatusFilter(rawFilter)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    statusFilter === rawFilter
                      ? "bg-yellow-500 text-black"
                      : "text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {filter}
                </button>
               )
            })}
          </div>

          {/* Sessions */}
          <div className="max-h-[600px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {statusFilter !== "all" ? statusFilter : ""} chats</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full p-4 border-b border-gray-700 hover:bg-gray-800 transition text-left cursor-pointer group ${
                    selectedSession?.id === session.id ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-700 rounded-full">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-white truncate">
                          {session.userName}
                        </p>
                        {session.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-1">
                        {session.userEmail}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.lastMessage || t('admin.no_messages')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatTime(session.lastMessageAt)}
                      </p>
                    </div>
                    {/* Delete Action */}
                    <div className="flex flex-col justify-center">
                        <button
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Panel */}
        <div className="lg:col-span-2 bg-[#1f2937] border border-gray-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
          {selectedSession ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-700 rounded-full">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedSession.userName}</p>
                    <p className="text-xs text-gray-400">{selectedSession.userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseSession}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm transition"
                >
                  {t('admin.close_chat')}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>{t('admin.no_messages')}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderType === "admin";
                    const isEditingThis = editingId === msg.id;
                    return (
                      <div
                        key={msg.id}
                        className={`group flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[70%]">
                          {!isAdmin && (
                            <p className="text-xs text-gray-400 mb-1 ml-2">{msg.senderName}</p>
                          )}

                          {isEditingThis ? (
                            <div className="bg-gray-800 border border-yellow-500/40 rounded-2xl p-2">
                              <textarea
                                value={editText}
                                onChange={(e) => {
                                  if (e.target.value.length <= 1000) setEditText(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    saveEditMessage();
                                  }
                                  if (e.key === "Escape") cancelEditMessage();
                                }}
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                disabled={savingEdit}
                                autoFocus
                              />
                              <div className="mt-2 flex items-center gap-2">
                                <label className="text-[10px] text-gray-400 shrink-0">Sent at</label>
                                <input
                                  type="datetime-local"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  disabled={savingEdit}
                                  className="flex-1 min-w-0 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-gray-500">{editText.length}/1000</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={cancelEditMessage}
                                    disabled={savingEdit}
                                    className="px-2 py-1 text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" /> Cancel
                                  </button>
                                  <button
                                    onClick={saveEditMessage}
                                    disabled={savingEdit || !editText.trim()}
                                    className="px-2.5 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold rounded transition flex items-center gap-1"
                                  >
                                    {savingEdit ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div
                                className={`px-4 py-2.5 rounded-2xl ${
                                  isAdmin
                                    ? "bg-linear-to-r from-yellow-500 to-orange-500 text-black"
                                    : "bg-gray-700 text-white"
                                } ${deletingId === msg.id ? "opacity-50" : ""}`}
                              >
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                              </div>

                              {isSuperAdmin && (
                                <div
                                  className={`absolute top-1/2 -translate-y-1/2 ${
                                    isAdmin ? "right-full mr-2" : "left-full ml-2"
                                  } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition`}
                                >
                                  <button
                                    onClick={() => beginEditMessage(msg)}
                                    className="p-1.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:text-yellow-400 hover:border-yellow-500/40"
                                    title="Edit message"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    disabled={deletingId === msg.id}
                                    className="p-1.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:text-red-400 hover:border-red-500/40 disabled:opacity-50"
                                    title="Delete message"
                                  >
                                    {deletingId === msg.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-1 ml-2 flex items-center gap-1">
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {msg.isEdited && (
                              <span
                                className="italic text-gray-500"
                                title={msg.editedAt ? `Edited ${formatMessageTime(msg.editedAt)}` : "Edited"}
                              >
                                · edited
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-700 p-4 bg-[#111827]">
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
                    placeholder={t('admin.type_reply')}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    rows={2}
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

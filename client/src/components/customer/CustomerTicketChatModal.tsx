import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  UserCheck,
  Clock,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import type { Ticket, Message } from "../../types";
import { api } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface CustomerTicketChatModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export const CustomerTicketChatModal: React.FC<CustomerTicketChatModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onTicketUpdated,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen || !ticket?._id) return;

    let isMounted = true;
    setLoading(true);

    const loadMessages = async () => {
      try {
        const res = await api.tickets.getMessages(ticket._id);
        if (isMounted) {
          // Filter to only customer-visible messages
          const visible = (res.messages || []).filter(
            (m) => m.visibility === "customer"
          );
          setMessages(visible);
        }
      } catch (err) {
        console.error("Failed to load ticket messages:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMessages();

    // Setup real-time Socket.io listeners
    const socket = getSocket();
    socket.emit("ticket:join", { ticketId: ticket._id });

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.visibility === "customer") {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        onTicketUpdated?.();
      }
    };

    const handleTypingUpdate = (data: {
      ticketId: string;
      userName: string;
      userRole: string;
      isTyping: boolean;
    }) => {
      if (data.ticketId === ticket._id && data.userRole !== "customer") {
        setAgentTyping(data.isTyping ? data.userName || "Priya Sharma" : null);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTypingUpdate);

    return () => {
      isMounted = false;
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTypingUpdate);
      socket.emit("ticket:leave", { ticketId: ticket._id });
    };
  }, [isOpen, ticket?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!ticket) return;

    const socket = getSocket();
    socket.emit("typing:start", { ticketId: ticket._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { ticketId: ticket._id });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !ticket || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    const socket = getSocket();
    socket.emit("typing:stop", { ticketId: ticket._id });

    try {
      const res = await api.tickets.sendMessage(ticket._id, {
        body: text,
        visibility: "customer",
      });

      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
      }
      onTicketUpdated?.();
    } catch (err) {
      console.error("Failed to send ticket reply:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !ticket) return null;

  // Derive assigned agent display name
  const assignedAgentName =
    typeof ticket.assignedAgentId === "object" && ticket.assignedAgentId
      ? (ticket.assignedAgentId as any).name || "Priya Sharma"
      : "Priya Sharma (Support Specialist)";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl h-[88vh] max-h-[720px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${t.card}`}
      >
        {/* 1. Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${t.divider} ${t.cardMuted}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-md border ${
                t.isDark
                  ? "bg-[#382f1c] text-[#f5e7bf] border-[#5a4827]"
                  : "bg-emerald-600 text-white border-emerald-500"
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-mono text-xs font-black ${t.accentText}`}>
                  {ticket.ticketNumber}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    ticket.status === "in_progress"
                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                      : ticket.status === "resolved" || ticket.status === "closed"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {ticket.status.replace("_", " ")}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20 uppercase">
                  {ticket.priority} Priority
                </span>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base tracking-tight truncate max-w-xs sm:max-w-md pt-0.5">
                {ticket.subject}
              </h3>

              <div className="flex items-center gap-2 text-[10px] opacity-75 pt-0.5">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>Assigned Agent: {assignedAgentName}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-current/10 transition active:scale-90"
            title="Close conversation"
          >
            <X className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>
        </div>

        {/* 2. Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-60 space-y-2 py-12">
              <Clock className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs font-semibold">Connecting to live ticket room & loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70 space-y-2">
              <MessageCircle className="w-10 h-10 opacity-30 mx-auto" />
              <p className="font-bold text-sm">No messages yet in this ticket.</p>
              <p className="text-xs opacity-75 max-w-sm">
                Say hello to Priya Sharma below to start your live conversation.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isCust = m.senderRole === "customer";
              const isAgent = m.senderRole === "agent" || m.senderRole === "admin";

              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isCust ? "items-end" : "items-start"}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 text-[10px] opacity-60 mb-1 px-1">
                    {isCust ? (
                      <span>You ({user?.name || "Aman Gupta"})</span>
                    ) : isAgent ? (
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Priya Sharma (Support Specialist)</span>
                      </span>
                    ) : (
                      <span className="font-bold flex items-center gap-1 text-blue-500">
                        <Sparkles className="w-3 h-3" />
                        <span>ShopEase AI Bot</span>
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                      isCust
                        ? t.isDark
                          ? "bg-[#382f1c] text-[#f5e7bf] rounded-br-xs border border-[#554627]"
                          : "bg-emerald-600 text-white rounded-br-xs"
                        : isAgent
                        ? t.isDark
                          ? "bg-[#1f1d19] text-neutral-100 rounded-bl-xs border border-[#3b3626]"
                          : "bg-white text-neutral-900 rounded-bl-xs border border-neutral-200 shadow-xs"
                        : t.isDark
                        ? "bg-[#181d24] text-blue-100 rounded-bl-xs border border-blue-900/40"
                        : "bg-blue-50 text-blue-950 rounded-bl-xs border border-blue-200"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {agentTyping && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{agentTyping} is typing a response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Reply Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className={`p-3 sm:p-4 border-t flex items-center gap-2.5 shrink-0 ${t.divider} ${t.cardMuted}`}
        >
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${assignedAgentName}... (Press Enter to send)`}
            className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none font-semibold ${t.input}`}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${t.primaryButton}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

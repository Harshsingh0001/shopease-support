import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Lock,
  Sparkles,
  Send,
  Search,
  ArrowLeft,
} from "lucide-react";
import type { Ticket, Message, TicketStatus } from "../../types";
import { api } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface TicketQueueViewProps {
  tickets: Ticket[];
  onRefreshTickets: () => void;
  selectedTicket: Ticket | null;
  onSelectTicket: (t: Ticket | null) => void;
}

export const TicketQueueView: React.FC<TicketQueueViewProps> = ({
  tickets,
  onRefreshTickets,
  selectedTicket,
  onSelectTicket,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [visibility, setVisibility] = useState<"customer" | "internal_note">("customer");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket._id);
    } else {
      setMessages([]);
    }
  }, [selectedTicket]);

  const loadMessages = async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const res = await api.tickets.getMessages(ticketId);
      setMessages(res.messages);
    } catch (err) {
      console.error("Failed to load ticket messages", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedTicket) return;

    try {
      await api.tickets.sendMessage(selectedTicket._id, {
        body: replyInput.trim(),
        visibility,
      });
      setReplyInput("");
      loadMessages(selectedTicket._id);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedTicket) return;
    setAiDraftLoading(true);
    try {
      const res = await api.ai.generateDraft(selectedTicket._id);
      setReplyInput(res.draftReply);
    } catch (err) {
      alert("Failed to generate AI draft");
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!selectedTicket) return;
    try {
      await api.tickets.update(selectedTicket._id, { status: newStatus });
      onRefreshTickets();
      onSelectTicket({ ...selectedTicket, status: newStatus });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredTickets = tickets.filter((tkt) => {
    const matchesStatus = statusFilter === "all" || tkt.status === statusFilter;
    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      tkt.subject.toLowerCase().includes(search.toLowerCase()) ||
      (tkt.customerId?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex overflow-hidden h-full relative">
      {/* Left Column: Tickets Queue List */}
      <div
        className={`${
          selectedTicket ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0 ${t.divider} ${t.cardMuted}`}
      >
        {/* Search & Filter Header */}
        <div className={`p-3 border-b space-y-2 shrink-0 ${t.divider}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Support Queue ({filteredTickets.length})
            </span>
            <button
              onClick={onRefreshTickets}
              className={`text-[11px] font-bold hover:underline ${t.accentText}`}
            >
              Refresh
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, customer, subject..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl focus:outline-none ${t.input}`}
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap transition ${
                  statusFilter === st ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className={`flex-1 overflow-y-auto divide-y ${t.divider}`}>
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-50">No tickets found.</div>
          ) : (
            filteredTickets.map((tkt) => {
              const isSelected = selectedTicket?._id === tkt._id;
              return (
                <button
                  key={tkt._id}
                  type="button"
                  onClick={() => onSelectTicket(tkt)}
                  className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                    isSelected
                      ? t.isDark
                        ? "bg-[#28251e] border-l-4 border-[#d9a83e] text-[#f5e7bf]"
                        : "bg-[#D2DCE6]/40 border-l-4 border-[#AB644B] text-[#AB644B]"
                      : t.isDark
                      ? "hover:bg-[#201f1a]"
                      : "hover:bg-[#D2DCE6]/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold ${t.accentText}`}>
                      {tkt.ticketNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        tkt.status === "open"
                          ? t.badgeWarning
                          : tkt.status === "in_progress"
                          ? t.badgeInfo
                          : t.badgeSuccess
                      }`}
                    >
                      {tkt.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-xs font-semibold line-clamp-1">{tkt.subject}</div>

                  <div className="flex items-center justify-between text-[10px] opacity-65">
                    <span>Customer: {tkt.customerId?.name || "Customer"}</span>
                    <span>{new Date(tkt.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Ticket Conversation & Dual-Visibility Composer */}
      <div
        className={`${
          selectedTicket ? "flex" : "hidden md:flex"
        } flex-1 flex-col overflow-hidden w-full h-full ${t.card}`}
      >
        {selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 ${t.divider} ${t.cardMuted}`}>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => onSelectTicket(null)}
                  className="md:hidden p-1 rounded-lg opacity-70 hover:opacity-100"
                  title="Back to queue"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${t.accentText}`}>
                      {selectedTicket.ticketNumber}
                    </span>
                    <h2 className="text-xs sm:text-sm font-bold truncate">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                  <div className="text-[11px] opacity-70 truncate mt-0.5 flex items-center gap-2">
                    <span>Customer: {selectedTicket.customerId?.name}</span>
                    <span>•</span>
                    <span>Priority: <strong className="uppercase">{selectedTicket.priority}</strong></span>
                    {selectedTicket.orderId && (
                      <>
                        <span>•</span>
                        <span className={t.accentText}>Order: {selectedTicket.orderId.orderNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-xs opacity-70 font-semibold">Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className={`text-xs px-2.5 py-1 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting on Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="p-8 text-center text-xs opacity-50">Loading conversation...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-xs opacity-50">No messages yet.</div>
              ) : (
                messages.map((m) => {
                  const isInternal = m.visibility === "internal_note";
                  const isCustomer = m.senderRole === "customer";
                  const isAi = m.senderRole === "ai";

                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col ${
                        isInternal
                          ? "items-center"
                          : isCustomer
                          ? "items-start"
                          : "items-end"
                      }`}
                    >
                      <div
                        className={`max-w-lg rounded-2xl p-3 text-xs shadow-sm ${
                          isInternal
                            ? "bg-amber-950/30 border border-amber-500/40 text-amber-300 w-full"
                            : isAi
                            ? t.chatBubbleAi
                            : isCustomer
                            ? t.chatBubbleCustomer
                            : t.chatBubbleStaff
                        }`}
                      >
                        {isInternal && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-wider">
                            <Lock className="w-3 h-3" />
                            <span>Confidential Internal Staff Note</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                          <span className="font-semibold">
                            {m.senderId?.name || (isAi ? "ShopEase AI" : m.senderRole)}
                          </span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="whitespace-pre-wrap">{m.body}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dual Visibility Composer */}
            <form
              onSubmit={handleSendMessage}
              className={`p-3 sm:p-3.5 border-t shrink-0 ${t.divider} ${t.cardMuted}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
                {/* Radio Visibility Selector */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "customer"}
                      onChange={() => setVisibility("customer")}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <span className="font-semibold text-[11px] sm:text-xs">Public Customer Reply</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-500 font-bold">
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "internal_note"}
                      onChange={() => setVisibility("internal_note")}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs">
                      <Lock className="w-3 h-3" /> Confidential Staff Note
                    </span>
                  </label>
                </div>

                {/* AI Copilot Draft Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={aiDraftLoading}
                  className={`self-start sm:self-auto px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition ${
                    t.isDark
                      ? "bg-[#382f1c] hover:bg-[#483d25] text-[#f5e7bf] border-[#d9a83e]/50"
                      : "bg-[#AB644B]/15 hover:bg-[#AB644B]/25 text-[#AB644B] border-[#AB644B]/30"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiDraftLoading ? "Generating..." : "⚡ AI Copilot Draft"}</span>
                </button>
              </div>

              {/* Message Input & Send */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={
                    visibility === "internal_note"
                      ? "Write confidential internal diagnostic note..."
                      : "Type reply to customer..."
                  }
                  className={`flex-1 px-3.5 py-2 text-xs rounded-xl focus:outline-none transition ${t.input}`}
                />

                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className={`p-2 rounded-xl transition disabled:opacity-40 ${t.primaryButton}`}
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-xs opacity-50 gap-2 p-6 text-center">
            <MessageCircle className="w-10 h-10 opacity-30" />
            <span>Select a ticket from the left queue to open the conversation</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Search,
  Lock,
  Sparkles,
  Send,
  User,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import type { Ticket, Message, Order } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { INITIAL_CUSTOMERS } from "../../utils/mockCrmData";

interface CrmInboxViewProps {
  tickets: Ticket[];
  orders: Order[];
  onRefreshTickets: () => void;
}

export const CrmInboxView: React.FC<CrmInboxViewProps> = ({
  tickets,
  orders,
  onRefreshTickets,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [visibility, setVisibility] = useState<"customer" | "internal_note">("customer");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [inboxFilter, setInboxFilter] = useState<
    "all" | "unassigned" | "mine" | "escalated" | "closed"
  >("all");
  const [showMobileContext, setShowMobileContext] = useState(false);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket._id);
    } else if (tickets.length > 0) {
      setSelectedTicket(tickets[0]);
    }
  }, [selectedTicket?._id]);

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
      onRefreshTickets();
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
      alert("Failed to generate AI draft reply");
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!selectedTicket) return;
    try {
      await api.tickets.update(selectedTicket._id, { status: newStatus });
      onRefreshTickets();
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    } catch (err) {
      alert("Failed to update ticket status");
    }
  };

  // Filter conversations
  const filteredTickets = tickets.filter((tkt) => {
    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      tkt.subject.toLowerCase().includes(search.toLowerCase()) ||
      (tkt.customerId?.name || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (inboxFilter === "unassigned") return !tkt.assignedAgentId;
    if (inboxFilter === "mine") return tkt.assignedAgentId?.email === user?.email;
    if (inboxFilter === "escalated") return tkt.priority === "urgent" || tkt.priority === "high";
    if (inboxFilter === "closed") return tkt.status === "closed" || tkt.status === "resolved";
    return true;
  });

  // Customer Context 360 lookup
  const currentCustomerEmail = selectedTicket?.customerId?.email || "";
  const matchedCustomerProfile =
    INITIAL_CUSTOMERS.find((c) => c.email.toLowerCase() === currentCustomerEmail.toLowerCase()) || {
      _id: "c-guest",
      name: selectedTicket?.customerId?.name || "Customer",
      email: currentCustomerEmail,
      phone: "+91 98765 43210",
      preferredLanguage: selectedTicket?.customerId?.preferredLanguage || "en",
      totalOrders: 3,
      totalSpend: 8497,
      openTickets: 1,
      registeredAt: "2026-01-15T00:00:00Z",
      status: "active" as const,
    };

  const customerOrders = orders.filter(
    (o) =>
      (o as any).customerId?.email?.toLowerCase() === currentCustomerEmail.toLowerCase() ||
      (o as any).customerId === selectedTicket?.customerId?._id ||
      orders.length <= 4
  );

  return (
    <div className="flex-1 flex overflow-hidden h-full select-none">
      {/* ===================================================================
          COLUMN 1: CONVERSATION LIST (Left)
          =================================================================== */}
      <div
        className={`${
          selectedTicket ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-88 border-r flex flex-col shrink-0 ${t.divider} ${t.cardMuted}`}
      >
        {/* Search & Inbox Header */}
        <div className={`p-4 border-b space-y-3 shrink-0 ${t.divider}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              <MessageCircle className={`w-4 h-4 ${t.accentText}`} />
              <span>CRM Support Inbox ({filteredTickets.length})</span>
            </h2>
            <button
              onClick={onRefreshTickets}
              className={`text-[11px] font-bold hover:underline ${t.accentText}`}
            >
              Refresh
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations, customer, ID..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none ${t.input}`}
            />
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold">
            {[
              { id: "all", label: "All" },
              { id: "unassigned", label: "Unassigned" },
              { id: "mine", label: "Mine" },
              { id: "escalated", label: "Escalated" },
              { id: "closed", label: "Closed" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setInboxFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg uppercase whitespace-nowrap transition ${
                  inboxFilter === f.id ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items List */}
        <div className={`flex-1 overflow-y-auto divide-y ${t.divider}`}>
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-50">No matching conversations.</div>
          ) : (
            filteredTickets.map((tkt) => {
              const isSelected = selectedTicket?._id === tkt._id;

              return (
                <div
                  key={tkt._id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-3.5 cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? t.isDark
                        ? "bg-[#28251e] border-l-4 border-[#d9a83e] text-[#f5e7bf]"
                        : "bg-[#eaf4ee] border-l-4 border-[#059669] text-[#059669]"
                      : t.isDark
                      ? "hover:bg-[#201f1a]"
                      : "hover:bg-[#f2f7f3]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-black ${t.accentText}`}>
                        {tkt.ticketNumber}
                      </span>
                      <span className="text-[10px] opacity-40">•</span>
                      <span className="font-bold text-xs truncate max-w-[120px]">
                        {tkt.customerId?.name || "Customer"}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        tkt.priority === "urgent" || tkt.priority === "high"
                          ? "bg-rose-500/20 text-rose-400"
                          : t.badgeHighlight
                      }`}
                    >
                      {tkt.priority}
                    </span>
                  </div>

                  <div className="text-xs font-semibold line-clamp-1">{tkt.subject}</div>

                  <div className="flex items-center justify-between text-[10px] opacity-65 pt-0.5">
                    <span className="capitalize">{tkt.category.replace("_", " ")}</span>
                    <span className="font-mono">
                      {new Date(tkt.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===================================================================
          COLUMN 2: CONVERSATION WORKSPACE (Center)
          =================================================================== */}
      <div
        className={`${
          selectedTicket ? "flex" : "hidden md:flex"
        } flex-1 flex-col overflow-hidden w-full h-full ${t.card}`}
      >
        {selectedTicket ? (
          <>
            {/* Conversation Header */}
            <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between gap-3 shrink-0 ${t.divider} ${t.cardMuted}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="md:hidden p-1 rounded-lg opacity-70 hover:opacity-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-black ${t.accentText}`}>
                      {selectedTicket.ticketNumber}
                    </span>
                    <h2 className="text-xs sm:text-sm font-bold truncate">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                  <div className="text-[11px] opacity-70 flex items-center gap-2 mt-0.5">
                    <span>Customer: <strong>{selectedTicket.customerId?.name}</strong></span>
                    <span>•</span>
                    <span>Channel: <strong>Web Chat</strong></span>
                  </div>
                </div>
              </div>

              {/* Status & Context Drawer Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-xl border focus:outline-none font-bold ${t.input}`}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_customer">Waiting on Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowMobileContext(!showMobileContext)}
                  className="lg:hidden p-1.5 rounded-xl border opacity-75 hover:opacity-100"
                  title="Toggle Customer 360 Context"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messagesLoading ? (
                <div className="p-12 text-center text-xs opacity-50 animate-pulse">
                  Loading conversation history & internal notes...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-xs opacity-50">No messages in this ticket yet.</div>
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
                        className={`max-w-xl rounded-2xl p-3.5 text-xs shadow-md leading-relaxed ${
                          isInternal
                            ? "bg-amber-950/40 border border-amber-500/50 text-amber-200 w-full max-w-lg"
                            : isAi
                            ? t.chatBubbleAi
                            : isCustomer
                            ? t.chatBubbleCustomer
                            : t.chatBubbleStaff
                        }`}
                      >
                        {isInternal && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 mb-1.5 uppercase tracking-wider">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Confidential Internal Staff Note (Blocked from Customer View)</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-70 mb-1 font-bold">
                          <span>
                            {m.senderId?.name || (isAi ? "ShopEase AI Copilot" : m.senderRole)}
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

            {/* AI Copilot Suggestion Pill Bar */}
            <div className={`px-4 py-2 border-t flex items-center justify-between gap-2 shrink-0 ${t.divider} bg-current/5`}>
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className={`w-3.5 h-3.5 ${t.accentText}`} />
                <span className="text-[11px] font-semibold opacity-75">AI Copilot:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={aiDraftLoading}
                  className={`text-[11px] font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-xs transition active:scale-95 ${t.secondaryButton}`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>{aiDraftLoading ? "Generating AI Draft..." : "Generate AI Reply"}</span>
                </button>
              </div>
            </div>

            {/* Dual Visibility Composer */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t space-y-2.5 shrink-0 ${t.divider} ${t.cardMuted}`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="inbox_visibility"
                      checked={visibility === "customer"}
                      onChange={() => setVisibility("customer")}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <span>Public Customer Reply</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-amber-500 font-black">
                    <input
                      type="radio"
                      name="inbox_visibility"
                      checked={visibility === "internal_note"}
                      onChange={() => setVisibility("internal_note")}
                      className="text-amber-500 focus:ring-0"
                    />
                    <Lock className="w-3.5 h-3.5" />
                    <span>Internal Staff Note</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={
                    visibility === "internal_note"
                      ? "Write a confidential staff note... (Audit logged, strictly hidden from customer)"
                      : "Type your reply to customer..."
                  }
                  className={`flex-1 px-3.5 py-2 text-xs rounded-2xl border focus:outline-none leading-relaxed ${t.input}`}
                />

                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className={`px-5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition disabled:opacity-40 ${
                    visibility === "internal_note"
                      ? "bg-amber-500 text-black font-extrabold"
                      : t.primaryButton
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-16 text-center text-xs opacity-50 m-auto">
            Select a conversation from the left to start replying.
          </div>
        )}
      </div>

      {/* ===================================================================
          COLUMN 3: CUSTOMER CONTEXT 360 (Right)
          =================================================================== */}
      <div
        className={`${
          showMobileContext ? "fixed inset-y-0 right-0 z-50 w-80 shadow-2xl" : "hidden lg:flex"
        } w-80 lg:w-88 border-l flex-col overflow-y-auto shrink-0 p-4 space-y-4 ${t.divider} ${t.cardMuted}`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-current/10">
          <h3 className="text-xs font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5">
            <User className={`w-4 h-4 ${t.accentText}`} />
            <span>Customer 360 Profile</span>
          </h3>

          {showMobileContext && (
            <button
              type="button"
              onClick={() => setShowMobileContext(false)}
              className="lg:hidden text-xs font-bold opacity-60"
            >
              Close
            </button>
          )}
        </div>

        {/* Customer Identity Card */}
        <div className={`p-4 rounded-2xl border space-y-2 ${t.card}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#124a38] text-white"
              }`}
            >
              {matchedCustomerProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-sm">{matchedCustomerProfile.name}</h4>
              <div className="text-[11px] opacity-70">{matchedCustomerProfile.email}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-current/10 grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-current/5">
              <div className="opacity-60">Total Spent</div>
              <div className={`font-black text-xs ${t.accentText}`}>
                ₹{matchedCustomerProfile.totalSpend.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="p-1.5 rounded-lg bg-current/5">
              <div className="opacity-60">Lifetime Orders</div>
              <div className="font-black text-xs">{matchedCustomerProfile.totalOrders} Orders</div>
            </div>
          </div>
        </div>

        {/* Customer Orders History */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider opacity-70 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Order History ({customerOrders.length})</span>
          </div>

          <div className="space-y-2">
            {customerOrders.slice(0, 3).map((ord) => (
              <div key={ord._id} className={`p-3 rounded-xl border text-xs space-y-1 ${t.card}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-mono font-black ${t.accentText}`}>{ord.orderNumber}</span>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                    {ord.status}
                  </span>
                </div>
                <div className="opacity-70 text-[11px]">
                  {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                </div>
                <div className="flex justify-between items-center pt-1 font-bold text-[11px]">
                  <span>Total: ₹{ord.totalAmount.toLocaleString("en-IN")}</span>
                  <span className="opacity-60 text-[10px] font-mono">
                    {ord.carrier || "Delhivery"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Support Tickets */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider opacity-70 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Support Tickets History</span>
          </div>

          <div className="space-y-2">
            {tickets
              .filter((tkt) => tkt.customerId?.email === currentCustomerEmail)
              .slice(0, 3)
              .map((tkt) => (
                <div
                  key={tkt._id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition hover:bg-current/5 ${t.card}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-[11px]">{tkt.ticketNumber}</span>
                    <span className="text-[9px] font-bold uppercase opacity-70">{tkt.status}</span>
                  </div>
                  <div className="font-semibold line-clamp-1">{tkt.subject}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

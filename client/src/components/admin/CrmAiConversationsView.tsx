import React, { useState } from "react";
import {
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flag,
  UserCheck,
  BookOpen,
  X,
} from "lucide-react";
import type { AiConversationLog } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { INITIAL_AI_CONVERSATIONS } from "../../utils/mockCrmData";

export const CrmAiConversationsView: React.FC = () => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [conversations, setConversations] = useState<AiConversationLog[]>(INITIAL_AI_CONVERSATIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "escalated" | "flagged">("all");
  const [selectedConv, setSelectedConv] = useState<AiConversationLog | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.query.toLowerCase().includes(search.toLowerCase()) ||
      c.conversationId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFlagAnswer = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, status: "flagged" as const } : c))
    );
    if (selectedConv?._id === convId) {
      setSelectedConv((prev) => (prev ? { ...prev, status: "flagged" as const } : null));
    }
    setActionSuccess("Conversation flagged for RAG knowledge refinement.");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleTransferToHuman = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, isEscalated: true, status: "escalated" as const } : c))
    );
    if (selectedConv?._id === convId) {
      setSelectedConv((prev) => (prev ? { ...prev, isEscalated: true, status: "escalated" as const } : null));
    }
    setActionSuccess("Conversation transferred to human agent queue (Priya Sharma notified).");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Bot className={`w-7 h-7 ${t.accentText}`} />
            <span>AI Supervision & Conversation Quality Center</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Supervise live AI interactions, review grounded source citations, and inspect escalation triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversation, customer, query..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${t.input}`}
            />
          </div>

          <div className="flex gap-1 border rounded-2xl p-0.5 shrink-0 text-xs">
            {["all", "resolved", "escalated", "flagged"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st as any)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition ${
                  statusFilter === st ? t.primaryButton : "opacity-60 hover:opacity-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Overview Metric Bar */}
      <div className={`p-4 rounded-3xl border grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm text-xs ${t.cardMuted} ${t.divider}`}>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Total AI Turns</div>
          <div className={`text-xl font-black ${t.accentText}`}>{conversations.length} Sessions</div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Autonomous Solved</div>
          <div className="text-xl font-black text-emerald-500">
            {conversations.filter((c) => c.status === "resolved").length} (75%)
          </div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Escalated to Staff</div>
          <div className="text-xl font-black text-amber-500">
            {conversations.filter((c) => c.status === "escalated").length} (25%)
          </div>
        </div>
        <div>
          <div className="opacity-60 font-semibold uppercase text-[10px]">Average Confidence</div>
          <div className="text-xl font-black text-blue-500">97.5% Score</div>
        </div>
      </div>

      {/* Conversations Grid / Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-xl ${t.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className={`border-b font-bold opacity-75 ${t.divider} ${t.cardMuted}`}>
                <th className="p-4">Session ID & Customer</th>
                <th className="p-4">Customer Query</th>
                <th className="p-4">Detected Intent</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Grounding Sources</th>
                <th className="p-4">Outcome Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center opacity-50">
                    No AI conversations match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredConversations.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setSelectedConv(c)}
                    className="hover:bg-current/5 transition cursor-pointer"
                  >
                    <td className="p-4">
                      <div className={`font-mono font-black ${t.accentText}`}>{c.conversationId}</div>
                      <div className="font-semibold text-[11px]">{c.customerName}</div>
                      <div className="text-[10px] opacity-50">{new Date(c.timestamp).toLocaleTimeString()}</div>
                    </td>

                    <td className="p-4 max-w-xs truncate font-medium">
                      "{c.query}"
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${t.badgeHighlight}`}>
                        {c.intent.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-500">
                      {Math.round(c.confidence * 100)}%
                    </td>

                    <td className="p-4 max-w-xs truncate opacity-75">
                      {c.groundedSources.join(", ")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                          c.status === "resolved"
                            ? t.badgeSuccess
                            : c.status === "escalated"
                            ? t.badgeWarning
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        ● {c.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedConv(c);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition ${t.secondaryButton}`}
                      >
                        Review &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation Inspector Drawer / Modal */}
      {selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${t.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <div className="flex items-center gap-2.5">
                <Bot className={`w-5 h-5 ${t.accentText}`} />
                <div>
                  <h3 className="font-black text-base">
                    AI Conversation Inspector ({selectedConv.conversationId})
                  </h3>
                  <div className="text-xs opacity-70">
                    Customer: <strong>{selectedConv.customerName}</strong> ({selectedConv.customerEmail})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConv(null)}
                className="p-1.5 rounded-xl opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Turn Exchange */}
            <div className="space-y-3 text-xs">
              {/* Customer Prompt */}
              <div className={`p-4 rounded-2xl border space-y-1 ${t.cardMuted} ${t.divider}`}>
                <div className="font-bold uppercase tracking-wider text-[10px] opacity-60">
                  Customer Prompt Input
                </div>
                <p className="font-semibold text-sm leading-relaxed">"{selectedConv.query}"</p>
              </div>

              {/* AI Response Output */}
              <div className={`p-4 rounded-2xl border space-y-1.5 ${t.card}`}>
                <div className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 flex items-center justify-between">
                  <span>AI Grounded Response</span>
                  <span className="font-mono">{Math.round(selectedConv.confidence * 100)}% Confidence</span>
                </div>
                <p className="leading-relaxed opacity-90">{selectedConv.response}</p>
              </div>

              {/* Grounded Citations & Sources */}
              <div className={`p-4 rounded-2xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
                <div className="font-bold uppercase tracking-wider text-[10px] opacity-60 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Grounded Knowledge Base & Database Citations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedConv.groundedSources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold text-[11px]"
                    >
                      ✓ {src}
                    </span>
                  ))}
                </div>
              </div>

              {selectedConv.isEscalated && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Escalation Reason:</strong> {selectedConv.escalationReason || "Transferred to staff agent"}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Supervision Actions */}
            <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFlagAnswer(selectedConv._id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 flex items-center gap-1.5 transition"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Flag Incorrect Answer</span>
                </button>

                {!selectedConv.isEscalated && (
                  <button
                    type="button"
                    onClick={() => handleTransferToHuman(selectedConv._id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${t.secondaryButton}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Transfer to Human Queue</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedConv(null)}
                className={`px-5 py-2 rounded-xl text-xs font-black shadow-md ${t.primaryButton}`}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

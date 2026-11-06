import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneForwarded,
  Volume2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type { CallLog } from "../../types";
import { api } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export const TelephonyVoiceView: React.FC = () => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);

  // Simulation State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simPhone, setSimPhone] = useState("+919876543210");
  const [simText, setSimText] = useState("Where is my order ORD-1001 right now?");
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<{
    callerName?: string;
    disclosure?: string;
    reply?: string;
    transferred?: boolean;
    twiml?: string;
  } | null>(null);

  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.voice.getLogs();
      setCallLogs(res.data.logs);
    } catch (err) {
      console.error("Failed to load call logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSimulateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);

    try {
      // Step 1: Simulate Inbound
      const inboundRes = await api.voice.simulateInbound({
        callerNumber: simPhone,
      });

      // Step 2: Simulate Speech Turn
      const speechRes = await api.voice.processSpeech({
        callSid: inboundRes.callSid,
        callerNumber: simPhone,
        text: simText,
      });

      setSimResult({
        callerName: inboundRes.callerName,
        disclosure: inboundRes.disclosure,
        reply: speechRes.reply,
        transferred: speechRes.transferred,
        twiml: speechRes.twiml,
      });

      loadLogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to simulate call");
    } finally {
      setSimLoading(false);
    }
  };

  const toggleSpeechSynthesis = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const transferredCount = callLogs.filter((c) => c.escalatedToAgent).length;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PhoneCall className={`w-5 h-5 ${t.accentText}`} />
            <span>Telephony Voice AI & Call Operations</span>
          </h1>
          <p className="text-xs opacity-75">
            Real-time Twilio speech grounding, automated regulatory AI disclosures, caller recognition, and human queue routing.
          </p>
        </div>

        <button
          onClick={() => {
            setSimResult(null);
            setShowSimulateModal(true);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg ${t.primaryButton}`}
        >
          <PhoneIncoming className="w-4 h-4" />
          <span>Simulate Inbound Voice Call</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <div className="text-xs opacity-70 mb-1 font-semibold">Total Telephony Sessions</div>
          <div className="text-2xl font-black">{callLogs.length}</div>
          <div className="text-[11px] opacity-60 mt-1">Logged in MongoDB</div>
        </div>

        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <div className="text-xs opacity-70 mb-1 font-semibold">Escalated to Human Agent</div>
          <div className="text-2xl font-black text-rose-500">{transferredCount}</div>
          <div className="text-[11px] opacity-60 mt-1">Transferred via &lt;Dial&gt;</div>
        </div>

        <div className={`p-5 rounded-2xl border ${t.card}`}>
          <div className="text-xs opacity-70 mb-1 font-semibold">Mandatory AI Disclosure</div>
          <div className="text-sm font-bold text-emerald-500 flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% TRAI / Regulatory Compliant</span>
          </div>
          <div className="text-[11px] opacity-60 mt-1">Pre-announces AI nature on call pickup</div>
        </div>
      </div>

      {/* Call Logs Table */}
      <div className={`rounded-2xl border overflow-hidden ${t.card}`}>
        <div className={`p-4 border-b flex items-center justify-between font-bold text-xs ${t.divider} ${t.cardMuted}`}>
          <span>Voice Call Sessions ({callLogs.length})</span>
          <button onClick={loadLogs} className={`hover:underline ${t.accentText}`}>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-current/10 opacity-70">
                <th className="p-4">Caller Number</th>
                <th className="p-4">Recognized Caller</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Transcript Turns</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center opacity-50">
                    Loading voice telephony logs...
                  </td>
                </tr>
              ) : callLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center opacity-50">
                    No calls recorded yet. Click "Simulate Inbound Voice Call" above.
                  </td>
                </tr>
              ) : (
                callLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-current/5 transition">
                    <td className={`p-4 font-mono font-bold ${t.accentText}`}>
                      {log.callerNumber}
                    </td>
                    <td className="p-4 font-semibold">
                      {log.callerName || "Customer"}
                    </td>
                    <td className="p-4 font-mono opacity-80">
                      {log.duration}s
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.callStatus === "transferred"
                            ? "bg-rose-500/20 text-rose-400"
                            : log.callStatus === "completed"
                            ? t.badgeSuccess
                            : t.badgeInfo
                        }`}
                      >
                        {log.callStatus}
                      </span>
                    </td>
                    <td className="p-4 opacity-75">
                      {log.transcript?.length || 0} dialogue turns
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${t.secondaryButton}`}
                      >
                        View Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulate Voice Call Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${t.card}`}>
            <h3 className="font-bold text-base flex items-center gap-2">
              <PhoneIncoming className="w-5 h-5 text-emerald-500" />
              <span>Simulate Inbound Twilio Call</span>
            </h3>

            <form onSubmit={handleSimulateCall} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Caller Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border font-mono focus:outline-none ${t.input}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSimPhone("+919876543210")}
                    className={`px-2 py-1 rounded-lg border text-[11px] ${t.secondaryButton}`}
                  >
                    Aman (+919876543210)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPhone("+919123456789")}
                    className={`px-2 py-1 rounded-lg border text-[11px] ${t.secondaryButton}`}
                  >
                    Rohit (+919123456789)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">
                  Caller Spoken Speech (English / Hindi / Hinglish)
                </label>
                <textarea
                  rows={2}
                  required
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="e.g. Where is my order ORD-1001 right now?"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSimText("Where is my order ORD-1001 right now?")}
                  className={`px-2 py-1 rounded-md text-[10px] border ${t.secondaryButton}`}
                >
                  Order Track
                </button>
                <button
                  type="button"
                  onClick={() => setSimText("Can I return the wireless headphones if defective?")}
                  className={`px-2 py-1 rounded-md text-[10px] border ${t.secondaryButton}`}
                >
                  Return Policy
                </button>
                <button
                  type="button"
                  onClick={() => setSimText("I want to speak with a human support agent immediately")}
                  className="px-2 py-1 rounded-md text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30"
                >
                  Escalate to Human
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-2 rounded-xl opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simLoading}
                  className={`px-4 py-2 rounded-xl font-bold ${t.primaryButton}`}
                >
                  {simLoading ? "Dialing & Grounding..." : "Dial Call"}
                </button>
              </div>

              {/* Simulation Result */}
              {simResult && (
                <div className={`mt-4 p-4 rounded-xl border space-y-2.5 ${t.cardMuted} ${t.divider}`}>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">Caller Identified:</span>
                    <strong className="text-emerald-500">{simResult.callerName}</strong>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] leading-relaxed">
                    <div className="font-bold uppercase text-[9px] mb-0.5">Mandatory AI Disclosure</div>
                    {simResult.disclosure}
                  </div>

                  <div className="p-2.5 rounded-lg border border-current/15 leading-relaxed">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[10px] opacity-75">AI Grounded Voice Reply</span>
                      <button
                        type="button"
                        onClick={() => toggleSpeechSynthesis("sim", simResult.reply || "")}
                        className="text-emerald-500 flex items-center gap-1 font-bold"
                      >
                        <Volume2 className="w-3 h-3" /> Listen
                      </button>
                    </div>
                    <div>{simResult.reply}</div>
                  </div>

                  {simResult.transferred && (
                    <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-2">
                      <PhoneForwarded className="w-4 h-4 shrink-0" />
                      <span>Transferred directly to Human Agent Support Queue via &lt;Dial&gt;</span>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Transcript Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-2xl p-6 border shadow-2xl space-y-4 max-h-[85vh] flex flex-col ${t.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10 shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Call Transcript: {selectedLog.callerNumber}</span>
                </h3>
                <div className="text-[11px] opacity-70">
                  Caller: {selectedLog.callerName} • Duration: {selectedLog.duration}s
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="opacity-70 hover:opacity-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-2">
              {selectedLog.transcript?.map((turn, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    turn.speaker === "customer"
                      ? t.chatBubbleCustomer
                      : turn.speaker === "ai"
                      ? t.chatBubbleAi
                      : "bg-current/5 border-current/10"
                  }`}
                >
                  <div className="font-bold text-[10px] uppercase opacity-70 mb-1">
                    {turn.speaker}
                  </div>
                  <div>{turn.text}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-current/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${t.secondaryButton}`}
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

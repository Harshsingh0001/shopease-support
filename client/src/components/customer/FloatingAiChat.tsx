import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle,
  Minimize2,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import type { Product } from "../../types";
import { AiActionWidget } from "./AiActionWidget";

interface ChatMessage {
  id: string;
  sender: "customer" | "ai" | "system";
  text: string;
  timestamp: string;
  groundedSources?: string[];
  isEscalated?: boolean;
  intent?: string;
  suggestedAction?: string;
  agentThoughtProcess?: string[];
  actionPayload?: {
    type:
      | "carrier_telemetry"
      | "product_recommendations"
      | "cancellation_approval_request"
      | "address_change_approval_request"
      | "agent_transfer"
      | "tax_invoice"
      | "device_troubleshooter"
      | "related_options";
    data: Record<string, any>;
  };
}

interface FloatingAiChatProps {
  isOpen: boolean;
  onToggle: () => void;
  initialQuery?: string;
  onAddToCart?: (product: Product) => void;
  onOpenTicketModal?: (ticketIdOrNumber: string) => void;
}

export const FloatingAiChat: React.FC<FloatingAiChatProps> = ({
  isOpen,
  onToggle,
  initialQuery,
  onAddToCart,
  onOpenTicketModal,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! Welcome to ShopEase. I'm your AI support assistant. I'm here to answer your questions about order tracking, GST tax invoices, and return/refund policies. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close / Collapse on Outside Click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onToggle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle initialQuery if passed from Product Details or Dashboard
  useEffect(() => {
    if (initialQuery && isOpen) {
      sendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        user?.preferredLanguage === "hi"
          ? "hi-IN"
          : user?.preferredLanguage === "hinglish"
          ? "hi-IN"
          : "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [user]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition error", err);
      }
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
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "customer",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res: any = await api.ai.ask({ message: query });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.reply || res.replyText || "I've checked our records.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundedSources: res.groundedSources,
        isEscalated: res.isEscalated,
        intent: res.analysis?.intent || res.intent,
        suggestedAction: res.suggestedAction,
        agentThoughtProcess: res.agentThoughtProcess,
        actionPayload: res.actionPayload,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If escalated, add a verified system handover note
      if (res.isEscalated) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            text: "Ticket escalated to human support operations. Staff specialist Priya Sharma has received this thread with full AI context.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: err instanceof Error ? err.message : "Failed to connect to AI assistant. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "📦 Track ORD-1001", query: "Where is my order ORD-1001 right now?" },
    { label: "📍 Request Address Change", query: "Change delivery address for ORD-1001 to Flat 204, Indiranagar, Bengaluru" },
    { label: "❌ Request Cancellation", query: "Cancel my order ORD-1001" },
    { label: "📄 GST Invoice", query: "Download tax invoice for ORD-1001" },
    { label: "🎧 Headphones < ₹5000", query: "Recommend best wireless headphones under 5000 with warranty" },
    { label: "🛠️ Troubleshoot Audio", query: "My headphone bluetooth is not connecting, help me troubleshoot" },
  ];

  return (
    <>
      {/* Floating Chat Trigger Button: Liquid Gold Glow */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Chat with ShopEase AI Support Assistant"
          title="Chat with ShopEase AI Support Assistant"
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2.5 sm:gap-3 transition-all duration-300 hover:scale-105 active:scale-95 ${
            t.isDark
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black shadow-[0_0_25px_rgba(217,168,62,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(217,168,62,0.75)]"
              : t.primaryButton
          }`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping" />
          </div>
          <span className="font-black text-xs sm:text-sm pr-1">Ask ShopEase AI</span>
        </button>
      )}

      {/* Expanded Floating Chat Panel: Obsidian Glass with Gold Accents */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[440px] h-[600px] max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-2xl ${
            t.isDark
              ? "bg-gradient-to-b from-[#11100c]/98 via-[#090806]/98 to-[#040403]/98 border-amber-500/30 shadow-[0_24px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] text-neutral-100"
              : `${t.card} ${t.divider}`
          }`}
        >
          {/* Header Bar */}
          <div
            className={`p-4 border-b flex items-center justify-between shrink-0 transition-all ${
              t.isDark
                ? "border-amber-500/20 bg-[#090806]/95"
                : `${t.divider} ${t.cardMuted}`
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-md transition-all duration-300 hover:scale-105 ${
                  t.isDark
                    ? "bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-700/30 text-amber-300 border border-amber-400/50 shadow-[0_0_20px_rgba(217,168,62,0.35)]"
                    : "bg-[#124a38] text-white"
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className={`font-black text-sm ${t.isDark ? "text-white" : ""}`}>
                    ShopEase AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                </div>
                <p className={`text-[10px] ${t.isDark ? "text-neutral-400" : "opacity-70"}`}>
                  Grounded in MongoDB • Multilingual (EN, HI, Hinglish)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              aria-label="Minimize chat window"
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                t.isDark
                  ? "text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10"
                  : "opacity-70 hover:opacity-100 hover:bg-current/10"
              }`}
              title="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Starter Suggestion Pills in Chat (Only Before Queries) */}
            {messages.length <= 1 && (
              <div className="pt-2 pb-1 space-y-2">
                <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Suggested Inquiries:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickActions.slice(0, 3).map((qa, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(qa.query)}
                      disabled={loading}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                        t.isDark
                          ? "bg-gradient-to-b from-[#11100d] to-[#070705] hover:from-[#1b1812] hover:to-[#0e0c08] border-amber-500/20 hover:border-amber-400/60 text-neutral-100 shadow-sm"
                          : "bg-[#9CABB4] hover:bg-[#8ca0ab] border-[#8396a1] text-[#141c22]"
                      }`}
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              const isCustomer = m.sender === "customer";
              const isSystem = m.sender === "system";

              if (isSystem) {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border inline-block max-w-xs shadow-xs ${
                        t.isDark
                          ? "bg-gradient-to-r from-[#1c1404] to-[#0b0801] border-amber-500/40 text-amber-300"
                          : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                      }`}
                    >
                      ⚡ {m.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 transition-all duration-300 ${
                      isCustomer
                        ? t.isDark
                          ? "rounded-tr-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold shadow-[0_8px_25px_rgba(217,168,62,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] border border-amber-300/50 hover:shadow-[0_10px_30px_rgba(217,168,62,0.45)]"
                          : t.chatBubbleCustomer
                        : t.isDark
                        ? "rounded-tl-sm bg-gradient-to-b from-[#11100d] via-[#090807] to-[#040404] text-neutral-100 border border-amber-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
                        : t.chatBubbleAi
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between gap-3 text-[10px] pb-1.5 ${
                        isCustomer
                          ? "border-b border-stone-950/20 text-stone-900"
                          : t.isDark
                          ? "border-b border-amber-500/20 text-neutral-400"
                          : "opacity-70"
                      }`}
                    >
                      <span className={`font-extrabold ${isCustomer ? "text-stone-950" : "text-white"}`}>
                        {isCustomer ? user?.name || "You" : "ShopEase AI"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={isCustomer ? "text-stone-900/80 font-bold" : ""}>{m.timestamp}</span>
                        {isAi && (
                          <button
                            type="button"
                            onClick={() => toggleSpeechSynthesis(m.id, m.text)}
                            title={speakingId === m.id ? "Stop voice" : "Read aloud"}
                            className={`p-0.5 rounded transition-all duration-200 hover:scale-110 ${
                              speakingId === m.id
                                ? "text-amber-400 animate-pulse"
                                : t.isDark
                                ? "text-neutral-400 hover:text-amber-300"
                                : "opacity-75 hover:opacity-100"
                            }`}
                          >
                            {speakingId === m.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`whitespace-pre-wrap ${isCustomer ? "text-stone-950 font-semibold" : t.isDark ? "text-neutral-100" : ""}`}>
                      {m.text}
                    </div>

                    {/* Autonomous Generative UI Action Widgets & Agent Reasoning Trace */}
                    {isAi && (
                      <AiActionWidget
                        actionPayload={m.actionPayload}
                        agentThoughtProcess={m.agentThoughtProcess}
                        intent={m.intent}
                        onSendMessage={sendMessage}
                        onAddToCart={onAddToCart}
                        onOpenTicketModal={onOpenTicketModal}
                      />
                    )}

                    {/* Grounded Policy Sources Badge */}
                    {m.groundedSources && m.groundedSources.length > 0 && (
                      <div
                        className={`pt-2 border-t text-[10px] flex items-center gap-1.5 ${
                          t.isDark
                            ? "border-amber-500/20 text-neutral-300"
                            : "border-current/15 opacity-80"
                        }`}
                      >
                        <CheckCircle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">
                          Grounded in:{" "}
                          <strong className={t.isDark ? "text-amber-300" : ""}>
                            {m.groundedSources.join(", ")}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div
                className={`flex items-center gap-2.5 text-xs p-3 rounded-2xl border transition-all duration-300 ${
                  t.isDark
                    ? "bg-gradient-to-r from-[#11100d] to-[#070705] border-amber-500/25 text-amber-200 shadow-md"
                    : "bg-current/5 border-transparent opacity-75 italic animate-pulse"
                }`}
              >
                <Bot className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-semibold text-white">ShopEase AI is querying live records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Mic Active Visualizer Banner */}
          {isListening && (
            <div className="px-4 py-2.5 text-xs bg-rose-500/20 text-rose-300 border-t border-rose-500/40 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">Listening in {user?.preferredLanguage || "en"}... Speak now</span>
              </div>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className="text-[11px] font-bold underline hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Composer: Glossy Gold Finish */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className={`p-3 border-t flex items-center gap-2 shrink-0 transition-all ${
              t.isDark
                ? "border-amber-500/20 bg-[#090806]/95"
                : `${t.divider} ${t.cardMuted}`
            }`}
          >
            {/* Mic STT Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? "Stop voice listening" : "Speak to AI with microphone"}
              title={isListening ? "Stop listening" : "Speak to AI"}
              className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-95 hover:scale-105 ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : t.isDark
                  ? "bg-[#12110e] hover:bg-[#1a1711] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60"
                  : t.secondaryButton
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Query Input */}
            <input
              type="text"
              aria-label="Message ShopEase AI support"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, returns, warranty, or products..."
              className={`flex-1 px-3.5 py-2.5 text-xs rounded-2xl focus:outline-none transition-all duration-200 ${
                t.isDark
                  ? "bg-[#060605] text-white placeholder-neutral-500 border border-amber-500/25 focus:border-amber-400/60"
                  : t.input
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message to AI"
              className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-30 hover:scale-105 ${
                t.isDark
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black shadow-[0_0_20px_rgba(217,168,62,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_30px_rgba(217,168,62,0.7)]"
                  : t.primaryButton
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

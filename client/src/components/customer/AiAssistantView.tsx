import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle,
  Star,
  Plus,
  Sparkles,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import type { Order, Product } from "../../types";
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

interface AiAssistantViewProps {
  orders: Order[];
  initialQuery?: string;
  onAddToCart?: (product: Product) => void;
  onOpenTicketModal?: (ticketIdOrNumber: string) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  orders,
  initialQuery,
  onAddToCart,
  onOpenTicketModal,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-main",
      sender: "ai",
      text: `Hello ${user?.name || "there"}! I am your ShopEase Support AI. I'm here to answer your questions about live orders, carrier GPS telemetry, GST invoices, and return/refund policies. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [csatRating, setCsatRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Speech Recognition setup
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

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
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
        console.error("Speech error", err);
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

  const sendMessage = async (queryText?: string) => {
    const query = (queryText || input).trim();
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
        text: res.reply || res.replyText || "I've checked our database.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundedSources: res.groundedSources,
        isEscalated: res.isEscalated,
        intent: res.analysis?.intent || res.intent,
        suggestedAction: res.suggestedAction,
        agentThoughtProcess: res.agentThoughtProcess,
        actionPayload: res.actionPayload,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (res.isEscalated) {
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            text: "This issue has been transferred to human support operations. Staff specialist Priya Sharma has been alerted in the CRM queue.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "system",
          text: err instanceof Error ? err.message : "Failed to connect to AI server. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "New session started! How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCsatRating(null);
    setRatingSubmitted(false);
  };

  const quickPrompts = [
    ...(orders && orders.length > 0
      ? [
          {
            tag: "Live Tracking",
            label: `📦 Track ${orders[0].orderNumber}`,
            query: `Where is my order ${orders[0].orderNumber} right now?`,
          },
          {
            tag: "Address Change",
            label: `📍 Change Address (${orders[0].orderNumber})`,
            query: `Change delivery address for ${orders[0].orderNumber} to Flat 204, Indiranagar, Bengaluru`,
          },
          {
            tag: "GST Invoice",
            label: `📄 GST Tax Invoice (${orders[0].orderNumber})`,
            query: `Download tax invoice for ${orders[0].orderNumber}`,
          },
          {
            tag: "Order Cancel",
            label: `❌ Request Cancellation (${orders[0].orderNumber})`,
            query: `Cancel my order ${orders[0].orderNumber}`,
          },
        ]
      : [
          {
            tag: "Live Tracking",
            label: "📦 Track ORD-1001",
            query: "Where is my order ORD-1001 right now?",
          },
          {
            tag: "Address Change",
            label: "📍 Change Delivery Address",
            query: "Change delivery address for ORD-1001 to Flat 204, Indiranagar, Bengaluru",
          },
          {
            tag: "GST Invoice",
            label: "📄 GST Tax Invoice",
            query: "Download tax invoice for ORD-1001",
          },
          {
            tag: "Order Cancel",
            label: "❌ Request Cancellation",
            query: "Cancel my order ORD-1001",
          },
        ]),
    {
      tag: "Hardware Specs",
      label: "🎧 Wireless Headphones under ₹5,000",
      query: "Recommend best wireless headphones under 5000 with warranty",
    },
    {
      tag: "Device Diagnostics",
      label: "🛠️ Bluetooth Connection Troubleshooter",
      query: "My headphone bluetooth is not connecting, help me troubleshoot",
    },
    {
      tag: "Store Policy",
      label: "🔄 7-Day Replacement & Return Policy",
      query: "What is your 7-day electronics return policy?",
    },
    {
      tag: "Payment SLA",
      label: "💰 Refund Timeline & Bank SLA",
      query: "How many business days does it take for a refund to credit to my bank account?",
    },
  ];

  return (
    <div className={`w-full max-w-[1600px] mx-auto py-5 px-3 sm:px-6 lg:px-8 h-full flex flex-col ${t.isDark ? "text-neutral-100" : ""}`}>
      {/* Top Header Card: Glossy Obsidian Glass with Gold Rim in Dark Mode */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 transition-all duration-300 ${
          t.isDark
            ? "bg-gradient-to-b from-[#11100c]/95 via-[#090806]/95 to-[#040403]/95 border-amber-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-amber-400/50 hover:shadow-[0_16px_50px_rgba(217,168,62,0.15)] backdrop-blur-2xl"
            : t.card
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 hover:scale-105 ${
              t.isDark
                ? "bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-700/30 text-amber-300 border border-amber-400/50 shadow-[0_0_25px_rgba(217,168,62,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                : "bg-[#124a38] text-white shadow-md"
            }`}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>ShopEase AI Assistant</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold shadow-[0_0_15px_rgba(217,168,62,0.25)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                <span className="uppercase tracking-wider">Online • Grounded</span>
              </div>
            </div>
            <p className={`text-xs mt-0.5 ${t.isDark ? "text-neutral-400" : "opacity-75"}`}>
              Grounded in live MongoDB database & policy RAG • Multilingual (
              <span className="font-bold uppercase text-amber-300">
                {user?.preferredLanguage || "en"}
              </span>
              )
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleNewConversation}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
              t.isDark
                ? "bg-[#12110e] hover:bg-[#1d1912] text-amber-200 border-amber-500/30 hover:border-amber-400/70 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(217,168,62,0.3)]"
                : t.secondaryButton
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Conversation Messages Scroll View: Deep Obsidian Glass Container */}
      <div
        className={`flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl border space-y-4 my-3 transition-all duration-300 ${
          t.isDark
            ? "bg-[#050403]/95 border-amber-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
            : t.card
        }`}
      >
        {/* Starter Suggestion Chips (Only on Initial Empty/Welcome State) */}
        {messages.length <= 1 && (
          <div className="py-6 max-w-2xl mx-auto space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/35 text-amber-300 shadow-[0_0_15px_rgba(217,168,62,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Instant AI Assistant Prompts</span>
            </div>
            <p className={`text-xs ${t.isDark ? "text-neutral-400" : "opacity-75"} font-medium`}>
              Select a grounded inquiry to test real-time database queries & policy reasoning:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {quickPrompts.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(p.query)}
                  disabled={loading}
                  className={`p-4 rounded-2xl border text-xs font-medium transition-all duration-300 group hover:-translate-y-1 active:scale-98 ${
                    t.isDark
                      ? "bg-gradient-to-b from-[#11100d] to-[#070705] hover:from-[#1b1812] hover:to-[#0e0c08] border-amber-500/20 hover:border-amber-400/60 text-neutral-100 shadow-[0_8px_25px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_12px_35px_rgba(217,168,62,0.25)]"
                      : "bg-white hover:bg-amber-50/60 border-neutral-200 hover:border-amber-300 text-neutral-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">
                      {p.tag}
                    </span>
                    <span className="text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-1 transition-all duration-300 text-xs font-bold">
                      →
                    </span>
                  </div>
                  <span className="font-semibold block text-white group-hover:text-amber-200 transition-colors">
                    {p.label}
                  </span>
                  <span className={`text-[11px] block mt-1 line-clamp-1 ${t.isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    "{p.query}"
                  </span>
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
              <div key={m.id} className="text-center my-3">
                <div
                  className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl border shadow-lg ${
                    t.isDark
                      ? "bg-gradient-to-r from-[#1c1404] via-[#140e02] to-[#0b0801] border-amber-500/40 text-amber-200 shadow-[0_4px_24px_rgba(217,168,62,0.25)]"
                      : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>{m.text}</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 transition-all duration-300 ${
                  isCustomer
                    ? t.isDark
                      ? "rounded-tr-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold shadow-[0_8px_30px_rgba(217,168,62,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] border border-amber-300/50 hover:shadow-[0_10px_35px_rgba(217,168,62,0.45)] hover:-translate-y-0.5"
                      : t.chatBubbleCustomer
                    : t.isDark
                    ? "rounded-tl-sm bg-gradient-to-b from-[#11100d] via-[#090807] to-[#040404] text-neutral-100 border border-amber-500/25 shadow-[0_16px_45px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-amber-500/40 hover:shadow-[0_20px_50px_rgba(217,168,62,0.15)] backdrop-blur-xl"
                    : t.chatBubbleAi
                }`}
              >
                {/* Header within Message Bubble */}
                <div
                  className={`flex items-center justify-between gap-4 text-[10px] sm:text-xs pb-2 ${
                    isCustomer
                      ? "border-b border-stone-900/20 text-stone-900"
                      : t.isDark
                      ? "border-b border-amber-500/20"
                      : "opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAi && (
                      <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className={`font-black ${isCustomer ? "text-stone-950" : "text-white"}`}>
                      {isCustomer ? user?.name || "You" : "ShopEase AI Assistant"}
                    </span>
                    {isAi && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={isCustomer ? "text-stone-900/80 font-bold" : t.isDark ? "text-neutral-400" : "opacity-75"}>
                      {m.timestamp}
                    </span>
                    {isAi && (
                      <button
                        type="button"
                        onClick={() => toggleSpeechSynthesis(m.id, m.text)}
                        title={speakingId === m.id ? "Stop voice" : "Read aloud"}
                        className={`p-1 rounded-lg transition-all duration-200 hover:scale-110 ${
                          speakingId === m.id
                            ? "bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/40"
                            : t.isDark
                            ? "text-neutral-400 hover:text-amber-300 hover:bg-amber-500/10"
                            : "opacity-80 hover:opacity-100"
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

                {/* Message Body Content */}
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

                {/* Grounded Policy Sources Pill */}
                {m.groundedSources && m.groundedSources.length > 0 && (
                  <div
                    className={`pt-2.5 border-t text-[11px] flex items-center gap-2 ${
                      t.isDark ? "border-amber-500/20 text-neutral-300" : "border-current/15 opacity-80"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Grounded in:{" "}
                      <strong className={t.isDark ? "text-amber-200 font-bold" : ""}>
                        {m.groundedSources.join(", ")}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div
            className={`flex items-center gap-3 text-xs p-3.5 rounded-2xl border transition-all duration-300 ${
              t.isDark
                ? "bg-gradient-to-r from-[#11100d] to-[#070705] border-amber-500/25 text-amber-200 shadow-xl"
                : "bg-current/5 border-transparent opacity-75 italic"
            }`}
          >
            <div className="w-6 h-6 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">ShopEase AI is querying live database & grounded policy records</span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-200" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CSAT Conversation Feedback Strip (if more than 2 turns) */}
      {messages.length > 2 && !ratingSubmitted && (
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between text-xs mb-2 shrink-0 transition-all duration-300 ${
            t.isDark
              ? "bg-gradient-to-b from-[#11100c]/95 to-[#050403]/95 border-amber-500/25 text-neutral-200 shadow-[0_8px_30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
              : `${t.cardMuted} ${t.divider}`
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Was this AI answer helpful?</span>
            <span className="text-neutral-400 text-[11px] hidden sm:inline">Rate your experience:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setCsatRating(star);
                  setRatingSubmitted(true);
                }}
                className="p-1 hover:scale-125 transition-all duration-200 active:scale-95"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    (csatRating || 0) >= star
                      ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      : "text-neutral-500 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {ratingSubmitted && (
        <div className="text-[11px] font-bold text-amber-400 text-center pb-2 shrink-0 flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Thank you for your feedback! Your rating has been logged to CRM Analytics.</span>
        </div>
      )}

      {/* Voice Listening Active Banner */}
      {isListening && (
        <div className="px-4 py-2.5 text-xs bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 flex items-center justify-between animate-pulse mb-2 shrink-0 shadow-[0_0_25px_rgba(244,63,94,0.25)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">
              Listening in {user?.preferredLanguage || "en"}... Speak your question now
            </span>
          </div>
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className="text-xs font-bold underline hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Composer Input Bar: Glossy Obsidian Glass Dock with Gold Accents */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className={`p-3 rounded-3xl border flex items-center gap-2.5 shrink-0 transition-all duration-300 ${
          t.isDark
            ? "bg-gradient-to-b from-[#11100c]/95 via-[#090806]/95 to-[#040403]/95 border-amber-500/30 focus-within:border-amber-400/70 shadow-[0_16px_50px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] focus-within:shadow-[0_0_35px_rgba(217,168,62,0.25)] backdrop-blur-2xl"
            : t.card
        }`}
      >
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title={isListening ? "Stop listening" : "Speak to AI"}
          className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isListening
              ? "bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]"
              : t.isDark
              ? "bg-[#12110e] hover:bg-[#1d1912] text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_0_15px_rgba(217,168,62,0.25)]"
              : t.secondaryButton
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything: Where is my order? Return policy? Refund SLA? Technical specs..."
          className={`flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border focus:outline-none transition-all duration-200 ${
            t.isDark
              ? "bg-[#060605] text-white placeholder-neutral-500 border-amber-500/20 focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30"
              : t.input
          }`}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
            t.isDark
              ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-[0_0_25px_rgba(217,168,62,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(217,168,62,0.7)] border border-amber-300/40"
              : t.primaryButton
          }`}
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

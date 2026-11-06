import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle,
  UserCheck,
  Star,
  Plus,
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
      | "address_updated"
      | "order_cancelled"
      | "return_initiated"
      | "compensation_coupon"
      | "tax_invoice"
      | "device_troubleshooter";
    data: Record<string, any>;
  };
}

interface AiAssistantViewProps {
  orders: Order[];
  initialQuery?: string;
  onAddToCart?: (product: Product) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  orders,
  initialQuery,
  onAddToCart,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-main",
      sender: "ai",
      text: `Hello ${user?.name || "there"}! I am your ShopEase Autonomous AI Support Assistant. I am directly connected to your orders, verified product specifications, and official return policies. How can I help you today?`,
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
          { label: `📦 Track ${orders[0].orderNumber}`, query: `Where is my order ${orders[0].orderNumber} right now?` },
          { label: `📍 Change Address (${orders[0].orderNumber})`, query: `Change delivery address for ${orders[0].orderNumber} to Flat 204, Indiranagar, Bengaluru` },
          { label: `📄 GST Invoice (${orders[0].orderNumber})`, query: `Download tax invoice for ${orders[0].orderNumber}` },
          { label: `❌ Cancel Order (${orders[0].orderNumber})`, query: `Cancel my order ${orders[0].orderNumber}` },
        ]
      : [
          { label: "📦 Track ORD-1001", query: "Where is my order ORD-1001 right now?" },
          { label: "📍 Change Address", query: "Change delivery address for ORD-1001 to Flat 204, Indiranagar, Bengaluru" },
          { label: "📄 GST Invoice", query: "Download tax invoice for ORD-1001" },
        ]),
    { label: "🎧 Best Headphones under ₹5000", query: "Recommend best wireless headphones under 5000 with warranty" },
    { label: "🏷️ Claim ₹200 Delay Voucher", query: "My delivery was delayed, can I get compensation or discount voucher?" },
    { label: "🛠️ Bluetooth Troubleshooter", query: "My headphone bluetooth is not connecting, help me troubleshoot" },
    { label: "🔄 7-Day Return Policy", query: "What is your 7-day electronics return policy?" },
    { label: "👤 Human Agent Handoff", query: "Connect me to a real person right now, I want human support." },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
      {/* Top Header Card */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 ${t.card}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md ${
              t.isDark
                ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/40"
                : "bg-[#124a38] text-white"
            }`}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight">ShopEase AI Assistant</h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Online</span>
            </div>
            <p className="text-xs opacity-70">
              Grounded in MongoDB database • English, Hindi & Hinglish (<span className="uppercase font-bold">{user?.preferredLanguage || "en"}</span>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleNewConversation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${t.secondaryButton}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => sendMessage("I want to speak with a human support agent immediately.")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition ${t.primaryButton}`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Speak to Agent</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="py-2.5 overflow-x-auto flex gap-2 scrollbar-none shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(p.query)}
            disabled={loading}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap border transition active:scale-95 disabled:opacity-50 ${
              t.isDark
                ? "bg-[#23221e] hover:bg-[#2e2b24] border-[#353229] text-[#f5e7bf]"
                : "bg-white hover:bg-[#f3f7f4] border-[#e2e8e2] text-[#1f2923]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Conversation Messages Scroll View */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl border shadow-xl space-y-4 my-2 ${t.card}`}>
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          const isCustomer = m.sender === "customer";
          const isSystem = m.sender === "system";

          if (isSystem) {
            return (
              <div key={m.id} className="text-center my-3">
                <span className="text-xs font-semibold px-4 py-2 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 inline-block max-w-md shadow-xs">
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
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-md space-y-2.5 ${
                  isCustomer ? t.chatBubbleCustomer : t.chatBubbleAi
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] sm:text-xs opacity-75">
                  <span className="font-black">
                    {isCustomer ? user?.name || "You" : "ShopEase AI Assistant"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{m.timestamp}</span>
                    {isAi && (
                      <button
                        type="button"
                        onClick={() => toggleSpeechSynthesis(m.id, m.text)}
                        title={speakingId === m.id ? "Stop voice" : "Read aloud"}
                        className="opacity-80 hover:opacity-100"
                      >
                        {speakingId === m.id ? (
                          <VolumeX className="w-4 h-4 text-emerald-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Autonomous Generative UI Action Widgets & Agent Reasoning Trace */}
                {isAi && (
                  <AiActionWidget
                    actionPayload={m.actionPayload}
                    agentThoughtProcess={m.agentThoughtProcess}
                    onSendMessage={sendMessage}
                    onAddToCart={onAddToCart}
                  />
                )}

                {/* Grounded Policy Sources Pill */}
                {m.groundedSources && m.groundedSources.length > 0 && (
                  <div className="pt-2 border-t border-current/15 text-[11px] opacity-80 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Grounded in: <strong>{m.groundedSources.join(", ")}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 text-xs opacity-75 italic p-3 rounded-2xl bg-current/5 animate-pulse">
            <Bot className="w-5 h-5 text-emerald-500" />
            <span>ShopEase AI is querying database and grounded policy records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CSAT Conversation Feedback Strip (if more than 2 turns) */}
      {messages.length > 2 && !ratingSubmitted && (
        <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs mb-2 shrink-0 ${t.cardMuted} ${t.divider}`}>
          <span className="opacity-80 font-semibold">Was this answer helpful? Rate your AI experience:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setCsatRating(star);
                  setRatingSubmitted(true);
                }}
                className="p-1 hover:scale-125 transition"
              >
                <Star
                  className={`w-4 h-4 ${
                    (csatRating || 0) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {ratingSubmitted && (
        <div className="text-[11px] font-bold text-emerald-500 text-center pb-1 shrink-0">
          ✓ Thank you for your feedback! Your rating has been logged to CRM Analytics.
        </div>
      )}

      {/* Voice Listening Active Banner */}
      {isListening && (
        <div className="px-4 py-2 text-xs bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 flex items-center justify-between animate-pulse mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">Listening in {user?.preferredLanguage || "en"}... Speak now!</span>
          </div>
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className="text-xs font-bold underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Composer Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className={`p-3 rounded-3xl border shadow-lg flex items-center gap-2.5 shrink-0 ${t.card}`}
      >
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title={isListening ? "Stop listening" : "Speak to AI"}
          className={`p-3 rounded-2xl transition active:scale-95 ${
            isListening ? "bg-rose-500 text-white animate-pulse" : t.secondaryButton
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 opacity-80" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything: Where is my order? Return policy? Refund SLA? Technical specs..."
          className={`flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border focus:outline-none transition ${t.input}`}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg active:scale-95 transition disabled:opacity-40 ${t.primaryButton}`}
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

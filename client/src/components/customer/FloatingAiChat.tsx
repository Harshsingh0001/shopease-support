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
      | "address_updated"
      | "order_cancelled"
      | "return_initiated"
      | "compensation_coupon"
      | "tax_invoice"
      | "device_troubleshooter";
    data: Record<string, any>;
  };
}

interface FloatingAiChatProps {
  isOpen: boolean;
  onToggle: () => void;
  initialQuery?: string;
  onAddToCart?: (product: Product) => void;
}

export const FloatingAiChat: React.FC<FloatingAiChatProps> = ({
  isOpen,
  onToggle,
  initialQuery,
  onAddToCart,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! Welcome to ShopEase. I'm your AI support assistant. I have live access to your orders, verified product details, and store return policies. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
    { label: "📍 Update Address", query: "Change delivery address for ORD-1001 to Flat 204, Indiranagar, Bengaluru" },
    { label: "📄 GST Invoice", query: "Download tax invoice for ORD-1001" },
    { label: "🎧 Headphones < ₹5000", query: "Recommend best wireless headphones under 5000 with warranty" },
    { label: "🏷️ Claim ₹200 Voucher", query: "My delivery was delayed, can I get compensation or discount voucher?" },
    { label: "🛠️ Troubleshoot Audio", query: "My headphone bluetooth is not connecting, help me troubleshoot" },
    { label: "👤 Talk to Real Agent", query: "Connect me to a real person right now, I want human support." },
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          title="Chat with ShopEase AI Support Assistant"
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2.5 sm:gap-3 transition-transform duration-300 hover:scale-105 active:scale-95 ${t.primaryButton}`}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-black text-xs sm:text-sm pr-1">Ask ShopEase AI</span>
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[440px] h-[600px] max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-md ${t.card} ${t.divider}`}
        >
          {/* Header Bar */}
          <div className={`p-4 border-b flex items-center justify-between shrink-0 ${t.divider} ${t.cardMuted}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                  t.isDark
                    ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/40"
                    : "bg-[#124a38] text-white"
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm">ShopEase AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] opacity-70">
                  Grounded in MongoDB • Multilingual (EN, HI, Hinglish)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="p-2 opacity-70 hover:opacity-100 hover:bg-current/10 rounded-xl transition"
              title="Minimize chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 border-b border-current/10 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 bg-current/5">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(qa.query)}
                disabled={loading}
                className={`text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap border transition active:scale-95 disabled:opacity-50 ${
                  t.isDark
                    ? "bg-[#23221e] hover:bg-[#2d2b24] border-[#353229] text-[#f5e7bf]"
                    : "bg-white hover:bg-[#f3f7f4] border-[#e2e8e2] text-[#1f2923]"
                }`}
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              const isCustomer = m.sender === "customer";
              const isSystem = m.sender === "system";

              if (isSystem) {
                return (
                  <div key={m.id} className="text-center my-2">
                    <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 inline-block max-w-xs shadow-xs">
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
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm space-y-2 ${
                      isCustomer ? t.chatBubbleCustomer : t.chatBubbleAi
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70">
                      <span className="font-extrabold">
                        {isCustomer ? user?.name || "You" : "ShopEase AI"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span>{m.timestamp}</span>
                        {isAi && (
                          <button
                            type="button"
                            onClick={() => toggleSpeechSynthesis(m.id, m.text)}
                            title={speakingId === m.id ? "Stop voice" : "Read aloud"}
                            className="opacity-75 hover:opacity-100"
                          >
                            {speakingId === m.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
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

                    {/* Grounded Policy Sources Badge */}
                    {m.groundedSources && m.groundedSources.length > 0 && (
                      <div className="pt-2 border-t border-current/15 text-[10px] opacity-80 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          Grounded in: <strong>{m.groundedSources.join(", ")}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5 text-xs opacity-75 italic p-3 rounded-2xl bg-current/5 animate-pulse">
                <Bot className="w-4 h-4 text-emerald-500" />
                <span>ShopEase AI is querying order records & RAG policies...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Mic Active Visualizer Banner */}
          {isListening && (
            <div className="px-4 py-2.5 text-xs bg-rose-500/20 text-rose-400 border-t border-rose-500/30 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">Listening in {user?.preferredLanguage || "en"}... Speak your question</span>
              </div>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className="text-[11px] font-bold underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className={`p-3 border-t flex items-center gap-2 shrink-0 ${t.divider} ${t.cardMuted}`}
          >
            {/* Mic STT Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? "Stop listening" : "Speak to AI"}
              className={`p-2.5 rounded-2xl transition active:scale-95 ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : t.secondaryButton
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4 opacity-75 hover:opacity-100" />
              )}
            </button>

            {/* Query Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, returns, warranty, or products..."
              className={`flex-1 px-3.5 py-2.5 text-xs rounded-2xl focus:outline-none transition ${t.input}`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`p-2.5 rounded-2xl transition active:scale-95 disabled:opacity-40 ${t.primaryButton}`}
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

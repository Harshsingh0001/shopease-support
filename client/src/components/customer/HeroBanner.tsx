import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  CheckCircle,
  MessageSquare,
  Bot,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface HeroBannerProps {
  onShopNow: () => void;
  onOpenAiChat: () => void;
  onSelectQuery?: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onOpenAiChat,
  onSelectQuery,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const quickPrompts = [
    { label: "Track ORD-1001", query: "Where is my order ORD-1001 right now?" },
    { label: "7-Day Return Policy", query: "What is your 7-day return policy for electronics?" },
    { label: "Wireless ANC Specs", query: "Tell me about Studio Wireless Headphones features and battery life." },
    { label: "Human Agent Connect", query: "Can you connect me with a human support agent?" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border mb-8 p-6 sm:p-10 transition-all shadow-xl">
      {/* Dynamic Background Atmosphere */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-95 ${
          t.isDark
            ? "bg-gradient-to-br from-[#1c1b18] via-[#23201a] to-[#11110f]"
            : "bg-gradient-to-br from-[#ffffff] via-[#f5faf6] to-[#e8f5ec]"
        }`}
      />

      {/* Decorative Brand Light Glows */}
      <div
        className={`absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
          t.isDark ? "bg-[#d9a83e]" : "bg-[#059669]"
        }`}
      />
      <div
        className={`absolute -left-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none ${
          t.isDark ? "bg-[#f5e7bf]" : "bg-[#10b981]"
        }`}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Value Prop */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs">
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                t.isDark ? "bg-[#d9a83e]" : "bg-[#059669]"
              }`}
            />
            <span className={t.accentText}>SHOPPING ELEVATED BY AI</span>
            <span className="opacity-30">•</span>
            <span className="opacity-80">Sub-second Grounded Resolutions</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
            Curated Premium Tech.{" "}
            <span className={t.accentText}>
              Autonomous AI Support.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed max-w-xl">
            Explore authentic audio gear, smart wearables, and lifestyle gadgets backed by our real-time database-grounded AI assistant. Instant order tracking, automated return validation, and live human agent escalations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onShopNow}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl active:scale-95 transition ${t.primaryButton}`}
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenAiChat}
              className={`px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border active:scale-95 transition ${t.secondaryButton}`}
            >
              <Sparkles className={`w-4 h-4 ${t.accentText}`} />
              <span>Try Live AI Support</span>
            </button>
          </div>

          {/* Interactive AI Prompt Chips */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold opacity-60 mb-2 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ask ShopEase AI in 1-Click:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectQuery ? onSelectQuery(p.query) : onOpenAiChat()}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition hover:scale-105 active:scale-95 ${
                    t.isDark
                      ? "bg-[#23221e]/80 hover:bg-[#2e2c24] border-[#353229] text-[#f5e7bf]"
                      : "bg-white/80 hover:bg-[#f3f7f4] border-[#e2e8e2] text-[#1f2923]"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 opacity-60" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive AI Copilot Live Preview Card */}
        <div className="lg:col-span-5">
          <div
            className={`rounded-3xl p-5 border shadow-2xl relative backdrop-blur-md overflow-hidden ${
              t.isDark
                ? "bg-[#1c1b18]/90 border-[#353229]"
                : "bg-white/95 border-[#e2e8e2]"
            }`}
          >
            {/* Top Bar of Preview Card */}
            <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-md ${
                    t.isDark
                      ? "bg-[#382f1c] text-[#d9a83e] border border-[#d9a83e]/40"
                      : "bg-[#124a38] text-[#a7f3d0]"
                  }`}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    <span>ShopEase Intelligence Core</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-[10px] opacity-60">Verified RAG Grounding • 850ms SLA</div>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${t.badgeHighlight}`}>
                LIVE DEMO
              </span>
            </div>

            {/* Simulated Live Turn Stream */}
            <div className="space-y-3 text-xs">
              {/* Customer Turn */}
              <div className="flex justify-end">
                <div
                  className={`max-w-[85%] p-3 rounded-2xl rounded-tr-xs text-[11px] leading-relaxed shadow-sm ${
                    t.isDark
                      ? "bg-[#2a2924] text-[#f5f4ef] border border-[#353229]"
                      : "bg-[#eaf4ed] text-[#124a38] border border-[#d2ead7]"
                  }`}
                >
                  <span className="font-bold opacity-60 block text-[9px] mb-0.5 uppercase">Aman Gupta (Customer)</span>
                  "Where is my order #ORD-1001 right now?"
                </div>
              </div>

              {/* AI Assistant Grounded Reply Turn */}
              <div className="flex justify-start">
                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl rounded-tl-xs space-y-2 border text-[11px] leading-relaxed shadow-md ${
                    t.isDark
                      ? "bg-[#23221e] border-[#d9a83e]/30 text-[#f5f4ef]"
                      : "bg-white border-[#e2e8e2] text-[#1f2923]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>Verified via MongoDB Order Registry</span>
                    </span>
                    <span className="font-mono opacity-60">ORD-1001</span>
                  </div>

                  <p className="opacity-90">
                    Your order containing <strong>Studio Wireless Headphones</strong> has been dispatched via <strong>Delhivery Express (AWB: DLH82947192)</strong> and is on schedule to be delivered tomorrow by 5:00 PM.
                  </p>

                  <div className="pt-1.5 border-t border-current/10 flex items-center justify-between text-[10px]">
                    <span className="opacity-70">Carrier: Delhivery</span>
                    <span className="font-extrabold text-emerald-500 uppercase">● In Transit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="mt-4 pt-3 border-t border-current/10 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <div className={`font-black text-xs ${t.accentText}`}>94.2%</div>
                <div className="opacity-60">Auto Resolved</div>
              </div>
              <div>
                <div className={`font-black text-xs ${t.accentText}`}>&lt; 850ms</div>
                <div className="opacity-60">Avg Latency</div>
              </div>
              <div>
                <div className={`font-black text-xs ${t.accentText}`}>4.9 / 5.0</div>
                <div className="opacity-60">Customer CSAT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Assurances Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 mt-8 border-t border-current/10 text-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs">Pan-India Express</div>
            <div className="opacity-60 text-[11px]">Free delivery on orders &gt; ₹999</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs">7-Day Return SLA</div>
            <div className="opacity-60 text-[11px]">Instant pickup & refund credit</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs">1-Year Brand Warranty</div>
            <div className="opacity-60 text-[11px]">100% Genuine electronics</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black text-xs">Human + AI Synergy</div>
            <div className="opacity-60 text-[11px]">Instant escalation to senior staff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Wrench,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { printTaxInvoice } from "../../utils/invoicePrinter";
import type { Product } from "../../types";

interface AiActionWidgetProps {
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
  agentThoughtProcess?: string[];
  intent?: string;
  onSendMessage?: (text: string) => void;
  onAddToCart?: (product: Product) => void;
  onOpenTicketModal?: (ticketIdOrNumber: string) => void;
}

export const AiActionWidget: React.FC<AiActionWidgetProps> = ({
  actionPayload,
  agentThoughtProcess,
  intent,
  onSendMessage,
  onAddToCart,
  onOpenTicketModal,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [troubleshootFixed, setTroubleshootFixed] = useState<boolean | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<"pending" | "resolved" | "unresolved">("pending");

  const getRelatedOptions = (currentIntent?: string, orderNumber: string = "ORD-1001") => {
    if (currentIntent === "order_tracking" || actionPayload?.type === "carrier_telemetry") {
      return [
        { label: "📍 Request Delivery Address Change", query: `Change delivery address for ${orderNumber} to Flat 204, Indiranagar, Bengaluru` },
        { label: "📄 Download GST Tax Invoice", query: `Download tax invoice for ${orderNumber}` },
        { label: "❌ Request Order Cancellation Review", query: `Cancel my order ${orderNumber}` },
      ];
    }
    if (currentIntent === "hardware_diagnostic" || currentIntent === "product_question" || actionPayload?.type === "device_troubleshooter") {
      return [
        { label: "🔄 7-Day Replacement Policy", query: "What is your return policy if I want to return my shoes or electronics?" },
        { label: "🛡️ Check 1-Year Brand Warranty Terms", query: "Tell me warranty coverage details for electronics" },
        { label: "🎧 Explore Curated Product Alternatives", query: "Recommend best wireless headphones under 5000 with warranty" },
      ];
    }
    if (currentIntent === "return_request" || currentIntent === "refund_inquiry") {
      return [
        { label: "⏳ Check 3-7 Days Bank Refund SLA", query: "How many business days does it take for a refund to credit to my bank account?" },
        { label: "📦 Doorstep Return Packaging Rules", query: "What are the packaging requirements for doorstep returns?" },
        { label: "📄 Download Tax Invoice", query: `Download tax invoice for ${orderNumber}` },
      ];
    }
    return [
      { label: "📦 Track Active Orders", query: `Where is my order ${orderNumber} right now?` },
      { label: "📄 Store Return & Refund Policy", query: "What is your 7-day electronics return policy?" },
      { label: "🎧 Explore Catalogue Items", query: "Recommend best wireless headphones under 5000 with warranty" },
    ];
  };

  return (
    <div className="space-y-3 mt-2 text-xs">
      {/* 1. Transparent Agent Reasoning & Status Trace: Glossy Gold Finish */}
      {agentThoughtProcess && agentThoughtProcess.length > 0 && (
        <div
          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
            t.isDark
              ? "bg-gradient-to-b from-[#11100d] to-[#070604] border-amber-500/25 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(217,168,62,0.15)]"
              : "bg-[#f5f8f6] border-[#d8e6db] text-[#1f2923]"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-[11px] font-bold opacity-85 hover:opacity-100 transition"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-extrabold font-mono">
                <span>AI Scope & Status Trace</span>
                <span className="opacity-70 text-[10px]">
                  ({agentThoughtProcess.length} checks executed)
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 text-amber-300 transition-opacity">
              <span>{isThoughtOpen ? "Hide trace" : "View trace"}</span>
              {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isThoughtOpen && (
            <div className="px-3.5 pb-3 pt-1 border-t border-amber-500/20 space-y-1.5 font-mono text-[10px] leading-relaxed">
              {agentThoughtProcess.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 opacity-90">
                  <span className="text-amber-400 font-bold shrink-0">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Specific Action Payload Widget */}
      {actionPayload && (
        <>
          {/* A. Live Carrier GPS Telemetry Card (Read-Only Status) */}
          {actionPayload.type === "carrier_telemetry" && (
            <div
              className={`p-4 rounded-2xl border shadow-xl space-y-3 relative overflow-hidden transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#11100d] to-[#060605] border-amber-500/30 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(217,168,62,0.2)] hover:-translate-y-0.5"
                  : "bg-[#9CABB4] border-[#8396a1] text-[#141c22]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white">
                      {actionPayload.data.carrier} Telemetry
                    </div>
                    <div className="text-[10px] font-mono opacity-70">
                      AWB: {actionPayload.data.trackingNumber}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(217,168,62,0.2)]">
                  ● {actionPayload.data.status}
                </span>
              </div>

              {/* Milestones Stepper */}
              <div className="grid grid-cols-4 gap-1 text-center py-1">
                {(actionPayload.data.milestones || []).map((m: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                        m.done
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,168,62,0.6)] font-black"
                          : t.isDark
                          ? "border-amber-500/20 text-neutral-400 bg-white/5"
                          : "border-neutral-300 opacity-50"
                      }`}
                    >
                      {m.done ? "✓" : idx + 1}
                    </div>
                    <span className="text-[9px] font-semibold mt-1 leading-tight line-clamp-1 opacity-80">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Driver & Delivery Information */}
              <div
                className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                  t.isDark
                    ? "bg-black/80 border-amber-500/20 text-neutral-200"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Estimated Arrival:</span>
                  <strong className="text-amber-400 font-bold">{actionPayload.data.estimatedDelivery}</strong>
                </div>
                {actionPayload.data.deliveryPartner && (
                  <div className="flex items-center justify-between pt-1 border-t border-amber-500/15">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Carrier Driver:</span>
                      <strong className="text-white">{actionPayload.data.deliveryPartner.driverName}</strong>
                    </div>
                    <a
                      href={`tel:${actionPayload.data.deliveryPartner.driverPhone}`}
                      className="text-[10px] font-bold flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{actionPayload.data.deliveryPartner.driverPhone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons: Request Human Approval for Changes */}
              <div className="flex items-center gap-2 pt-1">
                {onSendMessage && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(
                          `Change delivery address for ${actionPayload.data.orderNumber} to `
                        )
                      }
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-bold border flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                        t.isDark
                          ? "bg-[#12110e] hover:bg-[#1a1711] text-amber-200 border-amber-500/30 hover:border-amber-400/60 shadow-sm"
                          : t.secondaryButton
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>Request Address Change</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(`Cancel my order ${actionPayload.data.orderNumber}`)
                      }
                      className="py-1.5 px-2.5 rounded-xl text-[10px] font-bold border border-amber-500/40 text-amber-400 hover:bg-amber-500/15 hover:border-amber-400/70 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Request Cancellation Approval</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* B. Order Cancellation Approval Request Card */}
          {actionPayload.type === "cancellation_approval_request" && (
            <div
              className={`p-4 rounded-2xl border space-y-2.5 shadow-xl relative overflow-hidden transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#1a1306] via-[#100b03] to-[#070501] border-amber-500/45 text-amber-100 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-amber-400/70 hover:shadow-[0_0_25px_rgba(217,168,62,0.3)] hover:-translate-y-0.5"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                  <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Cancellation Approval Request Submitted</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase border border-amber-500/30">
                  {actionPayload.data.ticketNumber}
                </span>
              </div>

              <div className="text-[11px] leading-relaxed space-y-1">
                <div>
                  <strong className="opacity-70">Order Number:</strong> {actionPayload.data.orderNumber}
                </div>
                <div>
                  <strong className="opacity-70">Order Total:</strong> ₹
                  {Number(actionPayload.data.totalAmount || 0).toLocaleString("en-IN")}
                </div>
                <div>
                  <strong className="opacity-70">Assigned Human Specialist:</strong>{" "}
                  <span className="text-amber-300 font-bold">{actionPayload.data.assignedAgent}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] opacity-90 mt-1.5 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    AI is restricted from cancelling orders or disbursing refunds autonomously.
                    Support Specialist Priya Sharma has received this approval request in the CRM queue.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* C. Address Change Approval Request Card */}
          {actionPayload.type === "address_change_approval_request" && (
            <div
              className={`p-4 rounded-2xl border space-y-2.5 shadow-xl relative overflow-hidden transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#12110c] to-[#060604] border-amber-500/35 hover:border-amber-400/60 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(217,168,62,0.2)] hover:-translate-y-0.5 text-neutral-100"
                  : "bg-blue-500/15 border-blue-500/30 text-blue-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                  <MapPin className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Address Change Approval Request</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase border border-amber-500/30">
                  {actionPayload.data.ticketNumber}
                </span>
              </div>

              <div className="text-[11px] leading-relaxed space-y-1">
                <div>
                  <strong className="opacity-70">Order:</strong> {actionPayload.data.orderNumber}
                </div>
                <div>
                  <strong className="opacity-70">Requested Destination:</strong>{" "}
                  <span className="text-white font-medium">{actionPayload.data.requestedAddress}</span>
                </div>
                <div>
                  <strong className="opacity-70">Assigned Team:</strong>{" "}
                  <span className="text-amber-300 font-bold">{actionPayload.data.assignedAgent}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] opacity-90 mt-1.5">
                  ✓ Re-routing requires staff verification with {actionPayload.data.carrier}. You will receive a confirmation alert once approved.
                </div>
              </div>
            </div>
          )}

          {/* D. Human Agent Transfer Card: Luxury Gold Glass Card */}
          {actionPayload.type === "agent_transfer" && (
            <div
              className={`p-4.5 rounded-2xl border space-y-3 shadow-2xl relative overflow-hidden transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#181305] via-[#0d0a02] to-[#050401] border-amber-500/50 shadow-[0_16px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] hover:border-amber-400/80 hover:shadow-[0_0_35px_rgba(217,168,62,0.4)] hover:-translate-y-0.5 text-white"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>Human Support Agent Connected</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase flex items-center gap-1.5 border border-amber-500/40 shadow-[0_0_12px_rgba(217,168,62,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Priority Queue</span>
                </span>
              </div>

              <div className="text-[11px] leading-relaxed space-y-1">
                <div>
                  <strong className="opacity-70">Support Specialist:</strong>{" "}
                  <span className="text-amber-300 font-bold">{actionPayload.data.assignedAgent}</span> ({actionPayload.data.role})
                </div>
                <div className="opacity-80 text-[10px] pt-1">
                  Priya Sharma has received this session along with your customer profile and verified order telemetry. You can open the live chat below to message the specialist directly.
                </div>
              </div>

              {actionPayload.data?.ticketNumber && (
                <div className="pt-2 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenTicketModal?.(
                        actionPayload.data.ticketId || actionPayload.data.ticketNumber
                      )
                    }
                    className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-[0_0_25px_rgba(217,168,62,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_35px_rgba(217,168,62,0.7)] transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      Open Live Chat with {actionPayload.data.assignedAgent} ({actionPayload.data.ticketNumber}) →
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* E. Official GST Tax Invoice Card: Glossy Gold Invoice Card */}
          {actionPayload.type === "tax_invoice" && (
            <div
              className={`p-4 rounded-2xl border space-y-3 shadow-xl transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#11100d] to-[#060604] border-amber-500/30 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-amber-400/60 hover:shadow-[0_0_25px_rgba(217,168,62,0.25)] hover:-translate-y-0.5"
                  : "bg-[#9CABB4] border-[#8396a1] text-[#141c22]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>GST Tax Invoice ({actionPayload.data.invoiceNumber})</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono text-amber-300">
                  {actionPayload.data.gstin}
                </span>
              </div>

              <div className="text-[11px] opacity-85 space-y-0.5">
                <div>
                  <strong>Billed To:</strong> {actionPayload.data.billedTo}
                </div>
                <div>
                  <strong>Total Amount:</strong> ₹
                  {Number(actionPayload.data.totalAmount || 0).toLocaleString("en-IN")}{" "}
                  (Incl. 18% IGST)
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  printTaxInvoice({
                    orderNumber: actionPayload.data.orderNumber,
                    invoiceNumber: actionPayload.data.invoiceNumber,
                    invoiceDate: actionPayload.data.invoiceDate,
                    gstin: actionPayload.data.gstin,
                    billedTo: actionPayload.data.billedTo,
                    carrier: actionPayload.data.carrier,
                    trackingNumber: actionPayload.data.trackingNumber,
                    items: actionPayload.data.items || [],
                    totalAmount: actionPayload.data.totalAmount,
                  })
                }
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 active:scale-95 ${
                  t.isDark
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black shadow-[0_0_20px_rgba(217,168,62,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] hover:shadow-[0_0_30px_rgba(217,168,62,0.65)] hover:scale-[1.02]"
                    : t.primaryButton
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Official Tax Invoice PDF</span>
              </button>
            </div>
          )}

          {/* F. Product Recommendation Cards: Luxury Gold Trim Cards */}
          {actionPayload.type === "product_recommendations" && (
            <div className="space-y-2 mt-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Catalogue In-Stock Specifications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(actionPayload.data.products || []).map((prod: any) => (
                  <div
                    key={prod._id}
                    className={`p-3.5 rounded-2xl border shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                      t.isDark
                        ? "bg-gradient-to-b from-[#11100d] to-[#070604] hover:from-[#1a1711] hover:to-[#0f0d09] border-amber-500/25 hover:border-amber-400/60 text-white shadow-black/80 hover:shadow-[0_12px_35px_rgba(217,168,62,0.25)]"
                        : "bg-[#9CABB4] border-[#8396a1] text-[#141c22]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold opacity-70 mb-1">
                        <span className="capitalize text-amber-300">{prod.category}</span>
                        <span className="text-amber-400 flex items-center gap-0.5">
                          ★ {prod.rating}
                        </span>
                      </div>
                      <div className="font-extrabold text-xs line-clamp-1">{prod.name}</div>
                      <p className="text-[10px] opacity-70 line-clamp-2 mt-0.5 leading-snug">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-500/15">
                      <div className="font-black text-sm text-amber-400">
                        ₹{Number(prod.price).toLocaleString("en-IN")}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSendMessage && (
                          <button
                            type="button"
                            onClick={() =>
                              onSendMessage(
                                `Tell me details, warranty, and return policy for ${prod.name}`
                              )
                            }
                            className={`p-1.5 rounded-lg border text-[10px] font-bold opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-105 ${
                              t.isDark
                                ? "bg-[#14120e] hover:bg-[#1f1c15] text-amber-200 border-amber-500/30"
                                : t.secondaryButton
                            }`}
                            title="Ask AI specifications"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                          </button>
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(prod)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all duration-300 hover:scale-105 ${
                              t.isDark
                                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-bold shadow-[0_0_15px_rgba(217,168,62,0.4)]"
                                : t.primaryButton
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Bag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* G. Hardware Diagnostic & Troubleshooting Wizard */}
          {actionPayload.type === "device_troubleshooter" && (
            <div
              className={`p-4 rounded-2xl border space-y-3 shadow-xl transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#11100d] to-[#070604] border-amber-500/30 text-amber-100 shadow-[0_12px_40px_rgba(0,0,0,0.85)] hover:border-amber-400/50"
                  : "bg-[#9CABB4] border-[#8396a1] text-[#141c22]"
              }`}
            >
              <div className="flex items-center gap-2 font-black text-xs text-amber-400">
                <Wrench className="w-4 h-4" />
                <span>Interactive Hardware Diagnostic Wizard</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {(actionPayload.data.steps || []).map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {troubleshootFixed === true ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Glad that resolved the problem! Enjoy your gadget.</span>
                </div>
              ) : troubleshootFixed === false ? (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-bold text-xs space-y-1">
                  <div>Understood. AI cannot replace items directly without staff approval.</div>
                  {onSendMessage && (
                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(
                          `My hardware is defective, please request human replacement approval for ${actionPayload.data.orderNumber}`
                        )
                      }
                      className="text-[11px] underline font-extrabold text-amber-300 block mt-1 hover:text-amber-200 transition-colors"
                    >
                      Click here to submit a replacement approval request to Priya Sharma &rarr;
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTroubleshootFixed(true)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    ✓ That Fixed It!
                  </button>
                  <button
                    type="button"
                    onClick={() => setTroubleshootFixed(false)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    ✕ Still Broken (Request Approval)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* H. Contextual Related Options Payload */}
          {actionPayload.type === "related_options" && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#11100d] to-[#070604] border-amber-500/25 text-white shadow-lg"
                  : "bg-[#f4fbf6] border-[#cae5d1] text-[#1a3824]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-xs flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Related Support Options</span>
                </div>
                <span className="text-[10px] opacity-70 text-amber-300">Tailored for your inquiry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {(actionPayload.data.options || []).map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage?.(opt.query)}
                    className={`p-2.5 rounded-xl text-left text-[10px] font-semibold border transition-all duration-200 hover:scale-[1.01] active:scale-98 flex items-center justify-between group ${
                      opt.label.includes("Agent")
                        ? "col-span-1 sm:col-span-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-amber-500/50 text-amber-200 font-black shadow-[0_0_15px_rgba(217,168,62,0.2)]"
                        : t.isDark
                        ? "bg-black/60 border-amber-500/20 hover:border-amber-400/50 text-white"
                        : `${t.card} border-current/15 hover:border-emerald-500/40`
                    }`}
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:text-amber-400 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Interactive Resolution Check & Related Options Flow */}
      {actionPayload?.type !== "agent_transfer" && actionPayload?.type !== "related_options" && (
        <div className="pt-1">
          {resolutionStatus === "pending" && (
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-300 shadow-lg ${
                t.isDark
                  ? "bg-gradient-to-b from-[#11100d] to-[#070604] border-amber-500/25 text-white shadow-black/60"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold opacity-90">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Did this answer your question or resolve your issue?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setResolutionStatus("resolved")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 flex items-center gap-1 active:scale-95 hover:scale-105 ${
                    t.isDark
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Yes, resolved</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionStatus("unresolved")}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-200 flex items-center gap-1 active:scale-95 hover:scale-105 ${
                    t.isDark
                      ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(217,168,62,0.2)]"
                      : "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Need more help</span>
                </button>
              </div>
            </div>
          )}

          {resolutionStatus === "resolved" && (
            <div
              className={`p-3.5 rounded-2xl border text-[11px] space-y-2 transition-all duration-300 ${
                t.isDark
                  ? "bg-[#06170e] border-emerald-500/30 text-emerald-300 shadow-lg"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Glad to hear your issue is resolved! 🎉 Is there anything else you'd like to check?</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => onSendMessage?.("Where is my order ORD-1001 right now?")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    t.isDark
                      ? "bg-black/60 hover:bg-amber-500/20 border-amber-500/25 text-white"
                      : "border-current/20 hover:bg-current/10"
                  }`}
                >
                  📦 Track another order
                </button>
                <button
                  type="button"
                  onClick={() => onSendMessage?.("Download tax invoice for ORD-1001")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    t.isDark
                      ? "bg-black/60 hover:bg-amber-500/20 border-amber-500/25 text-white"
                      : "border-current/20 hover:bg-current/10"
                  }`}
                >
                  📄 Download GST Invoice
                </button>
                <button
                  type="button"
                  onClick={() => onSendMessage?.("Recommend best wireless headphones under 5000 with warranty")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                    t.isDark
                      ? "bg-black/60 hover:bg-amber-500/20 border-amber-500/25 text-white"
                      : "border-current/20 hover:bg-current/10"
                  }`}
                >
                  🛍️ Explore Products
                </button>
              </div>
            </div>
          )}

          {resolutionStatus === "unresolved" && (
            <div
              className={`p-4 rounded-2xl border text-[11px] space-y-3 shadow-xl transition-all duration-300 ${
                t.isDark
                  ? "bg-gradient-to-b from-[#181005] to-[#0c0802] border-amber-500/35 text-amber-100"
                  : "bg-amber-500/10 border-amber-500/25 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Related Options to Help Resolve Your Issue</span>
                </div>
                <span className="text-[10px] opacity-70 text-amber-300">Assistance Step 2</span>
              </div>

              <p className="text-[10px] opacity-85 leading-snug">
                Since your issue is not fully resolved, here are direct options based on your request, or you can request to connect directly with a human specialist:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {getRelatedOptions(intent, actionPayload?.data?.orderNumber).map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onSendMessage?.(opt.query)}
                    className={`p-2.5 rounded-xl text-left text-[10px] font-semibold border transition-all duration-200 hover:scale-[1.01] active:scale-98 flex items-center justify-between group ${
                      t.isDark
                        ? "bg-black/60 hover:bg-amber-500/10 border-amber-500/20 text-neutral-100 hover:border-amber-400/50"
                        : "bg-white/60 hover:bg-amber-500/20 border-amber-500/20 text-neutral-900"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:text-amber-400 transition-transform" />
                  </button>
                ))}

                {/* Direct Human Agent Request Option */}
                <button
                  type="button"
                  onClick={() =>
                    onSendMessage?.("Connect me to a real person right now, I want human support.")
                  }
                  className={`col-span-1 sm:col-span-2 p-3 rounded-xl text-left text-xs font-black border transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-98 hover:scale-[1.01] ${
                    t.isDark
                      ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-yellow-500/30 border-amber-500/50 text-amber-200 shadow-[0_0_20px_rgba(217,168,62,0.25)] hover:shadow-[0_0_30px_rgba(217,168,62,0.4)]"
                      : "bg-emerald-500/15 border-emerald-500/40 text-emerald-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Request Connect to Human Support Agent (Priya Sharma)</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 underline">Connect &rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

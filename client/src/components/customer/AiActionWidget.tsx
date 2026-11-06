import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Phone,
  MapPin,
  XCircle,
  Copy,
  Check,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Wrench,
  ShoppingBag,
  Tag,
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
      | "address_updated"
      | "order_cancelled"
      | "return_initiated"
      | "compensation_coupon"
      | "tax_invoice"
      | "device_troubleshooter";
    data: Record<string, any>;
  };
  agentThoughtProcess?: string[];
  onSendMessage?: (text: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const AiActionWidget: React.FC<AiActionWidgetProps> = ({
  actionPayload,
  agentThoughtProcess,
  onSendMessage,
  onAddToCart,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [troubleshootFixed, setTroubleshootFixed] = useState<boolean | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-3 mt-2 text-xs">
      {/* 1. Transparent Autonomous Agent Reasoning & Tool Trace */}
      {agentThoughtProcess && agentThoughtProcess.length > 0 && (
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            t.isDark
              ? "bg-[#181714] border-[#383324] text-[#f5e7bf]"
              : "bg-[#f5f8f6] border-[#d8e6db] text-[#1f2923]"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsThoughtOpen(!isThoughtOpen)}
            className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold opacity-80 hover:opacity-100 transition"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">
                <span>Autonomous Agent Trace</span>
                <span className="opacity-60 text-[10px]">
                  ({agentThoughtProcess.length} steps executed)
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] opacity-60">
              <span>{isThoughtOpen ? "Hide reasoning" : "View reasoning"}</span>
              {isThoughtOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {isThoughtOpen && (
            <div className="px-3 pb-3 pt-1 border-t border-current/10 space-y-1.5 font-mono text-[10px] leading-relaxed">
              {agentThoughtProcess.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 opacity-85">
                  <span className="text-emerald-500 font-bold shrink-0">[{idx + 1}]</span>
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
          {/* A. Live Carrier GPS Telemetry Card */}
          {actionPayload.type === "carrier_telemetry" && (
            <div
              className={`p-4 rounded-2xl border shadow-md space-y-3 ${
                t.isDark ? "bg-[#181714] border-[#d9a83e]/30" : "bg-white border-[#cfe2d4]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-current/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs">
                      {actionPayload.data.carrier} Telemetry
                    </div>
                    <div className="text-[10px] font-mono opacity-70">
                      AWB: {actionPayload.data.trackingNumber}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  ● {actionPayload.data.status}
                </span>
              </div>

              {/* Milestones Stepper */}
              <div className="grid grid-cols-4 gap-1 text-center py-1">
                {(actionPayload.data.milestones || []).map((m: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                        m.done
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                          : "border-current/20 opacity-40"
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
              <div className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${t.cardMuted} ${t.divider}`}>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Estimated Arrival:</span>
                  <strong className={t.accentText}>{actionPayload.data.estimatedDelivery}</strong>
                </div>
                {actionPayload.data.deliveryPartner && (
                  <div className="flex items-center justify-between pt-1 border-t border-current/10">
                    <div className="flex items-center gap-1.5">
                      <span className="opacity-70">Carrier Driver:</span>
                      <strong>{actionPayload.data.deliveryPartner.driverName}</strong>
                    </div>
                    <a
                      href={`tel:${actionPayload.data.deliveryPartner.driverPhone}`}
                      className="text-[10px] font-bold flex items-center gap-1 text-emerald-600 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{actionPayload.data.deliveryPartner.driverPhone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Autonomous Action Quick Buttons */}
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
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10px] font-bold border flex items-center justify-center gap-1.5 transition ${t.secondaryButton}`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span>Update Address</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(`Cancel my order ${actionPayload.data.orderNumber}`)
                      }
                      className="py-1.5 px-2.5 rounded-xl text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Cancel Order</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* B. Product Recommendation Carousel / Cards */}
          {actionPayload.type === "product_recommendations" && (
            <div className="space-y-2 mt-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Curated In-Stock Recommendations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(actionPayload.data.products || []).map((prod: any) => (
                  <div
                    key={prod._id}
                    className={`p-3 rounded-2xl border shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                      t.isDark
                        ? "bg-[#181714] border-[#383324]"
                        : "bg-white border-[#d2ead7]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold opacity-70 mb-1">
                        <span className="capitalize">{prod.category}</span>
                        <span className="text-amber-500 flex items-center gap-0.5">
                          ★ {prod.rating}
                        </span>
                      </div>
                      <div className="font-extrabold text-xs line-clamp-1">{prod.name}</div>
                      <p className="text-[10px] opacity-70 line-clamp-2 mt-0.5 leading-snug">
                        {prod.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-current/10">
                      <div className={`font-black text-sm ${t.accentText}`}>
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
                            className={`p-1.5 rounded-lg border text-[10px] font-bold opacity-80 hover:opacity-100 ${t.secondaryButton}`}
                            title="Ask AI specifications"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(prod)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition ${t.primaryButton}`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. Address Updated Confirmation Card */}
          {actionPayload.type === "address_updated" && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-black text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Carrier Route Updated Successfully</span>
              </div>
              <div className="text-[11px] leading-relaxed">
                <div>
                  <strong className="opacity-70">Order:</strong> {actionPayload.data.orderNumber}
                </div>
                <div>
                  <strong className="opacity-70">New Destination:</strong>{" "}
                  {actionPayload.data.newAddress}
                </div>
                <div className="opacity-80 text-[10px] mt-1">
                  ✓ Telemetry synchronized with {actionPayload.data.carrier}. No delay in scheduled dispatch.
                </div>
              </div>
            </div>
          )}

          {/* D. Order Cancelled & Instant Refund Confirmation */}
          {actionPayload.type === "order_cancelled" && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-black text-xs text-rose-700 dark:text-rose-400">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Order Cancelled • Refund Scheduled</span>
              </div>
              <div className="text-[11px] leading-relaxed space-y-0.5">
                <div>
                  <strong className="opacity-70">Cancelled Order:</strong>{" "}
                  {actionPayload.data.orderNumber}
                </div>
                <div>
                  <strong className="opacity-70">Refund Amount:</strong> ₹
                  {Number(actionPayload.data.refundAmount || 0).toLocaleString("en-IN")}
                </div>
                <div>
                  <strong className="opacity-70">Destination:</strong>{" "}
                  {actionPayload.data.refundMode}
                </div>
                <div className="opacity-80 text-[10px] pt-1">
                  Timeline: Reimbursement credits within {actionPayload.data.refundEta}.
                </div>
              </div>
            </div>
          )}

          {/* E. Return & Doorstep Exchange RMA Card */}
          {actionPayload.type === "return_initiated" && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-800 dark:text-indigo-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-indigo-700 dark:text-indigo-400">
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Return & Doorstep Pickup Scheduled</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20">
                  {actionPayload.data.rmaNumber}
                </span>
              </div>
              <div className="text-[11px] leading-relaxed space-y-0.5">
                <div>
                  <strong className="opacity-70">Item:</strong> {actionPayload.data.itemName}
                </div>
                <div>
                  <strong className="opacity-70">Scheduled Pickup:</strong>{" "}
                  {actionPayload.data.pickupDate} ({actionPayload.data.pickupSlot})
                </div>
                <div>
                  <strong className="opacity-70">Logistics Carrier:</strong>{" "}
                  {actionPayload.data.carrier}
                </div>
                <div className="opacity-80 text-[10px] pt-1">
                  ✓ Doorstep quality check required. Refund initiates instantly upon agent barcode scan.
                </div>
              </div>
            </div>
          )}

          {/* F. Apology / Delay Compensation Voucher */}
          {actionPayload.type === "compensation_coupon" && (
            <div
              className={`p-4 rounded-2xl border space-y-2.5 ${
                t.isDark
                  ? "bg-[#1f1d16] border-[#d9a83e]/40"
                  : "bg-[#eaf5ee] border-[#a9ddb7]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-emerald-600 dark:text-[#d9a83e]">
                  <Tag className="w-4 h-4" />
                  <span>Goodwill Care Voucher Authorized</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600">
                  Flat ₹{actionPayload.data.discountAmount} OFF
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-current/30 bg-white/40 dark:bg-black/20">
                <div>
                  <div className="font-mono font-black text-sm tracking-wider">
                    {actionPayload.data.couponCode}
                  </div>
                  <div className="text-[10px] opacity-70">
                    Min Cart: ₹{actionPayload.data.minCartValue} • Valid till{" "}
                    {actionPayload.data.expiryDate}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(actionPayload.data.couponCode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${t.primaryButton}`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          )}

          {/* G. Official GST Tax Invoice Card */}
          {actionPayload.type === "tax_invoice" && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                t.isDark ? "bg-[#181714] border-[#383324]" : "bg-white border-[#d2ead7]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>GST Tax Invoice ({actionPayload.data.invoiceNumber})</span>
                </div>
                <span className="text-[10px] opacity-70 font-mono">
                  {actionPayload.data.gstin}
                </span>
              </div>

              <div className="text-[11px] opacity-80 space-y-0.5">
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
                className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ${t.primaryButton}`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download Official Tax Invoice PDF</span>
              </button>
            </div>
          )}

          {/* H. Hardware Diagnostic & Troubleshooting Wizard */}
          {actionPayload.type === "device_troubleshooter" && (
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                t.isDark ? "bg-[#1c1b18] border-[#383324]" : "bg-white border-[#d2ead7]"
              }`}
            >
              <div className="flex items-center gap-2 font-black text-xs text-purple-600 dark:text-purple-400">
                <Wrench className="w-4 h-4" />
                <span>Interactive Hardware Diagnostic Wizard</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {(actionPayload.data.steps || []).map((step: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {troubleshootFixed === true ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Glad that resolved the problem! Enjoy your gadget.</span>
                </div>
              ) : troubleshootFixed === false ? (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 font-bold text-xs space-y-1">
                  <div>Understood. Eligible for free replacement under warranty.</div>
                  {onSendMessage && (
                    <button
                      type="button"
                      onClick={() =>
                        onSendMessage(
                          `My hardware is defective, please initiate 7-day replacement for ${actionPayload.data.orderNumber}`
                        )
                      }
                      className="text-[11px] underline font-extrabold text-rose-700 dark:text-rose-400"
                    >
                      Click here to trigger 1-click replacement RMA &rarr;
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTroubleshootFixed(true)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 transition"
                  >
                    ✓ That Fixed It!
                  </button>
                  <button
                    type="button"
                    onClick={() => setTroubleshootFixed(false)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 transition"
                  >
                    ✕ Still Broken
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

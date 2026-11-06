import React, { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Sparkles,
  ShieldCheck,
  X,
  Upload,
} from "lucide-react";
import type { Order, ReturnRequest } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { INITIAL_RETURNS } from "../../utils/mockCrmData";

interface ReturnsRefundsViewProps {
  orders: Order[];
  onOpenAiWithReturnQuery: (query: string) => void;
}

export const ReturnsRefundsView: React.FC<ReturnsRefundsViewProps> = ({
  orders,
  onOpenAiWithReturnQuery,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(() => {
    // Filter returns relevant to current user
    return INITIAL_RETURNS.filter(
      (r) =>
        r.customerEmail.toLowerCase() === (user?.email || "customer@shopease.local").toLowerCase()
    );
  });

  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [selectedOrderNum, setSelectedOrderNum] = useState(orders[0]?.orderNumber || "");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [reason, setReason] = useState<ReturnRequest["reason"]>("defective");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.orderNumber === selectedOrderNum);

  const handleOpenModal = (orderNumber?: string) => {
    if (orderNumber) {
      setSelectedOrderNum(orderNumber);
      const ord = orders.find((o) => o.orderNumber === orderNumber);
      if (ord && ord.items.length > 0) {
        setSelectedItemName(ord.items[0].name);
      }
    } else if (orders.length > 0) {
      setSelectedOrderNum(orders[0].orderNumber);
      if (orders[0].items.length > 0) {
        setSelectedItemName(orders[0].items[0].name);
      }
    }
    setDescription("");
    setShowNewReturnModal(true);
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderNum || !description.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const ord = orders.find((o) => o.orderNumber === selectedOrderNum);
      const item = ord?.items.find((i) => i.name === selectedItemName) || ord?.items[0];
      const refundAmt = item ? item.price * item.quantity : 2499;

      const newReturn: ReturnRequest = {
        _id: `ret-${Date.now()}`,
        returnNumber: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: selectedOrderNum,
        customerName: user?.name || "Customer",
        customerEmail: user?.email || "customer@shopease.local",
        productName: selectedItemName || item?.name || "Studio Wireless Headphones",
        reason,
        description: description.trim(),
        status: "pending_review",
        refundAmount: refundAmt,
        requestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trackingAwb: `DEL-RET-${Math.floor(10000 + Math.random() * 90000)}`,
      };

      setReturnRequests((prev) => [newReturn, ...prev]);
      setSubmitting(false);
      setShowNewReturnModal(false);
      setFeedbackSuccess(`Return request ${newReturn.returnNumber} submitted successfully! Support staff has been notified.`);
      setTimeout(() => setFeedbackSuccess(null), 6000);
    }, 600);
  };

  const getStatusBadge = (status: ReturnRequest["status"]) => {
    switch (status) {
      case "pending_review":
        return <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${t.badgeWarning}`}>● Under Review</span>;
      case "approved":
        return <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${t.badgeInfo}`}>● Pickup Approved</span>;
      case "pickup_scheduled":
        return <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${t.badgeInfo}`}>● Delhivery Scheduled</span>;
      case "refund_processed":
        return <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${t.badgeSuccess}`}>✓ Refund Credited</span>;
      case "rejected":
        return <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase bg-rose-500/20 text-rose-400">✕ Rejected</span>;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <RotateCcw className={`w-7 h-7 ${t.accentText}`} />
            <span>Returns & Instant Refunds Portal</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Official 7-day hassle-free replacement, door-step courier pickup, and automated bank refund tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAiWithReturnQuery("What is your 7-day electronics return policy and refund SLA?")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 shadow-xs transition active:scale-95 ${t.secondaryButton}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${t.accentText}`} />
            <span>AI Return Policy Check</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-95 transition ${t.primaryButton}`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Return Request</span>
          </button>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Return Policy Assurance Strip */}
      <div className={`p-4 rounded-3xl border grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm text-xs ${t.cardMuted} ${t.divider}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black">7-Day Guarantee</div>
            <div className="opacity-70 text-[11px]">Free replacement on defective electronics</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black">Doorstep Pickup</div>
            <div className="opacity-70 text-[11px]">Delhivery Express collects from your address</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl shrink-0 ${t.isDark ? "bg-[#382f1c] text-[#f5e7bf]" : "bg-[#e6f4ea] text-[#059669]"}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-black">3-5 Day Bank Refund</div>
            <div className="opacity-70 text-[11px]">Direct transfer to source payment account</div>
          </div>
        </div>
      </div>

      {/* Active Return Requests List */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider opacity-80">
          Your Return & Refund Requests ({returnRequests.length})
        </h2>

        {returnRequests.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${t.cardMuted} ${t.divider}`}>
            <RotateCcw className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <h3 className="font-black text-sm">No active return requests</h3>
            <p className="text-xs opacity-70 mt-1">
              If an item is defective or doesn't meet expectations, click "Create Return Request" above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {returnRequests.map((ret) => (
              <div
                key={ret._id}
                className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${t.card}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-current/10 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-black text-sm ${t.accentText}`}>
                        {ret.returnNumber}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className="text-xs font-bold">Order #{ret.orderNumber}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">
                      Requested on {new Date(ret.requestedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(ret.status)}
                    <span className="font-black text-base">
                      Refund: <strong className={t.accentText}>₹{ret.refundAmount.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-bold opacity-70 uppercase tracking-wider text-[10px]">Returned Product & Reason</div>
                    <div className="font-bold text-sm">{ret.productName}</div>
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-current/10 font-semibold text-[11px] capitalize">
                      Reason: {ret.reason.replace("_", " ")}
                    </div>
                    <p className="opacity-75 italic text-[11px] pt-1">"{ret.description}"</p>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
                    <div className="font-bold opacity-80 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Reverse Courier Telemetry</span>
                    </div>
                    <div className="text-xs">
                      Courier: <strong>Delhivery Reverse Express</strong>
                    </div>
                    <div className="text-xs">
                      Return AWB: <strong className="font-mono text-emerald-600">{ret.trackingAwb}</strong>
                    </div>
                    <div className="text-[10px] opacity-70">
                      Doorstep pickup verification required before automated bank payout.
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-current/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAiWithReturnQuery(
                        `What is the live refund status for return request ${ret.returnNumber} on order ${ret.orderNumber}?`
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${t.secondaryButton}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Track Return with AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Return Modal */}
      {showNewReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${t.card}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <h3 className="font-black text-base flex items-center gap-2">
                <RotateCcw className={`w-5 h-5 ${t.accentText}`} />
                <span>Submit Product Return Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewReturnModal(false)}
                className="p-1 rounded-xl opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 opacity-80">Select Eligible Order</label>
                <select
                  value={selectedOrderNum}
                  onChange={(e) => {
                    setSelectedOrderNum(e.target.value);
                    const ord = orders.find((o) => o.orderNumber === e.target.value);
                    if (ord && ord.items.length > 0) setSelectedItemName(ord.items[0].name);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${t.input}`}
                >
                  {orders.map((o) => (
                    <option key={o._id} value={o.orderNumber}>
                      {o.orderNumber} - ₹{o.totalAmount.toLocaleString("en-IN")} ({new Date(o.placedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div>
                  <label className="block font-bold mb-1 opacity-80">Select Item to Return</label>
                  <select
                    value={selectedItemName}
                    onChange={(e) => setSelectedItemName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${t.input}`}
                  >
                    {selectedOrder.items.map((i, idx) => (
                      <option key={idx} value={i.name}>
                        {i.name} (Qty: {i.quantity} • ₹{i.price.toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 opacity-80">Return Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="defective">Defective / Damaged Hardware</option>
                  <option value="wrong_item">Wrong Item / Color Received</option>
                  <option value="size_fit">Size or Fit Issue</option>
                  <option value="not_as_described">Item Not As Described on Site</option>
                  <option value="changed_mind">Changed Mind (7-Day Return Guarantee)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Detailed Reason / Problem Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why you wish to return this product. Include any hardware symptoms or defects..."
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none leading-relaxed ${t.input}`}
                />
              </div>

              {/* Photo Upload Simulation Box */}
              <div className={`p-3.5 rounded-2xl border border-dashed text-center space-y-1 cursor-pointer ${t.cardMuted} ${t.divider}`}>
                <Upload className="w-5 h-5 mx-auto opacity-50" />
                <div className="font-bold text-[11px]">Upload Product Damage Photos (Optional)</div>
                <div className="text-[10px] opacity-60">PNG, JPG up to 10MB</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600">
                ✓ <strong>100% Policy Grounded:</strong> Approved returns receive instant pickup scheduling via Delhivery. Refund is credited back to your bank within 3-5 business days of inspection.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => setShowNewReturnModal(false)}
                  className="px-4 py-2 rounded-xl opacity-70 hover:opacity-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl font-black shadow-lg ${t.primaryButton}`}
                >
                  {submitting ? "Submitting Request..." : "Confirm & Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

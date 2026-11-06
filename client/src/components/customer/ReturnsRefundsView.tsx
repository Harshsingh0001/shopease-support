import React, { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Truck,
  Plus,
  Sparkles,
  ShieldCheck,
  X,
  Search,
  Copy,
  Check,
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
    return INITIAL_RETURNS.filter(
      (r) =>
        r.customerEmail.toLowerCase() === (user?.email || "customer@shopease.local").toLowerCase()
    );
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  const [showNewReturnModal, setShowNewReturnModal] = useState(false);
  const [selectedOrderNum, setSelectedOrderNum] = useState(orders[0]?.orderNumber || "");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [reason, setReason] = useState<ReturnRequest["reason"]>("defective");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.orderNumber === selectedOrderNum);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(id);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

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
      setFeedbackSuccess(`Return request ${newReturn.returnNumber} submitted successfully! Support staff specialist Priya Sharma has been notified.`);
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

  const getReverseStep = (status: ReturnRequest["status"]) => {
    switch (status) {
      case "pending_review":
        return 1;
      case "approved":
        return 2;
      case "pickup_scheduled":
        return 3;
      case "refund_processed":
        return 4;
      default:
        return 1;
    }
  };

  // Filter & Search
  const filteredReturns = returnRequests.filter((r) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && r.status === "pending_review") ||
      (filterStatus === "approved" && (r.status === "approved" || r.status === "pickup_scheduled")) ||
      (filterStatus === "refunded" && r.status === "refund_processed");

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      r.returnNumber.toLowerCase().includes(query) ||
      r.orderNumber.toLowerCase().includes(query) ||
      r.productName.toLowerCase().includes(query) ||
      (r.trackingAwb && r.trackingAwb.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const totalRefunded = returnRequests
    .filter((r) => r.status === "refund_processed")
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <RotateCcw className={`w-7 h-7 ${t.accentText}`} />
            <span>Returns & Instant Refunds Portal</span>
          </h1>
          <p className="text-xs opacity-75 mt-0.5">
            Official 7-day doorstep replacement, reverse Delhivery pickup tracking, and automated bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAiWithReturnQuery("What is your 7-day electronics return policy and refund SLA?")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 shadow-xs transition active:scale-95 ${t.secondaryButton}`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${t.accentText}`} />
            <span>Return Policy FAQ</span>
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

      {/* KPI Assurance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Requests</div>
          <div className="text-xl font-black">{returnRequests.length}</div>
          <div className="text-[10px] opacity-65">Under 7-day buyer guarantee</div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Pickups Scheduled</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">
            {returnRequests.filter((r) => r.status === "pickup_scheduled" || r.status === "approved").length}
          </div>
          <div className="text-[10px] opacity-65">Via Delhivery Reverse Logistics</div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Refunded</div>
          <div className={`text-xl font-black ${t.accentText}`}>
            ₹{totalRefunded.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] opacity-65">Direct to Bank / Original UPI</div>
        </div>

        <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Payout Timeline</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">3 to 7 Days</div>
          <div className="text-[10px] opacity-65">Post doorstep QC verification</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Returns", count: returnRequests.length },
              { id: "pending", label: "Under Review", count: returnRequests.filter((r) => r.status === "pending_review").length },
              { id: "approved", label: "Pickup Approved", count: returnRequests.filter((r) => r.status === "approved" || r.status === "pickup_scheduled").length },
              { id: "refunded", label: "Refund Credited", count: returnRequests.filter((r) => r.status === "refund_processed").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? t.primaryButton
                    : `${t.secondaryButton} opacity-80 hover:opacity-100`
                }`}
              >
                <span>{tab.label}</span>
                <span className="opacity-70 text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by return #, order #, or item..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none ${t.input}`}
            />
          </div>
        </div>
      </div>

      {/* Active Return Requests List */}
      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
            <RotateCcw className="w-12 h-12 mx-auto opacity-30" />
            <h3 className="font-black text-sm">No return requests found</h3>
            <p className="text-xs opacity-70">
              {searchQuery
                ? `No requests match "${searchQuery}". Try a different keyword.`
                : "If you received a defective or damaged product, click Create Return Request above."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((ret) => {
              const currentStep = getReverseStep(ret.status);

              return (
                <div
                  key={ret._id}
                  className={`p-6 rounded-3xl border shadow-xl transition-all space-y-4 ${t.card}`}
                >
                  {/* Return Item Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-current/10 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-base ${t.accentText}`}>
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

                  {/* Reverse Stepper Progress */}
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${t.cardMuted} ${t.divider}`}>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="opacity-80">Reverse Logistics Progress</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">Stage {currentStep} of 4</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${currentStep >= 1 ? "bg-emerald-500" : "bg-current/10"}`} />
                        <div className={currentStep >= 1 ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>Request Logged</div>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${currentStep >= 2 ? "bg-emerald-500" : "bg-current/10"}`} />
                        <div className={currentStep >= 2 ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>Staff Review</div>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${currentStep >= 3 ? "bg-emerald-500" : "bg-current/10"}`} />
                        <div className={currentStep >= 3 ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>Doorstep Pickup</div>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-2 rounded-full ${currentStep >= 4 ? "bg-emerald-500" : "bg-current/10"}`} />
                        <div className={currentStep >= 4 ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}>Refund Credited</div>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="font-bold opacity-70 uppercase tracking-wider text-[10px]">Returned Item & Claim</div>
                      <div className="font-bold text-sm">{ret.productName}</div>
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-current/10 font-semibold text-[11px] capitalize">
                        Claim Reason: {ret.reason.replace("_", " ")}
                      </div>
                      <p className="opacity-75 italic text-[11px] pt-1 leading-relaxed">"{ret.description}"</p>
                    </div>

                    <div className={`p-4 rounded-2xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
                      <div className="font-bold opacity-80 uppercase tracking-wider text-[10px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Reverse Courier Logistics</span>
                        </div>
                        <span className="text-[10px] opacity-70">Delhivery Partner</span>
                      </div>
                      <div className="text-xs flex items-center justify-between">
                        <span>Courier: <strong>Delhivery Reverse Express</strong></span>
                      </div>
                      <div className="text-xs flex items-center justify-between">
                        <span>Return AWB: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{ret.trackingAwb}</strong></span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(ret.trackingAwb || "", ret._id)}
                          className="p-1 rounded hover:bg-current/10 transition"
                          title="Copy Return AWB"
                        >
                          {copiedAwb === ret._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                        </button>
                      </div>
                      <div className="text-[10px] opacity-70 pt-0.5">
                        Please keep original box and accessories intact for courier doorstep inspection.
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-current/10 flex items-center justify-between">
                    <span className="text-[11px] opacity-70">
                      Refund SLA: <strong>3 to 7 business days</strong> to source account
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenAiWithReturnQuery(
                          `What is the live refund status for return request ${ret.returnNumber} on order ${ret.orderNumber}?`
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition active:scale-95 ${t.secondaryButton}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Track with AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
                <span>Submit Return & Replacement Request</span>
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
                        {i.name} (Qty: {i.quantity} - ₹{i.price.toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 opacity-80">Reason for Return</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReturnRequest["reason"])}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${t.input}`}
                >
                  <option value="defective">Defective / Manufacturing Glitch</option>
                  <option value="damaged">Physically Damaged in Transit</option>
                  <option value="wrong_item">Received Wrong Product / Color / Spec</option>
                  <option value="missing_parts">Missing Box Accessories or Cable</option>
                  <option value="not_satisfied">Does Not Match Website Description</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 opacity-80">Describe Issue in Detail</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Explain the defect, malfunction, or issue with the package..."
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div className="p-3 rounded-2xl bg-current/5 border border-current/10 text-[11px] opacity-80 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Doorstep Inspection Policy</span>
                </div>
                <div>
                  Courier partner Delhivery Express will verify item serial number and outer box condition at doorstep before collecting.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-current/10">
                <button
                  type="button"
                  onClick={() => setShowNewReturnModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold border transition ${t.secondaryButton}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl font-black shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 ${t.primaryButton}`}
                >
                  {submitting ? "Submitting..." : "Submit Return Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

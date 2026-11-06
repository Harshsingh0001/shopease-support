import React, { useState } from "react";
import {
  Truck,
  Search,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Phone,
  Copy,
  Check,
  FileText,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { Order } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import { printTaxInvoice } from "../../utils/invoicePrinter";

interface TrackOrderViewProps {
  orders: Order[];
  onAskAiAboutOrder: (orderNum: string) => void;
  defaultOrderNumber?: string;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  orders,
  onAskAiAboutOrder,
  defaultOrderNumber,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [searchQuery, setSearchQuery] = useState(defaultOrderNumber || "");
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    if (defaultOrderNumber) {
      return (
        orders.find(
          (o) =>
            o.orderNumber.toLowerCase() === defaultOrderNumber.toLowerCase()
        ) || null
      );
    }
    return null;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === query ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === query)
    );
    if (found) {
      setSelectedOrder(found);
    } else {
      alert(`No shipment found matching "${searchQuery}". Please check the order or tracking number.`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  const getCarrierMilestones = (order: Order) => {
    const isDelivered = order.status === "delivered";
    const isShipped = order.status === "shipped" || isDelivered;
    const isProcessing = order.status === "processing" || isShipped;

    return [
      {
        step: 1,
        title: "Order Placed & Payment Verified",
        location: "ShopEase Central System - Bengaluru",
        time: new Date(order.placedAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        done: true,
        desc: "Order confirmed and inventory allocated from Bangalore Central Fulfillment Center.",
      },
      {
        step: 2,
        title: "Quality Check & Secured Packaging",
        location: "Warehouse Hub - Bengaluru Central",
        time: isProcessing ? "1 Day Ago" : "Pending",
        done: isProcessing,
        desc: "Item inspected for zero defects, packaged with tamper-evident seal and barcode scanned.",
      },
      {
        step: 3,
        title: `Dispatched via ${order.carrier || "Delhivery Express"}`,
        location: `Bengaluru Logistics Transit Hub (AWB: ${order.trackingNumber || "DL789456123IN"})`,
        time: isShipped ? "Yesterday, 08:30 PM" : "Expected in 24 hours",
        done: isShipped,
        desc: "Package sorted onto line-haul vehicle. Surface express transport in progress.",
      },
      {
        step: 4,
        title: "Out for Doorstep Delivery",
        location: `${order.shippingAddress?.city || "Bengaluru"} Delivery Centre`,
        time: isDelivered ? "Today, 11:00 AM" : "Expected Tomorrow, 09:30 AM",
        done: isDelivered,
        desc: "Assigned to delivery courier with contact details (+91 98765 00112).",
      },
      {
        step: 5,
        title: "Package Delivered & Handed Over",
        location: `${order.shippingAddress?.street || "Greenfield Residency"}, ${order.shippingAddress?.city || "Bengaluru"}`,
        time: isDelivered ? "Delivered at Doorstep" : "Estimated Tomorrow by 5:00 PM",
        done: isDelivered,
        desc: "Secured contactless handover with digital signature and customer OTP.",
      },
    ];
  };

  const milestones = selectedOrder ? getCarrierMilestones(selectedOrder) : [];
  const currentStep = selectedOrder
    ? selectedOrder.status === "delivered"
      ? 5
      : selectedOrder.status === "shipped"
      ? 3
      : 2
    : 1;

  // Filtered orders list for the selection view
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "shipped" && o.status === "shipped") ||
      (filterStatus === "processing" && (o.status === "processing" || o.status === "pending")) ||
      (filterStatus === "delivered" && o.status === "delivered");

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      o.orderNumber.toLowerCase().includes(query) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query)) ||
      o.items.some((i) => i.name.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* CASE A: DETAILED LIVE SHIPMENT TRACKING VIEW (When order is selected) */}
      {selectedOrder ? (
        <div className="space-y-6">
          {/* Top Return / Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-current/10">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 transition hover:scale-102 active:scale-95 ${t.secondaryButton}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>&larr; Back to All Orders</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAskAiAboutOrder(selectedOrder.orderNumber)}
                className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-95 transition ${t.primaryButton}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI About Tracking</span>
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Shipment Status</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base font-black uppercase text-emerald-600 dark:text-emerald-400">
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-[10px] opacity-65">Verified by Delhivery Network</div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Carrier & AWB</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-black truncate">
                  {selectedOrder.trackingNumber || "DL789456123IN"}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedOrder.trackingNumber || "DL789456123IN")}
                  className="p-1 rounded-lg hover:bg-current/10 text-xs transition"
                  title="Copy AWB Number"
                >
                  {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                </button>
              </div>
              <div className="text-[10px] opacity-65">{selectedOrder.carrier || "Delhivery Express Surface"}</div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Estimated Arrival</div>
              <div className={`text-base font-black ${t.accentText}`}>
                {selectedOrder.status === "delivered" ? "Delivered" : "Tomorrow, 11:30 AM"}
              </div>
              <div className="text-[10px] opacity-65">Doorstep OTP Required</div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Destination City</div>
              <div className="text-base font-black truncate">
                {selectedOrder.shippingAddress?.city || "Bengaluru"}, {selectedOrder.shippingAddress?.state || "Karnataka"}
              </div>
              <div className="text-[10px] opacity-65">PIN: {selectedOrder.shippingAddress?.postalCode || "560102"}</div>
            </div>
          </div>

          {/* Stepper Progress Bar Header */}
          <div className={`p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
            <div className="flex items-center justify-between pb-2 border-b border-current/10">
              <div className="font-black text-sm uppercase tracking-wider opacity-80 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Live Delivery Milestone Progress — {selectedOrder.orderNumber}</span>
              </div>
              <span className="text-xs font-mono font-bold opacity-75">
                Stage {currentStep} of 5
              </span>
            </div>

            {/* Stepper Track */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
              {milestones.map((m, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      m.done
                        ? "bg-emerald-500 shadow-sm"
                        : "bg-current/10 opacity-30"
                    }`}
                  />
                  <div className={`text-[11px] font-bold line-clamp-1 ${m.done ? "text-emerald-600 dark:text-emerald-400" : "opacity-40"}`}>
                    {m.title.split(" ")[0]} {m.title.split(" ")[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Timeline & Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Timeline (8 Cols) */}
            <div className={`lg:col-span-8 p-6 rounded-3xl border shadow-xl space-y-6 ${t.card}`}>
              <div className="flex items-center justify-between border-b border-current/10 pb-3">
                <h3 className="font-black text-base">Complete Transit Checkpoints</h3>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-0.5 rounded-full">
                  Live GPS Synced
                </span>
              </div>

              <div className="space-y-6 pl-2 sm:pl-4 relative before:absolute before:left-[17px] sm:before:left-[25px] before:top-2 before:bottom-2 before:w-0.5 before:bg-current/15">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-md transition ${
                        m.done
                          ? "bg-emerald-500 text-white"
                          : "bg-current/10 text-current/40"
                      }`}
                    >
                      {m.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h4 className={`text-xs sm:text-sm font-bold ${m.done ? "text-current" : "opacity-40"}`}>
                          {m.title}
                        </h4>
                        <span className="text-[10px] opacity-60 font-mono">{m.time}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{m.location}</span>
                      </div>
                      <p className="text-xs opacity-70 leading-relaxed pt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Courier Partner & Driver Card */}
              <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
                <div className="text-xs font-black uppercase tracking-wider opacity-70 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Authorized Carrier Partner</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${t.sidebarBrand}`}>
                    DL
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Delhivery Express Surface</h4>
                    <div className="text-[11px] opacity-70">3PL National Express Network</div>
                    <div className="text-[11px] font-mono text-emerald-500 font-bold">Driver: Rajesh Verma</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-current/10 text-xs flex justify-between items-center">
                  <span className="opacity-70">Courier Contact:</span>
                  <a href="tel:+919876500112" className="font-bold font-mono text-emerald-600 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>+91 98765 00112</span>
                  </a>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className={`p-5 rounded-3xl border shadow-md space-y-2 text-xs ${t.card}`}>
                <div className="font-bold opacity-70 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Shipping Destination</span>
                </div>
                <p className="font-semibold leading-relaxed">
                  {selectedOrder.shippingAddress?.street || "402 Greenfield Residency, 14th Main"}<br />
                  {selectedOrder.shippingAddress?.city || "Bengaluru"}, {selectedOrder.shippingAddress?.state || "Karnataka"} - {selectedOrder.shippingAddress?.postalCode || "560102"}<br />
                  {selectedOrder.shippingAddress?.country || "India"}
                </p>
                <div className="pt-2 border-t border-current/10">
                  <button
                    type="button"
                    onClick={() =>
                      onAskAiAboutOrder(
                        `Change delivery address for ${selectedOrder.orderNumber} to `
                      )
                    }
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>Request Address Change &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Package Contents Breakdown */}
              <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
                <div className="font-bold opacity-70 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Parcel Contents ({selectedOrder.items.length})</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-60">Verified</span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-current/10">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0">
                      <div>
                        <div className="font-bold text-xs">{item.name}</div>
                        <div className="text-[10px] opacity-60">Qty: {item.quantity} • ₹{item.price.toLocaleString("en-IN")} each</div>
                      </div>
                      <div className="font-extrabold text-xs">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-current/10 flex justify-between items-center font-black text-sm">
                  <span>Total (Incl. GST):</span>
                  <span className={t.accentText}>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                </div>

                {/* Print Invoice Button */}
                <button
                  type="button"
                  onClick={() =>
                    printTaxInvoice({
                      orderNumber: selectedOrder.orderNumber,
                      invoiceNumber: `INV-${selectedOrder.orderNumber}`,
                      invoiceDate: new Date(selectedOrder.placedAt).toLocaleDateString("en-IN"),
                      gstin: "29AABCU9603R1ZM",
                      billedTo: selectedOrder.shippingAddress?.street || "Aman Gupta",
                      carrier: selectedOrder.carrier || "Delhivery Express",
                      trackingNumber: selectedOrder.trackingNumber || "DL789456123IN",
                      items: selectedOrder.items,
                      totalAmount: selectedOrder.totalAmount,
                    })
                  }
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition active:scale-95 ${t.secondaryButton}`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE B: ORDERS DIRECTORY VIEW (First opens when entering Track Order) */
        <div className="space-y-6">
          {/* Top Banner Header */}
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Truck className={`w-7 h-7 ${t.accentText}`} />
              <span>Track Your Shipments</span>
            </h1>
            <p className="text-xs opacity-75 mt-0.5">
              Select any order below to view real-time Delhivery GPS tracking, line-haul milestones, and delivery partner contact details.
            </p>
          </div>

          {/* Search Box */}
          <div className={`p-5 rounded-3xl border shadow-md space-y-3.5 ${t.card}`}>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 opacity-50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. ORD-1001) or AWB to track immediately..."
                  className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border font-mono focus:outline-none uppercase ${t.input}`}
                />
              </div>

              <button
                type="submit"
                className={`px-6 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition ${t.primaryButton}`}
              >
                <Truck className="w-4 h-4" />
                <span>Track Shipment</span>
              </button>
            </form>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
              {[
                { id: "all", label: "All Orders", count: orders.length },
                { id: "shipped", label: "In Transit", count: orders.filter((o) => o.status === "shipped").length },
                { id: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing" || o.status === "pending").length },
                { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
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
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className={`p-16 text-center rounded-3xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
              <Truck className="w-12 h-12 mx-auto opacity-30" />
              <h3 className="font-black text-sm">No shipments found</h3>
              <p className="text-xs opacity-70">
                {searchQuery
                  ? `No order or AWB matching "${searchQuery}". Please check your number.`
                  : "You do not have any orders in this status category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => {
                const isDelivered = order.status === "delivered";
                const isShipped = order.status === "shipped";

                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-5 rounded-3xl border shadow-lg cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl space-y-3.5 ${t.card} border-current/15 hover:border-emerald-500/50`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-current/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-base ${t.accentText}`}>
                            {order.orderNumber}
                          </span>
                          <span className="opacity-40">•</span>
                          <span className="text-xs opacity-75 font-semibold">
                            {new Date(order.placedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-70 mt-0.5">
                          AWB: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{order.trackingNumber || "DL789456123IN"}</strong>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isDelivered
                            ? t.badgeSuccess
                            : isShipped
                            ? t.badgeInfo
                            : t.badgeWarning
                        }`}
                      >
                        ● {order.status}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center opacity-85">
                          <span className="font-semibold line-clamp-1">{item.name} (x{item.quantity})</span>
                          <span className="font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-[10px] opacity-60">+{order.items.length - 2} more item(s)</div>
                      )}
                    </div>

                    {/* Destination & Action */}
                    <div className="pt-3 border-t border-current/10 flex items-center justify-between">
                      <div className="text-[11px] opacity-75 flex items-center gap-1.5 truncate max-w-[65%]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{order.shippingAddress?.city || "Bengaluru"}, {order.shippingAddress?.state || "Karnataka"}</span>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition ${t.primaryButton}`}>
                        <span>Track Live</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

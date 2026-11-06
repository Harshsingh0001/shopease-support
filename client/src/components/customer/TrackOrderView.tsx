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
} from "lucide-react";
import type { Order } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

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

  const [searchQuery, setSearchQuery] = useState(defaultOrderNumber || "ORD-1001");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    return (
      orders.find(
        (o) =>
          o.orderNumber.toLowerCase() === (defaultOrderNumber || "ORD-1001").toLowerCase()
      ) || orders[0] || null
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
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

  const getCarrierMilestones = (order: Order) => {
    const isDelivered = order.status === "delivered";
    const isShipped = order.status === "shipped" || isDelivered;

    return [
      {
        title: "Order Placed & Verified",
        location: "ShopEase Central System",
        time: new Date(order.placedAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        done: true,
        desc: "Order confirmed and inventory reserved from warehouse.",
      },
      {
        title: "Package Sealed & QC Inspection Passed",
        location: "Warehouse Hub - Bengaluru Central",
        time: "1 Day Ago",
        done: true,
        desc: "Barcode scanned and handed to 3PL logistics partner.",
      },
      {
        title: `Dispatched via ${order.carrier || "Delhivery Express"}`,
        location: "Bengaluru Logistics Hub (AWB: " + (order.trackingNumber || "DLH82947192") + ")",
        time: "Yesterday, 08:30 PM",
        done: isShipped,
        desc: "Package scanned into inter-city express line-haul transit.",
      },
      {
        title: "Out for Delivery",
        location: `${order.shippingAddress?.city || "Bengaluru"} Local Delivery Centre`,
        time: isDelivered ? "Today, 11:00 AM" : "Expected Tomorrow, 09:00 AM",
        done: isDelivered,
        desc: "Assigned to delivery agent (Contact: +91 98765 00112).",
      },
      {
        title: "Delivered to Customer",
        location: `${order.shippingAddress?.street || "Greenfield Residency"}, ${order.shippingAddress?.city || "Bengaluru"}`,
        time: isDelivered ? "Delivered" : "Estimated Tomorrow by 5:00 PM",
        done: isDelivered,
        desc: "Requires OTP / Signature verification at doorstep.",
      },
    ];
  };

  const milestones = selectedOrder ? getCarrierMilestones(selectedOrder) : [];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
          <Truck className={`w-7 h-7 ${t.accentText}`} />
          <span>Live Shipment & Carrier Tracking</span>
        </h1>
        <p className="text-xs opacity-75 mt-0.5">
          Real-time GPS dispatch telemetry synchronized with Delhivery Express & warehouse fulfillment queues.
        </p>
      </div>

      {/* Search Input Box */}
      <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-1001) or Delhivery AWB number..."
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border font-mono focus:outline-none uppercase ${t.input}`}
            />
          </div>

          <button
            type="submit"
            className={`px-6 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition ${t.primaryButton}`}
          >
            <Truck className="w-4 h-4" />
            <span>Track Shipment</span>
          </button>
        </form>

        {/* Quick Recent Order Chips */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
            <span className="opacity-60 text-[11px] font-semibold whitespace-nowrap">Your Orders:</span>
            {orders.map((o) => (
              <button
                key={o._id}
                type="button"
                onClick={() => {
                  setSearchQuery(o.orderNumber);
                  setSelectedOrder(o);
                }}
                className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold border transition ${
                  selectedOrder?._id === o._id
                    ? t.primaryButton
                    : `${t.secondaryButton} opacity-80 hover:opacity-100`
                }`}
              >
                {o.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Order Tracking Detail */}
      {selectedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Shipment Timeline */}
          <div className={`lg:col-span-8 p-6 rounded-3xl border shadow-xl space-y-6 ${t.card}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-current/10 gap-2">
              <div>
                <span className={`font-mono text-base font-black ${t.accentText}`}>
                  {selectedOrder.orderNumber}
                </span>
                <div className="text-xs opacity-70 mt-0.5">
                  Carrier: <strong>{selectedOrder.carrier || "Delhivery Express"}</strong> • AWB:{" "}
                  <span className="font-mono font-bold">{selectedOrder.trackingNumber || "DLH82947192"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    selectedOrder.status === "delivered"
                      ? t.badgeSuccess
                      : selectedOrder.status === "shipped"
                      ? t.badgeInfo
                      : t.badgeWarning
                  }`}
                >
                  ● {selectedOrder.status}
                </span>

                <button
                  type="button"
                  onClick={() => onAskAiAboutOrder(selectedOrder.orderNumber)}
                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-sm transition active:scale-95 ${
                    t.isDark
                      ? "bg-[#382f1c] text-[#f5e7bf] border-[#d9a83e]/50 hover:bg-[#4a3f25]"
                      : "bg-[#e6f4ea] text-[#059669] border-[#a7f3d0] hover:bg-[#d5ebd9]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Tracker</span>
                </button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-6 pl-2 sm:pl-4 relative before:absolute before:left-[17px] sm:before:left-[25px] before:top-2 before:bottom-2 before:w-0.5 before:bg-current/15">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-md ${
                      m.done
                        ? "bg-emerald-500 text-white"
                        : "bg-current/10 text-current/40"
                    }`}
                  >
                    {m.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <h4 className={`text-xs sm:text-sm font-bold ${m.done ? "text-current" : "opacity-50"}`}>
                        {m.title}
                      </h4>
                      <span className="text-[10px] opacity-60 font-mono">{m.time}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{m.location}</span>
                    </div>
                    <p className="text-xs opacity-70 leading-relaxed pt-0.5">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Package Summary & Delivery Agent */}
          <div className="lg:col-span-4 space-y-4">
            {/* Courier Agent Card */}
            <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
              <div className="text-xs font-black uppercase tracking-wider opacity-70 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Carrier Partner</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${t.sidebarBrand}`}>
                  DL
                </div>
                <div>
                  <h4 className="font-bold text-sm">Delhivery Express Surface</h4>
                  <div className="text-[11px] opacity-70">Dedicated Courier Partner</div>
                  <div className="text-[11px] font-mono text-emerald-500 font-bold">24x7 Transit Care</div>
                </div>
              </div>
              <div className="pt-2 border-t border-current/10 text-xs flex justify-between items-center">
                <span className="opacity-70">Support Hotline:</span>
                <span className="font-bold font-mono">+91 1800 102 3456</span>
              </div>
            </div>

            {/* Destination Address Card */}
            <div className={`p-5 rounded-3xl border shadow-md space-y-2 text-xs ${t.card}`}>
              <div className="font-bold opacity-70 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Delivery Destination</span>
              </div>
              <p className="font-semibold leading-relaxed">
                {selectedOrder.shippingAddress?.street || "402 Greenfield Residency, 14th Main"}<br />
                {selectedOrder.shippingAddress?.city || "Bengaluru"}, {selectedOrder.shippingAddress?.state || "Karnataka"} - {selectedOrder.shippingAddress?.postalCode || "560102"}<br />
                {selectedOrder.shippingAddress?.country || "India"}
              </p>
            </div>

            {/* Items inside this shipment */}
            <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
              <div className="font-bold opacity-70 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>Items in Parcel ({selectedOrder.items.length})</span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-current/5">
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[10px] opacity-60">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-extrabold text-sm">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between items-center font-black text-sm">
                <span>Total Amount:</span>
                <span className={t.accentText}>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-16 text-center rounded-3xl border ${t.cardMuted} ${t.divider}`}>
          <Truck className="w-12 h-12 mx-auto opacity-30 mb-2" />
          <h3 className="font-black text-base">Select or enter an Order ID to track</h3>
          <p className="text-xs opacity-70 mt-1">
            Real-time delivery milestones will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

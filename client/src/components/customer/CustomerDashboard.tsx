import React, { useState, useEffect } from "react";
import {
  Package,
  MessageCircle,
  User,
  Sparkles,
  Plus,
  BookOpen,
  Search,
  CheckCircle2,
  FileText,
  RotateCcw,
  LayoutDashboard,
  Truck,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import type { Order, Ticket, KnowledgeArticle } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export type CustomerTabType = "overview" | "orders" | "tickets" | "knowledge" | "profile";

interface CustomerDashboardProps {
  initialTab?: CustomerTabType;
  onOpenAiWithOrder: (orderNumber: string) => void;
  onRaiseTicket: () => void;
  onOpenTicketInChat: (ticket: Ticket) => void;
  onAskAiAboutPolicy?: (query: string) => void;
  onNavigateToView?: (view: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = "overview",
  onOpenAiWithOrder,
  onRaiseTicket,
  onOpenTicketInChat,
  onAskAiAboutPolicy,
  onNavigateToView,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const [activeTab, setActiveTab] = useState<CustomerTabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [kbSearch, setKbSearch] = useState("");
  const [selectedKbCat, setSelectedKbCat] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, ticketsRes] = await Promise.all([
        api.orders.getMyOrders(),
        api.tickets.getMyTickets(),
      ]);
      setOrders(ordersRes.data.orders);
      setTickets(ticketsRes.data.tickets);

      try {
        const kbRes = await api.knowledge.adminList();
        const list = kbRes?.data?.articles || (Array.isArray(kbRes?.data) ? kbRes.data : []);
        setArticles(list);
      } catch {
        const fallback = await api.knowledge.list();
        const list = (fallback?.data as any)?.articles || (Array.isArray(fallback?.data) ? fallback.data : []);
        setArticles(list);
      }
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrders = orders.filter(
    (o) =>
      o.status.toLowerCase() === "processing" ||
      o.status.toLowerCase() === "shipped" ||
      o.status.toLowerCase() === "pending"
  );
  const deliveredOrders = orders.filter((o) => o.status.toLowerCase() === "delivered");
  const openTickets = tickets.filter(
    (tkt) => tkt.status.toLowerCase() === "open" || tkt.status.toLowerCase() === "in_progress"
  );
  const recentOrder = orders[0];

  const filteredArticles = (articles || []).filter((a) => {
    const matchesCat =
      selectedKbCat === "all" ||
      (a.category || "").toLowerCase() === selectedKbCat.toLowerCase();
    const titleMatch = (a.title || "").toLowerCase().includes(kbSearch.toLowerCase());
    const bodyMatch = (a.body || a.content || "").toLowerCase().includes(kbSearch.toLowerCase());
    return matchesCat && (titleMatch || bodyMatch);
  });

  const getOrderStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      default:
        return 2;
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) return;
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1f2923; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: 900; color: #124a38; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8e2; font-size: 13px; }
            th { background: #f7f7f4; font-weight: bold; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: 800; color: #059669; }
            .footer { margin-top: 50px; font-size: 11px; opacity: 0.7; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">ShopEase.ai</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Omnichannel E-Commerce & AI Platform</div>
              <div style="font-size: 12px; opacity: 0.8;">GSTIN: 29AABCU9603R1ZM</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: bold;">TAX INVOICE</div>
              <div style="font-size: 12px; margin-top: 4px;">Invoice #: INV-${order.orderNumber}</div>
              <div style="font-size: 12px;">Date: ${new Date(order.placedAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div style="margin-top: 20px; font-size: 12px;">
            <strong>Billed To:</strong> ${user?.name || "Customer"}<br/>
            <strong>Email:</strong> ${user?.email}<br/>
            <strong>Shipping Carrier:</strong> ${order.carrier || "Delhivery Express"} (${order.trackingNumber || "Pending"})
          </div>
          <table>
            <thead>
              <tr><th>Item Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price.toLocaleString("en-IN")}</td><td>₹${(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="total">Grand Total: ₹${order.totalAmount.toLocaleString("en-IN")}</div>
          <div class="footer">Thank you for shopping with ShopEase. For support, talk to our 24/7 AI Assistant or email support@shopease.local</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Profile Summary */}
      <div className={`p-5 sm:p-7 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl ${t.card}`}>
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${
              t.isDark ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/30" : "bg-[#124a38] text-white"
            }`}
          >
            {user?.name?.slice(0, 2).toUpperCase() || "CU"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                Verified Customer
              </span>
            </div>
            <p className="text-xs opacity-70 mt-0.5">
              {user?.email} • Language:{" "}
              <span className="font-bold uppercase text-emerald-500">{user?.preferredLanguage || "en"}</span>
              <span className="opacity-40 mx-1.5">•</span>
              <span>ShopEase Prime Member</span>
            </p>
          </div>
        </div>

        {/* Quick Action & Balance Header */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => onOpenAiWithOrder(recentOrder?.orderNumber || "ORD-1001")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition active:scale-95 ${t.primaryButton}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex gap-2 border-b border-current/10 pb-2 overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
            activeTab === "overview" ? t.primaryButton : "opacity-70 hover:opacity-100"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
            activeTab === "orders" ? t.primaryButton : "opacity-70 hover:opacity-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
            activeTab === "tickets" ? t.primaryButton : "opacity-70 hover:opacity-100"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Support Tickets ({tickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("knowledge")}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
            activeTab === "knowledge" ? t.primaryButton : "opacity-70 hover:opacity-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Policies & RAG Help ({articles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
            activeTab === "profile" ? t.primaryButton : "opacity-70 hover:opacity-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Delivery Addresses</span>
        </button>
      </div>

      {/* ===================================================================
          TAB 0: DEDICATED CUSTOMER DASHBOARD OVERVIEW
          =================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Customer Metric KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider">
                <span>Total Spent</span>
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className={`text-xl sm:text-2xl font-black ${t.accentText}`}>
                ₹{totalSpent.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] opacity-70">Across {orders.length} orders</div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider">
                <span>Total Orders</span>
                <Package className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black">{orders.length}</div>
              <div className="text-[10px] text-emerald-500 font-semibold">
                {deliveredOrders.length} Delivered safely
              </div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider">
                <span>Active Shipments</span>
                <Truck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black">{activeOrders.length}</div>
              <div className="text-[10px] text-amber-500 font-semibold">
                Delhivery Express In-Transit
              </div>
            </div>

            <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
              <div className="flex items-center justify-between text-[11px] font-bold opacity-70 uppercase tracking-wider">
                <span>Support Tickets</span>
                <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black">{tickets.length}</div>
              <div className="text-[10px] opacity-70">
                {openTickets.length > 0 ? `${openTickets.length} active with staff` : "All resolved"}
              </div>
            </div>
          </div>

          {/* Active Live Shipment Tracker Banner */}
          {recentOrder && (
            <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-4 ${t.card}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-current/10 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-current/5 text-emerald-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider opacity-70">
                        Live Shipment Tracking
                      </span>
                      <span className={`text-[10px] font-mono font-black ${t.accentText}`}>
                        {recentOrder.orderNumber}
                      </span>
                    </div>
                    <div className="text-xs opacity-75 mt-0.5">
                      Carrier: <strong>{recentOrder.carrier || "Delhivery Express"}</strong> • AWB:{" "}
                      <strong className="font-mono">{recentOrder.trackingNumber || "Pending"}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                      recentOrder.status === "delivered"
                        ? t.badgeSuccess
                        : recentOrder.status === "shipped"
                        ? t.badgeInfo
                        : t.badgeWarning
                    }`}
                  >
                    ● {recentOrder.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenAiWithOrder(recentOrder.orderNumber)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border transition ${t.secondaryButton}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Track with AI</span>
                  </button>
                </div>
              </div>

              {/* 4-Step Stepper Progress Bar */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                  {["Order Placed", "Warehouse Processing", "Dispatched (In Transit)", "Delivered"].map(
                    (step, idx) => {
                      const currentStep = getOrderStatusStep(recentOrder.status);
                      const isComplete = idx + 1 <= currentStep;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete
                                ? "bg-emerald-500"
                                : "bg-current/10 opacity-40"
                            }`}
                          />
                          <div className={`text-[10px] ${isComplete ? "opacity-100 font-black" : "opacity-40"}`}>
                            {step}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Order Items & Actions Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-current/10 text-xs">
                <div>
                  <span className="opacity-70">Items Purchased: </span>
                  <strong>{recentOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}</strong>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(recentOrder)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${t.secondaryButton}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>GST Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold hover:underline ${t.accentText}`}
                  >
                    View Order Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6-Grid Quick Action Customer Shortcuts */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider opacity-70 mb-3">
              Customer Account Quick Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div
                onClick={() => onOpenAiWithOrder("Where is my package right now?")}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">24/7 Grounded AI Assistant</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Ask questions about orders, warranty, and return validation in sub-seconds.
                </p>
              </div>

              <div
                onClick={() => {
                  if (onNavigateToView) onNavigateToView("returns");
                  else setActiveTab("orders");
                }}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-rose-500/10 text-rose-500">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">Returns & Doorstep Pickup</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  7-day return guarantee with automated doorstep courier scheduling.
                </p>
              </div>

              <div
                onClick={() => onRaiseTicket()}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-purple-500/10 text-purple-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">Raise Support Ticket</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Connect with dedicated human support specialists Priya Sharma & Aditi Verma.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("orders")}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-blue-500/10 text-blue-500">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">My Orders & Invoices</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Browse complete purchase history and download official GST tax invoices.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("knowledge")}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-amber-500/10 text-amber-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">Policies & Help Articles</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Browse vector-indexed return policies, shipping times, and hardware warranties.
                </p>
              </div>

              <div
                onClick={() => setActiveTab("profile")}
                className={`p-4 rounded-3xl border cursor-pointer transition hover:-translate-y-1 shadow-md ${t.card}`}
              >
                <div className="p-3 rounded-2xl w-fit mb-2 bg-teal-500/10 text-teal-500">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm mb-1">Delivery Addresses</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Manage primary home and secondary office addresses for fast checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-current/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className={`w-4 h-4 ${t.accentText}`} />
                <h3 className="font-black text-sm">Recent Orders</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`text-xs font-bold hover:underline ${t.accentText}`}
              >
                View All ({orders.length}) &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord._id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${t.cardMuted} ${t.divider}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-black text-xs ${t.accentText}`}>
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] opacity-60">
                        Placed {new Date(ord.placedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold mt-1">
                      {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-black text-sm">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>

                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        ord.status === "delivered"
                          ? t.badgeSuccess
                          : ord.status === "shipped"
                          ? t.badgeInfo
                          : t.badgeWarning
                      }`}
                    >
                      ● {ord.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(ord)}
                      className="p-1 rounded-lg border opacity-70 hover:opacity-100"
                      title="Download GST Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 1: ORDERS REGISTRY & REAL-TIME TRACKING
          =================================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wider">
              Order Registry & Real-Time Tracking
            </h2>
            <button
              onClick={loadData}
              className={`text-xs font-bold hover:underline ${t.accentText}`}
            >
              Refresh Orders
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs opacity-60">Loading live orders...</div>
          ) : orders.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${t.cardMuted} ${t.divider}`}>
              <Package className="w-12 h-12 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-bold">No orders found.</p>
              <p className="text-xs opacity-70 mt-1">
                Explore the product store and place your first order!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const stepLevel = getOrderStatusStep(order.status);

                return (
                  <div
                    key={order._id}
                    className={`rounded-3xl border transition-all overflow-hidden shadow-lg ${t.card}`}
                  >
                    {/* Order Header */}
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-current/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-base ${t.accentText}`}>
                            {order.orderNumber}
                          </span>
                          <span className="text-xs opacity-40">•</span>
                          <span className="text-xs opacity-75 font-semibold">
                            Placed {new Date(order.placedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                          <span>Carrier: <strong>{order.carrier || "Delhivery Express"}</strong></span>
                          <span>•</span>
                          <span>AWB: <strong className="font-mono">{order.trackingNumber || "Pending"}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span
                          className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            order.status === "delivered"
                              ? t.badgeSuccess
                              : order.status === "shipped"
                              ? t.badgeInfo
                              : t.badgeWarning
                          }`}
                        >
                          ● {order.status}
                        </span>

                        {/* Track with AI button */}
                        <button
                          type="button"
                          onClick={() => onOpenAiWithOrder(order.orderNumber)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-sm transition active:scale-95 ${
                            t.isDark
                              ? "bg-[#382f1c] hover:bg-[#4a3f25] text-[#f5e7bf] border-[#d9a83e]/50"
                              : "bg-[#e6f4ea] hover:bg-[#d5ebd9] text-[#059669] border-[#a7f3d0]"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Track with AI</span>
                        </button>
                      </div>
                    </div>

                    {/* Timeline Progress Bar Stepper */}
                    <div className={`p-4 border-b ${t.cardMuted} ${t.divider}`}>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                        <div className={`space-y-1 ${stepLevel >= 1 ? "opacity-100" : "opacity-35"}`}>
                          <div className={`h-2 rounded-full ${stepLevel >= 1 ? "bg-emerald-500" : "bg-current/10"}`} />
                          <div>Confirmed</div>
                        </div>
                        <div className={`space-y-1 ${stepLevel >= 2 ? "opacity-100" : "opacity-35"}`}>
                          <div className={`h-2 rounded-full ${stepLevel >= 2 ? "bg-emerald-500" : "bg-current/10"}`} />
                          <div>Processing</div>
                        </div>
                        <div className={`space-y-1 ${stepLevel >= 3 ? "opacity-100" : "opacity-35"}`}>
                          <div className={`h-2 rounded-full ${stepLevel >= 3 ? "bg-emerald-500" : "bg-current/10"}`} />
                          <div>Shipped</div>
                        </div>
                        <div className={`space-y-1 ${stepLevel >= 4 ? "opacity-100" : "opacity-35"}`}>
                          <div className={`h-2 rounded-full ${stepLevel >= 4 ? "bg-emerald-500" : "bg-current/10"}`} />
                          <div>Delivered</div>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-5 divide-y divide-current/10">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold">{item.name}</div>
                            <div className="opacity-60 text-[11px]">Quantity: {item.quantity}</div>
                          </div>
                          <div className="font-extrabold text-sm">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total & Action Buttons */}
                    <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${t.cardMuted} ${t.divider}`}>
                      <div className="text-xs">
                        <span className="opacity-70">Total Order Amount: </span>
                        <strong className={`text-base font-black ${t.accentText}`}>
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(order)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition active:scale-95 ${t.secondaryButton}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Download GST Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          TAB 2: SUPPORT TICKETS & MESSAGES
          =================================================================== */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wider">
              My Support Inquiries & Tickets
            </h2>
            <button
              type="button"
              onClick={onRaiseTicket}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md ${t.primaryButton}`}
            >
              <Plus className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${t.cardMuted} ${t.divider}`}>
              <MessageCircle className="w-12 h-12 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-bold">No support tickets found.</p>
              <p className="text-xs opacity-70 mt-1">
                Have a question or return request? Use our 24/7 AI Chat widget or raise a ticket!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((tkt) => (
                <div
                  key={tkt._id}
                  onClick={() => onOpenTicketInChat(tkt)}
                  className={`p-5 rounded-3xl border cursor-pointer transition hover:scale-[1.005] shadow-md ${t.card}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-mono text-xs font-black ${t.accentText}`}>
                      {tkt.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        tkt.status === "open"
                          ? t.badgeWarning
                          : tkt.status === "in_progress"
                          ? t.badgeInfo
                          : t.badgeSuccess
                      }`}
                    >
                      {tkt.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base mb-1.5">{tkt.subject}</h4>
                  <div className="flex items-center gap-3 text-[11px] opacity-70">
                    <span>Category: <strong>{tkt.category.replace("_", " ")}</strong></span>
                    <span>•</span>
                    <span>Created: {new Date(tkt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          TAB 3: RAG HELP & RETURN POLICIES
          =================================================================== */}
      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wider">
              Grounded Store Policies & AI Reference Base
            </h2>
            <p className="text-xs opacity-70">
              Official store policy articles used by the ShopEase AI Assistant to answer your inquiries with 100% compliance.
            </p>
          </div>

          {/* Search & Categories Bar */}
          <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center gap-3 shadow-md ${t.card}`}>
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-50" />
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                placeholder="Search return policy, warranty, refunds..."
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none ${t.input}`}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
              {["all", "returns", "refunds", "shipping", "warranty", "orders", "general"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedKbCat(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase whitespace-nowrap transition ${
                    selectedKbCat === cat ? t.primaryButton : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full py-16 text-center opacity-50 text-xs border rounded-3xl">
                No policy articles match your search.
              </div>
            ) : (
              filteredArticles.map((art) => (
                <div
                  key={art._id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between shadow-md transition hover:-translate-y-1 ${t.card}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                        {art.category || "general"}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Grounding</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm mb-2 leading-snug">{art.title}</h4>
                    <p className="text-xs opacity-75 line-clamp-3 leading-relaxed mb-4">
                      {art.body || art.content}
                    </p>
                  </div>

                  {onAskAiAboutPolicy && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskAiAboutPolicy(
                          `Explain your official ${art.title} policy and how it applies to my purchases.`
                        )
                      }
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                        t.isDark
                          ? "bg-[#23221e] hover:bg-[#2d2b24] text-[#f5e7bf] border-[#d9a83e]/30"
                          : "bg-[#e6f4ea] hover:bg-[#d5ebd9] text-[#059669] border-[#a7f3d0]"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Ask AI About This</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: DELIVERY ADDRESSES & PROFILE
          =================================================================== */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wider">
              Saved Delivery Addresses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-3xl border relative shadow-md ${t.card}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                  Default Shipping Address
                </span>
                <span className="text-xs font-bold text-emerald-500">Home</span>
              </div>
              <h4 className="font-bold text-sm">{user?.name}</h4>
              <p className="text-xs opacity-75 leading-relaxed mt-1">
                402 Greenfield Residency, 14th Main<br/>
                Sector 4, HSR Layout<br/>
                Bengaluru, Karnataka - 560102<br/>
                Phone: +91 98765 43210
              </p>
            </div>

            <div className={`p-5 rounded-3xl border relative shadow-md ${t.card}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-current/10">
                  Secondary Address
                </span>
                <span className="text-xs font-bold opacity-70">Work / Office</span>
              </div>
              <h4 className="font-bold text-sm">{user?.name}</h4>
              <p className="text-xs opacity-75 leading-relaxed mt-1">
                Tower B, 7th Floor, DLF Cyber City<br/>
                Phase II, Sector 24<br/>
                Gurugram, Haryana - 122002<br/>
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

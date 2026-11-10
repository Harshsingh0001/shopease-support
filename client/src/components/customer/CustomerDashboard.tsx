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
  Mail,
  ShieldCheck,
  MapPin,
  Bell,
  Lock,
  Copy,
  Check,
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
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [profileLang, setProfileLang] = useState<string>(user?.preferredLanguage || "en");
  const [profilePhone, setProfilePhone] = useState<string>("+91 98765 43210");
  const [whatsappNotifications, setWhatsappNotifications] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyProfileField = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveProfilePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg("Profile settings and notification preferences updated successfully!");
    setTimeout(() => setProfileSavedMsg(null), 4000);
  };

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
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #AB644B; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: 900; color: #AB644B; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8e2; font-size: 13px; }
            th { background: #f7f7f4; font-weight: bold; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: 800; color: #AB644B; }
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
              t.isDark ? "bg-[#382f1c] text-[#f5e7bf] border border-[#d9a83e]/30" : "bg-[#AB644B] text-white shadow-md shadow-[#AB644B]/20"
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
          <span>My Profile & Settings</span>
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
      {activeTab === "orders" && (() => {
        const filteredOrders = orders.filter((o) => {
          const matchesFilter =
            orderFilter === "all" ||
            (orderFilter === "active" && (o.status === "processing" || o.status === "shipped" || o.status === "pending")) ||
            (orderFilter === "shipped" && o.status === "shipped") ||
            (orderFilter === "delivered" && o.status === "delivered");

          const query = orderSearch.trim().toLowerCase();
          const matchesSearch =
            !query ||
            o.orderNumber.toLowerCase().includes(query) ||
            (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query)) ||
            o.items.some((item) => item.name.toLowerCase().includes(query));

          return matchesFilter && matchesSearch;
        });

        return (
          <div className="space-y-5">
            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Orders</div>
                <div className="text-xl font-black">{orders.length}</div>
                <div className="text-[10px] opacity-65">Lifetime purchases logged</div>
              </div>

              <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Active Shipments</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400">{activeOrders.length}</div>
                <div className="text-[10px] opacity-65">In warehouse or transit</div>
              </div>

              <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Delivered Orders</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{deliveredOrders.length}</div>
                <div className="text-[10px] opacity-65">Successfully received</div>
              </div>

              <div className={`p-4 rounded-3xl border shadow-sm space-y-1 ${t.card}`}>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Spend</div>
                <div className={`text-xl font-black ${t.accentText}`}>₹{totalSpent.toLocaleString("en-IN")}</div>
                <div className="text-[10px] opacity-65">Verified payments</div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${t.card}`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "All Orders", count: orders.length },
                    { id: "active", label: "Active", count: activeOrders.length },
                    { id: "shipped", label: "In Transit", count: orders.filter((o) => o.status === "shipped").length },
                    { id: "delivered", label: "Delivered", count: deliveredOrders.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setOrderFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                        orderFilter === tab.id
                          ? t.primaryButton
                          : `${t.secondaryButton} opacity-80 hover:opacity-100`
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="opacity-70 text-[10px]">({tab.count})</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 opacity-50" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search order #, item, AWB..."
                      className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none ${t.input}`}
                    />
                  </div>

                  <button
                    onClick={loadData}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${t.secondaryButton}`}
                    title="Refresh orders"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="p-12 text-center text-xs opacity-60">Loading live orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className={`p-16 text-center rounded-3xl border space-y-2 ${t.cardMuted} ${t.divider}`}>
                <Package className="w-12 h-12 mx-auto opacity-30" />
                <p className="text-sm font-bold">No orders found</p>
                <p className="text-xs opacity-70">
                  {orderSearch
                    ? `No orders matching "${orderSearch}". Try searching by order number (e.g. ORD-1001).`
                    : "You do not have any orders in this category."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
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
                            <span>AWB: <strong className="font-mono">{order.trackingNumber || "DL789456123IN"}</strong></span>
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

                          <button
                            type="button"
                            onClick={() => onOpenAiWithOrder(order.orderNumber)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-sm transition active:scale-95 ${
                              t.isDark
                                ? "bg-[#382f1c] hover:bg-[#4a3f25] text-[#f5e7bf] border-[#d9a83e]/50"
                                : "bg-[#AB644B]/15 hover:bg-[#AB644B]/25 text-[#AB644B] border-[#AB644B]/30"
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
                            <div className={stepLevel >= 1 ? "text-emerald-600 dark:text-emerald-400" : ""}>Confirmed</div>
                          </div>
                          <div className={`space-y-1 ${stepLevel >= 2 ? "opacity-100" : "opacity-35"}`}>
                            <div className={`h-2 rounded-full ${stepLevel >= 2 ? "bg-emerald-500" : "bg-current/10"}`} />
                            <div className={stepLevel >= 2 ? "text-emerald-600 dark:text-emerald-400" : ""}>QC Processing</div>
                          </div>
                          <div className={`space-y-1 ${stepLevel >= 3 ? "opacity-100" : "opacity-35"}`}>
                            <div className={`h-2 rounded-full ${stepLevel >= 3 ? "bg-emerald-500" : "bg-current/10"}`} />
                            <div className={stepLevel >= 3 ? "text-emerald-600 dark:text-emerald-400" : ""}>In Transit</div>
                          </div>
                          <div className={`space-y-1 ${stepLevel >= 4 ? "opacity-100" : "opacity-35"}`}>
                            <div className={`h-2 rounded-full ${stepLevel >= 4 ? "bg-emerald-500" : "bg-current/10"}`} />
                            <div className={stepLevel >= 4 ? "text-emerald-600 dark:text-emerald-400" : ""}>Delivered</div>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="p-5 divide-y divide-current/10">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-xs">{item.name}</div>
                              <div className="opacity-60 text-[11px]">Quantity: {item.quantity} • ₹{item.price.toLocaleString("en-IN")} each</div>
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
                          <span className="text-[10px] opacity-60 ml-1.5">(Incl. GST)</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {onNavigateToView && (
                            <button
                              type="button"
                              onClick={() => onNavigateToView("track")}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition active:scale-95 ${t.secondaryButton}`}
                            >
                              <Truck className="w-3.5 h-3.5 text-blue-500" />
                              <span>Live GPS Tracking</span>
                            </button>
                          )}

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
        );
      })()}

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
                          : "bg-[#AB644B]/15 hover:bg-[#AB644B]/25 text-[#AB644B] border-[#AB644B]/30"
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
        <div className="space-y-6">
          {/* Toast Notification */}
          {profileSavedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex items-center gap-2 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSavedMsg}</span>
            </div>
          )}

          {/* 1. Profile Hero Identity Card */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${t.card}`}>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg border-2 border-[#AB644B]/30 ${
                  t.isDark
                    ? "bg-[#382f1c] text-[#f5e7bf]"
                    : "bg-[#AB644B] text-white"
                }`}
              >
                {(user?.name || "Customer")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name || "Aman Gupta"}</h2>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Verified Customer</span>
                  </span>
                </div>

                <div className="text-xs opacity-75 flex flex-wrap items-center gap-2 sm:gap-4 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 opacity-60" />
                    <span>{user?.email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="opacity-60 font-mono">ID:</span>
                    <strong className="font-mono">SHP-CUST-9021</strong>
                    <button
                      type="button"
                      onClick={() => copyProfileField("SHP-CUST-9021", "id")}
                      className="p-1 hover:bg-current/10 rounded"
                      title="Copy Customer ID"
                    >
                      {copiedField === "id" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
                    </button>
                  </span>
                  <span>•</span>
                  <span className="opacity-70">Member since Oct 2024</span>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-current/10">
              <div className="text-center px-3 py-1">
                <div className="text-xs opacity-60 font-semibold">Orders</div>
                <div className="text-lg font-black">{orders.length}</div>
              </div>
              <div className="h-8 w-px bg-current/15" />
              <div className="text-center px-3 py-1">
                <div className="text-xs opacity-60 font-semibold">Total Spent</div>
                <div className={`text-lg font-black ${t.accentText}`}>₹{totalSpent.toLocaleString("en-IN")}</div>
              </div>
              <div className="h-8 w-px bg-current/15" />
              <div className="text-center px-3 py-1">
                <div className="text-xs opacity-60 font-semibold">Tickets</div>
                <div className="text-lg font-black text-blue-500">{tickets.length}</div>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Left: Personal & Settings, Right: Saved Addresses & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Personal Details, Language & Communication */}
            <div className="lg:col-span-7 space-y-6">
              {/* Personal Details Form */}
              <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${t.card}`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                  <div className="font-black text-sm uppercase tracking-wider opacity-85 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Personal Profile Details</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                    KYC Level 1 Verified
                  </span>
                </div>

                <form onSubmit={handleSaveProfilePreferences} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 opacity-75">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name || "Aman Gupta"}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none font-semibold ${t.input}`}
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1 opacity-75">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          readOnly
                          defaultValue={user?.email || "customer@shopease.local"}
                          className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold opacity-80 cursor-not-allowed ${t.input}`}
                        />
                        <span className="absolute right-3 top-3 text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 opacity-75">Phone Number (Carrier Tracking Alerts)</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none font-semibold ${t.input}`}
                        />
                        <span className="absolute right-3 top-3 text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>OTP Validated</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1 opacity-75">Preferred Support & AI Language</label>
                      <select
                        value={profileLang}
                        onChange={(e) => setProfileLang(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none font-semibold ${t.input}`}
                      >
                        <option value="en">English (Official & Tax Invoices)</option>
                        <option value="hi">हिन्दी (Hindi Support & Speech)</option>
                        <option value="hinglish">Hinglish (Natural Conversational)</option>
                      </select>
                    </div>
                  </div>

                  {/* Communication & Privacy Preferences */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${t.cardMuted} ${t.divider}`}>
                    <div className="font-bold uppercase tracking-wider text-[10px] opacity-75 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-500" />
                      <span>Order Alerts & Logistics Channels</span>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer text-xs">
                        <div>
                          <div className="font-bold">WhatsApp Dispatch & GPS Milestone Alerts</div>
                          <div className="text-[10px] opacity-65">Receive Delhivery line-haul updates on WhatsApp</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={whatsappNotifications}
                          onChange={(e) => setWhatsappNotifications(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                      </label>

                      <div className="border-t border-current/10 pt-2">
                        <label className="flex items-center justify-between cursor-pointer text-xs">
                          <div>
                            <div className="font-bold">Email GST Tax Invoices & Bank Refund Credit Slips</div>
                            <div className="text-[10px] opacity-65">Automated PDF receipts on order delivery or return</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition active:scale-95 ${t.primaryButton}`}
                    >
                      Save Profile & Language Settings
                    </button>
                  </div>
                </form>
              </div>

              {/* Saved Payment Methods & UPI */}
              <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${t.card}`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                  <div className="font-black text-sm uppercase tracking-wider opacity-85 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Saved Payment Methods & Refund Destination</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-70">RBI Compliant Tokenization</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className={`p-4 rounded-2xl border space-y-2 relative shadow-xs ${t.cardMuted} ${t.divider}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">
                        Default Refund UPI
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="font-mono font-bold text-sm">aman.gupta@okhdfcbank</div>
                    <div className="text-[10px] opacity-70">Connected to HDFC Bank (Instant 1-Click Doorstep Refund)</div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 relative shadow-xs ${t.cardMuted} ${t.divider}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-600">
                        Primary Card
                      </span>
                      <CreditCard className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="font-mono font-bold text-sm">•••• •••• •••• 4082</div>
                    <div className="text-[10px] opacity-70">Visa Platinum Credit • Expires 08/28</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Saved Delivery Addresses & Security */}
            <div className="lg:col-span-5 space-y-6">
              {/* Delivery Addresses */}
              <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${t.card}`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                  <div className="font-black text-sm uppercase tracking-wider opacity-85 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Saved Delivery Addresses</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Address addition dialog opened.")}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {/* Default Home Address */}
                <div className={`p-4 rounded-2xl border relative space-y-2 shadow-xs ${t.cardMuted} ${t.divider}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${t.badgeHighlight}`}>
                      ● Default Address
                    </span>
                    <span className="text-xs font-bold text-emerald-500">Home</span>
                  </div>
                  <h4 className="font-bold text-sm">{user?.name || "Aman Gupta"}</h4>
                  <p className="text-xs opacity-75 leading-relaxed">
                    402 Greenfield Residency, 14th Main<br/>
                    Sector 4, HSR Layout<br/>
                    Bengaluru, Karnataka - 560102<br/>
                    Phone: {profilePhone}
                  </p>
                </div>

                {/* Secondary Work Address */}
                <div className={`p-4 rounded-2xl border relative space-y-2 shadow-xs ${t.cardMuted} ${t.divider}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-current/10 opacity-75">
                      Secondary Address
                    </span>
                    <span className="text-xs font-bold opacity-70">Work / Office</span>
                  </div>
                  <h4 className="font-bold text-sm">{user?.name || "Aman Gupta"}</h4>
                  <p className="text-xs opacity-75 leading-relaxed">
                    Tower B, 7th Floor, DLF Cyber City<br/>
                    Phase II, Sector 24<br/>
                    Gurugram, Haryana - 122002<br/>
                    Phone: {profilePhone}
                  </p>
                </div>
              </div>

              {/* Security & Authentication Health */}
              <div className={`p-6 rounded-3xl border shadow-lg space-y-4 ${t.card}`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                  <div className="font-black text-sm uppercase tracking-wider opacity-85 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Security & Authentication</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                    Account Secure
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-current/10">
                    <div>
                      <div className="font-bold">Password</div>
                      <div className="text-[10px] opacity-60">Last updated 14 days ago</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your registered email.")}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      Update
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-current/10">
                    <div>
                      <div className="font-bold">Two-Factor Authentication (2FA)</div>
                      <div className="text-[10px] opacity-60">Verified via SMS OTP on login</div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded">
                      Enabled
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="font-bold">Active Device Session</div>
                      <div className="text-[10px] opacity-60">Chrome on Windows • Bengaluru, India</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">
                      Current
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

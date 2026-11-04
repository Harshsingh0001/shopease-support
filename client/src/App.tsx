import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import type {
  Product,
  Order,
  Ticket,
  Message,
  TicketCategory,
  TicketPriority,
  UserRole,
} from "./types";
import {
  Package,
  ShoppingBag,
  Truck,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react";
import "./App.css";

/* =========================================================================
   1. AUTHENTICATION VIEW (LOGIN / REGISTER / QUICK DEMO LOGIN)
   ========================================================================= */
const AuthView = () => {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, role, language);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">ShopEase AI Support</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to explore customer, agent, and admin support workflows
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div className="mb-6 p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick Demo Logins (Click to Sign In)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickLogin("customer")}
              className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-emerald-300 font-medium transition text-left"
            >
              👤 <strong>Customer (Aman)</strong>
              <div className="text-[10px] text-slate-400">Hinglish • 3 Orders</div>
            </button>
            <button
              onClick={() => quickLogin("customer2")}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 font-medium transition text-left"
            >
              👤 <strong>Customer (Rohit)</strong>
              <div className="text-[10px] text-slate-400">English • 1 Order</div>
            </button>
            <button
              onClick={() => quickLogin("agent")}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 font-medium transition text-left"
            >
              🎧 <strong>Support Agent</strong>
              <div className="text-[10px] text-slate-400">Ticket Triage & Notes</div>
            </button>
            <button
              onClick={() => quickLogin("admin")}
              className="p-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-lg text-amber-300 font-medium transition text-left"
            >
              🛡️ <strong>Admin Console</strong>
              <div className="text-[10px] text-slate-400">System Oversight</div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aman Gupta"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@shopease.local"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                >
                  <option value="customer">Customer</option>
                  <option value="agent">Support Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "en" | "hi" | "hinglish")
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100"
                >
                  <option value="en">English</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Need a new account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. MAIN APPLICATION WORKSPACE
   ========================================================================= */
const MainApp = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "tickets" | "orders" | "products" | "admin"
  >("tickets");

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Tickets State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messageVisibility, setMessageVisibility] = useState<
    "customer" | "internal_note"
  >("customer");

  // New Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<TicketCategory>("order_issue");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newOrderId, setNewOrderId] = useState("");
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Load Products
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.products.list({ search: searchQuery });
      setProducts(res.data.products);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      if (user?.role === "customer") {
        const res = await api.orders.getMyOrders();
        setOrders(res.data.orders);
      } else {
        const res = await api.orders.getAllOrders();
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load Tickets
  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      if (user?.role === "customer") {
        const res = await api.tickets.getMyTickets();
        setTickets(res.data.tickets);
      } else {
        const res = await api.tickets.getStaffTickets();
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Load Messages for active ticket
  const loadMessages = async (ticketId: string) => {
    setMessagesLoading(true);
    try {
      const res = await api.tickets.getMessages(ticketId);
      setMessages(res.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Initial Fetch based on active tab
  useEffect(() => {
    if (activeTab === "products") loadProducts();
    if (activeTab === "orders") loadOrders();
    if (activeTab === "tickets") loadTickets();
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket._id);
    }
  }, [selectedTicket]);

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !messageInput.trim()) return;

    try {
      await api.tickets.sendMessage(selectedTicket._id, {
        body: messageInput.trim(),
        visibility: user?.role === "customer" ? "customer" : messageVisibility,
      });
      setMessageInput("");
      await loadMessages(selectedTicket._id);
      await loadTickets();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Handle Ticket Status Update (Staff or Customer Closing)
  const handleStatusChange = async (newStatus: Ticket["status"]) => {
    if (!selectedTicket) return;
    try {
      await api.tickets.update(selectedTicket._id, { status: newStatus });
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      await loadTickets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Handle Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const res = await api.tickets.create({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        orderId: newOrderId.trim() || undefined,
        initialMessage: newInitialMessage.trim() || undefined,
      });
      setShowNewTicketModal(false);
      setNewSubject("");
      setNewOrderId("");
      setNewInitialMessage("");
      await loadTickets();
      setSelectedTicket(res.ticket);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const isStaff = user?.role === "agent" || user?.role === "admin";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">ShopEase</div>
              <div className="text-[10px] text-slate-400">Support Platform</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === "tickets"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isStaff ? "Support Ticket Queue" : "My Support Tickets"}</span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === "orders"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{isStaff ? "All Platform Orders" : "My Orders"}</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === "products"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Catalogue</span>
            </button>

            {user?.role === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  activeTab === "admin"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Governance</span>
              </button>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-3 bg-slate-800/70 rounded-xl mb-2 flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-xs font-semibold truncate">{user?.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                    user?.role === "admin"
                      ? "bg-amber-500/20 text-amber-300"
                      : user?.role === "agent"
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {user?.role}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user?.preferredLanguage}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            {activeTab === "tickets" && (
              <>
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  {isStaff ? "Support Operations / Ticket Queue" : "Customer Support Portal"}
                </span>
              </>
            )}
            {activeTab === "orders" && (
              <>
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Order Lookup & Fulfillment</span>
              </>
            )}
            {activeTab === "products" && (
              <>
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Product Store Catalogue</span>
              </>
            )}
            {activeTab === "admin" && (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>System Administration & Audit Logs</span>
              </>
            )}
          </div>

          {activeTab === "tickets" && !isStaff && (
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Support Ticket</span>
            </button>
          )}
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* TAB 1: TICKETS VIEW */}
          {activeTab === "tickets" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Ticket List Pane */}
              <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/30 shrink-0">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {tickets.length} Tickets
                  </span>
                  <button
                    onClick={loadTickets}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                  {ticketsLoading ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Loading tickets...
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No tickets found.
                    </div>
                  ) : (
                    tickets.map((t) => {
                      const isSelected = selectedTicket?._id === t._id;
                      return (
                        <button
                          key={t._id}
                          onClick={() => setSelectedTicket(t)}
                          className={`w-full text-left p-3 transition flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-slate-800/90 border-l-2 border-emerald-500"
                              : "hover:bg-slate-850/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-emerald-400">
                              {t.ticketNumber}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                t.status === "open"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : t.status === "in_progress"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {t.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-200 line-clamp-1">
                            {t.subject}
                          </div>
                          {isStaff && t.customerId && (
                            <div className="text-[10px] text-slate-400">
                              Customer: {t.customerId.name} ({t.customerId.preferredLanguage || "en"})
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Ticket Details & Timeline Pane */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                {selectedTicket ? (
                  <>
                    {/* Ticket Header Bar */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            {selectedTicket.ticketNumber}
                          </span>
                          <h2 className="text-sm font-semibold text-slate-100">
                            {selectedTicket.subject}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Category: {selectedTicket.category.replace("_", " ")}</span>
                          <span>•</span>
                          <span>Priority: {selectedTicket.priority}</span>
                          {selectedTicket.orderId && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">
                                Order: {selectedTicket.orderId.orderNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ticket Action Controls */}
                      <div className="flex items-center gap-2">
                        {isStaff ? (
                          <select
                            value={selectedTicket.status}
                            onChange={(e) =>
                              handleStatusChange(e.target.value as Ticket["status"])
                            }
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_customer">Waiting on Customer</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        ) : selectedTicket.status !== "closed" ? (
                          <button
                            onClick={() => handleStatusChange("closed")}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 transition"
                          >
                            Close Ticket
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* Messages Timeline */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messagesLoading ? (
                        <div className="text-center text-xs text-slate-500 py-6">
                          Loading conversation...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-xs text-slate-500 py-6">
                          No messages yet. Send a message below.
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isCustomerMessage = m.senderRole === "customer";
                          const isInternalNote = m.visibility === "internal_note";

                          return (
                            <div
                              key={m._id}
                              className={`flex flex-col ${
                                isInternalNote
                                  ? "items-center"
                                  : isCustomerMessage
                                  ? "items-start"
                                  : "items-end"
                              }`}
                            >
                              <div
                                className={`max-w-lg rounded-2xl p-3 text-xs shadow-md ${
                                  isInternalNote
                                    ? "bg-amber-950/40 border border-amber-600/40 text-amber-200 w-full"
                                    : isCustomerMessage
                                    ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60"
                                    : "bg-emerald-600 text-white rounded-tr-sm"
                                }`}
                              >
                                {isInternalNote && (
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-wider">
                                    <Lock className="w-3 h-3" />
                                    <span>Confidential Internal Staff Note</span>
                                  </div>
                                )}
                                <div className="text-[10px] opacity-70 mb-1">
                                  {m.senderId?.name || m.senderRole} •{" "}
                                  {new Date(m.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed">
                                  {m.body}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Message Composer */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-3 border-t border-slate-800 bg-slate-900/60 shrink-0"
                    >
                      {isStaff && (
                        <div className="flex items-center gap-4 mb-2 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="visibility"
                              checked={messageVisibility === "customer"}
                              onChange={() => setMessageVisibility("customer")}
                              className="text-emerald-500 focus:ring-0"
                            />
                            <span className="text-slate-300">Reply to Customer (Public)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-medium">
                            <input
                              type="radio"
                              name="visibility"
                              checked={messageVisibility === "internal_note"}
                              onChange={() => setMessageVisibility("internal_note")}
                              className="text-amber-500 focus:ring-0"
                            />
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Internal Staff Note (Private)
                            </span>
                          </label>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder={
                            isStaff && messageVisibility === "internal_note"
                              ? "Write private staff diagnostic note..."
                              : "Type your reply..."
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                    <MessageCircle className="w-8 h-8 opacity-40" />
                    <span>Select a ticket from the left queue to view the conversation</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS VIEW */}
          {activeTab === "orders" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold">
                    {isStaff ? "Platform Order Registry" : "Your Order History"}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {orders.length} Orders Loaded
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No orders found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div
                        key={o._id}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-emerald-400">
                              {o.orderNumber}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-300">
                              ₹{o.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              o.status === "delivered"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : o.status === "shipped"
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {o.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1 mb-2">
                          <div>
                            Items:{" "}
                            {o.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </div>
                          {o.carrier && (
                            <div>
                              Carrier: {o.carrier} • Tracking: {o.trackingNumber}
                            </div>
                          )}
                          <div>
                            Delivery Address: {o.shippingAddress.street},{" "}
                            {o.shippingAddress.city}, {o.shippingAddress.state}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS VIEW */}
          {activeTab === "products" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                {/* Search Bar */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                      placeholder="Search store catalogue by name, SKU, or category..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={loadProducts}
                    className="bg-slate-800 hover:bg-slate-700 text-xs px-4 py-2 rounded-xl transition text-slate-300"
                  >
                    Search
                  </button>
                </div>

                {productsLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Loading products...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-emerald-400">
                              {p.sku}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-100 mb-1">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                            {p.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-sm font-bold text-emerald-400">
                            ₹{p.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Stock: {p.stock} units
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN GOVERNANCE VIEW */}
          {activeTab === "admin" && user?.role === "admin" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    System Administration & Policy Governance
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage support staff, review audit trails, and oversee system operations.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400">Total System Tickets</div>
                    <div className="text-2xl font-bold text-slate-100 mt-1">
                      {tickets.length}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400">Active Products</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {products.length || 6}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xs text-slate-400">Security Rule</div>
                    <div className="text-xs font-semibold text-amber-300 mt-2">
                      RBAC & IDOR Strict Policy
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    Role-Based Access Control Map
                  </h3>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div>
                      • <strong>Customers:</strong> Strictly sandboxed to their own orders and tickets.
                    </div>
                    <div>
                      • <strong>Support Agents:</strong> Can triage all tickets, reply publicly, and add private staff notes.
                    </div>
                    <div>
                      • <strong>Admins:</strong> Full platform visibility, article publishing, and user governance.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Raise Support Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100">
            <h2 className="text-base font-bold mb-4">Raise a Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Issue with my headphones"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as TicketCategory)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="order_issue">Order Issue</option>
                    <option value="product_inquiry">Product Inquiry</option>
                    <option value="return_request">Return Request</option>
                    <option value="general">General</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TicketPriority)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="e.g. ORD-1001"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Initial Message
                </label>
                <textarea
                  rows={3}
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="text-xs px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-lg transition"
                >
                  {ticketSubmitting ? "Submitting..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. ROOT APP WITH AUTH WRAPPER
   ========================================================================= */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading ShopEase Support...
      </div>
    );
  }

  return user ? <MainApp /> : <AuthView />;
}

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { api } from "./services/api";
import type {
  Product,
  Order,
  Ticket,
  CartItem,
  TicketCategory,
  TicketPriority,
  UserRole,
} from "./types";
import { getThemeStyles } from "./utils/themeStyles";

// Customer Panel Components (Core Shell)
import { CustomerNavbar, type CustomerViewType } from "./components/customer/CustomerNavbar";
import { CustomerSidebar } from "./components/customer/CustomerSidebar";
import { ProductCard } from "./components/customer/ProductCard";
import { CustomerHomeView } from "./components/customer/CustomerHomeView";
import type { SortOption } from "./components/customer/CategoryFilter";
import type { AdminTab } from "./components/admin/AdminSidebar";

// Code-split dynamic views & heavy interactive drawers for sub-second FCP
const CategoryFilter = React.lazy(() => import("./components/customer/CategoryFilter").then(m => ({ default: m.CategoryFilter })));
const CartDrawer = React.lazy(() => import("./components/customer/CartDrawer").then(m => ({ default: m.CartDrawer })));
const ProductDetailsModal = React.lazy(() => import("./components/customer/ProductDetailsModal").then(m => ({ default: m.ProductDetailsModal })));
const CustomerDashboard = React.lazy(() => import("./components/customer/CustomerDashboard").then(m => ({ default: m.CustomerDashboard })));
const FloatingAiChat = React.lazy(() => import("./components/customer/FloatingAiChat").then(m => ({ default: m.FloatingAiChat })));
const TrackOrderView = React.lazy(() => import("./components/customer/TrackOrderView").then(m => ({ default: m.TrackOrderView })));
const ReturnsRefundsView = React.lazy(() => import("./components/customer/ReturnsRefundsView").then(m => ({ default: m.ReturnsRefundsView })));
const AiAssistantView = React.lazy(() => import("./components/customer/AiAssistantView").then(m => ({ default: m.AiAssistantView })));
const CustomerTicketChatModal = React.lazy(() => import("./components/customer/CustomerTicketChatModal").then(m => ({ default: m.CustomerTicketChatModal })));

// Admin Panel Components (Dynamically imported on admin access)
const AdminSidebar = React.lazy(() => import("./components/admin/AdminSidebar").then(m => ({ default: m.AdminSidebar })));
const AdminDashboard = React.lazy(() => import("./components/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const TicketQueueView = React.lazy(() => import("./components/admin/TicketQueueView").then(m => ({ default: m.TicketQueueView })));
const OrderRegistryView = React.lazy(() => import("./components/admin/OrderRegistryView").then(m => ({ default: m.OrderRegistryView })));
const KnowledgeBaseView = React.lazy(() => import("./components/admin/KnowledgeBaseView").then(m => ({ default: m.KnowledgeBaseView })));
const TelephonyVoiceView = React.lazy(() => import("./components/admin/TelephonyVoiceView").then(m => ({ default: m.TelephonyVoiceView })));
const CrmInboxView = React.lazy(() => import("./components/admin/CrmInboxView").then(m => ({ default: m.CrmInboxView })));
const CrmCustomersView = React.lazy(() => import("./components/admin/CrmCustomersView").then(m => ({ default: m.CrmCustomersView })));
const CrmAiConversationsView = React.lazy(() => import("./components/admin/CrmAiConversationsView").then(m => ({ default: m.CrmAiConversationsView })));
const CrmReturnsRefundsView = React.lazy(() => import("./components/admin/CrmReturnsRefundsView").then(m => ({ default: m.CrmReturnsRefundsView })));
const CrmAnalyticsView = React.lazy(() => import("./components/admin/CrmAnalyticsView").then(m => ({ default: m.CrmAnalyticsView })));
const CrmSettingsView = React.lazy(() => import("./components/admin/CrmSettingsView").then(m => ({ default: m.CrmSettingsView })));
import { getProductEnhancement } from "./utils/productData";

// Immediate Static Fallback Catalog for Millisecond LCP
const INITIAL_PRODUCTS: Product[] = [
  {
    _id: "prd-003-seed",
    sku: "PRD-003",
    name: "Ergonomic Running Shoes",
    category: "Footwear",
    price: 2199,
    stock: 65,
    rating: 4.7,
    description: "Lightweight and breathable athletic running shoes with responsive foam cushioning for everyday comfort.",
    active: true,
  },
  {
    _id: "prd-002-seed",
    sku: "PRD-002",
    name: "Everyday Smart Watch",
    category: "Wearables",
    price: 3999,
    stock: 28,
    rating: 4.6,
    description: "Sleek fitness tracking smartwatch with AMOLED display, heart rate monitor, and 7-day battery life.",
    active: true,
  },
  {
    _id: "prd-001-seed",
    sku: "PRD-001",
    name: "Studio Wireless Headphones",
    category: "Electronics",
    price: 2499,
    stock: 42,
    rating: 4.8,
    description: "Over-ear noise-cancelling wireless Bluetooth headphones with 30-hour battery life and fast USB-C charging.",
    active: true,
  },
  {
    _id: "prd-004-seed",
    sku: "PRD-004",
    name: "Classic Denim Jacket",
    category: "Apparel",
    price: 1899,
    stock: 19,
    rating: 4.5,
    description: "Timeless vintage wash denim jacket made from 100% durable cotton with button closure.",
    active: true,
  },
  {
    _id: "prd-005-seed",
    sku: "PRD-005",
    name: "Waterproof Laptop Backpack",
    category: "Accessories",
    price: 1499,
    stock: 54,
    rating: 4.9,
    description: "Weather-resistant 25L daily commuter backpack with dedicated padded sleeve for up to 16-inch laptops.",
    active: true,
  },
  {
    _id: "prd-006-seed",
    sku: "PRD-006",
    name: "Mechanical Gaming Keyboard",
    category: "Electronics",
    price: 4299,
    stock: 15,
    rating: 4.8,
    description: "Tenkeyless mechanical keyboard with customizable RGB backlighting and durable tactile blue switches.",
    active: true,
  },
];

const ViewLoader = () => (
  <div className="flex-1 flex items-center justify-center p-12 text-xs opacity-60">
    <div className="flex items-center gap-2 animate-pulse">
      <Sparkles className="w-4 h-4 text-amber-400" />
      <span>Loading view...</span>
    </div>
  </div>
);

import {
  ShoppingBag,
  ArrowRight,
  AlertTriangle,
  Sun,
  Moon,
  Sparkles,
  Plus,
  Package,
  Menu,
} from "lucide-react";

/* =========================================================================
   1. AUTHENTICATION VIEW (LOGIN / REGISTER / QUICK DEMO LOGIN)
   ========================================================================= */
const AuthView = () => {
  const { login, register, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = getThemeStyles(theme);

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
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${t.shell}`}>
      {/* Top Right Theme Mode Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Forest & Emerald" : "Premium Gold"}`}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${t.secondaryButton}`}
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-[#d9a83e]" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{theme === "dark" ? "Premium Gold 🌙" : "Forest Light ☀️"}</span>
        </button>
      </div>

      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl transition ${t.card}`}>
        {/* Brand */}
        <div className="text-center mb-6">
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 font-bold shadow-md ${t.sidebarBrand}`}
          >
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            ShopEase<span className={t.accentText}>.ai</span>
          </h1>
          <p className="text-xs opacity-75 mt-1">
            Omnichannel E-Commerce Store & Grounded AI Customer Support
          </p>
        </div>

        {/* 1-Click Persona Quick Logins */}
        <div className={`mb-6 p-3.5 rounded-2xl border space-y-2.5 ${t.cardMuted} ${t.divider}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 flex items-center justify-between">
            <span>Instant One-Click Demo Personas</span>
            <span className={`font-mono text-[9px] ${t.accentText}`}>Default Pass: Password123!</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Row 1: Admin & Supervisor */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("admin")}
                className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between border-amber-500/30 ${t.secondaryButton}`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Vikram Mehta</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-extrabold uppercase">Admin</span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">admin@shopease.local</div>
                </div>
                <div className="text-[9px] opacity-60 mt-1">Full Root System Control</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("supervisor")}
                className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between border-purple-500/30 ${t.secondaryButton}`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Aditi Verma</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-extrabold uppercase">Supervisor</span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">supervisor@shopease.local</div>
                </div>
                <div className="text-[9px] opacity-60 mt-1">Escalations, Refunds &amp; Analytics</div>
              </button>
            </div>

            {/* Row 2: Agent */}
            <button
              type="button"
              onClick={() => quickLogin("agent")}
              className={`w-full p-2.5 rounded-xl border text-left transition hover:scale-[1.01] flex items-center justify-between border-emerald-500/30 ${t.secondaryButton}`}
            >
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>Priya Sharma</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-bold uppercase">Support Agent</span>
                </div>
                <div className="text-[10px] opacity-70 font-mono mt-0.5">agent@shopease.local</div>
              </div>
              <div className="text-[9px] opacity-60 text-right">CRM Inbox &amp; Customer 360</div>
            </button>

            {/* Row 3: Customers */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("customer")}
                className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between ${t.secondaryButton}`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Aman Gupta</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-500 font-bold uppercase">Customer</span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">customer@shopease.local</div>
                </div>
                <div className="text-[9px] opacity-50 mt-1">Storefront (English)</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("customer2")}
                className={`p-2.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between ${t.secondaryButton}`}
              >
                <div>
                  <div className="font-bold flex items-center justify-between">
                    <span>Rohit Kumar</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-500 font-bold uppercase">Customer</span>
                  </div>
                  <div className="text-[10px] opacity-70 font-mono mt-0.5">customer2@shopease.local</div>
                </div>
                <div className="text-[9px] opacity-50 mt-1">Storefront (Hindi)</div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold mb-1 opacity-80">Full Name</label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aman Gupta"
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${t.input}`}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold mb-1 opacity-80">Email Address</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@shopease.local"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${t.input}`}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold mb-1 opacity-80">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none ${t.input}`}
            />
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="auth-role" className="block text-xs font-semibold mb-1 opacity-80">Role</label>
                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className={`w-full rounded-xl px-2 py-2 text-xs focus:outline-none ${t.input}`}
                >
                  <option value="customer">Customer</option>
                  <option value="agent">Support Agent</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="auth-language" className="block text-xs font-semibold mb-1 opacity-80">Language</label>
                <select
                  id="auth-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "hinglish")}
                  className={`w-full rounded-xl px-2 py-2 text-xs focus:outline-none ${t.input}`}
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
            className={`w-full mt-4 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${t.primaryButton}`}
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In to ShopEase"}
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
            className={`text-xs hover:underline ${t.accentText}`}
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
   2. MAIN APPLICATION (DUAL-PANEL SYSTEM: CUSTOMER & ADMIN)
   ========================================================================= */
const MainWorkspace = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  const isStaff = user?.role === "agent" || user?.role === "supervisor" || user?.role === "admin";

  // Current Panel Mode: "customer" or "admin" (strictly locked to "customer" for customers)
  const [panelMode, setPanelMode] = useState<"customer" | "admin">(
    isStaff ? "admin" : "customer"
  );

  // Enforce customer access barrier
  useEffect(() => {
    if (!isStaff && panelMode === "admin") {
      setPanelMode("customer");
    }
  }, [user?.role, isStaff, panelMode]);

  // Customer Panel State
  const [customerView, setCustomerView] = useState<CustomerViewType>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("shopease_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatQuery, setAiChatQuery] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileCustomerSidebarOpen, setIsMobileCustomerSidebarOpen] = useState(false);

  // Admin Panel State
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data: Instant fallback catalog for sub-second FCP & LCP
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem("shopease_cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setOrdersLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Raise Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<TicketCategory>("order_issue");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newOrderId, setNewOrderId] = useState("");
  const [newInitialMsg, setNewInitialMsg] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Customer Live Ticket Chat Modal State
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [isTicketChatOpen, setIsTicketChatOpen] = useState(false);

  const handleOpenTicketChat = (ticketOrId: Ticket | string) => {
    if (typeof ticketOrId === "object" && ticketOrId) {
      setChatTicket(ticketOrId);
      setIsTicketChatOpen(true);
    } else if (typeof ticketOrId === "string") {
      const found = tickets.find(
        (t) => t._id === ticketOrId || t.ticketNumber === ticketOrId
      );
      if (found) {
        setChatTicket(found);
        setIsTicketChatOpen(true);
      } else {
        api.tickets
          .getById(ticketOrId)
          .then((res) => {
            if (res.ticket) {
              setChatTicket(res.ticket);
              setIsTicketChatOpen(true);
            }
          })
          .catch((err) => console.error("Ticket lookup error", err));
      }
    }
  };

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem("shopease_cart", JSON.stringify(cart));
  }, [cart]);

  // Load Products (with background caching for subsequent instant loads)
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.products.list();
      if (res.data?.products?.length) {
        setProducts(res.data.products);
        try {
          localStorage.setItem("shopease_cached_products", JSON.stringify(res.data.products));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      if (isStaff && panelMode === "admin") {
        const res = await api.orders.getAllOrders();
        setOrders(res.data.orders);
      } else {
        const res = await api.orders.getMyOrders();
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load Tickets
  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      if (isStaff && panelMode === "admin") {
        const res = await api.tickets.getStaffTickets();
        setTickets(res.data.tickets);
      } else {
        const res = await api.tickets.getMyTickets();
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Priority 1: Load Products immediately for instant storefront LCP
  useEffect(() => {
    loadProducts();
  }, []);

  // Priority 2: Fetch Orders & Tickets contextually when entering respective views or admin panel
  useEffect(() => {
    if (panelMode === "admin" || ["orders", "track", "returns", "dashboard"].includes(customerView)) {
      loadOrders();
    }
  }, [panelMode, customerView]);

  useEffect(() => {
    if (panelMode === "admin" || ["support", "dashboard"].includes(customerView)) {
      loadTickets();
    }
  }, [panelMode, customerView]);

  // Priority 3: Non-blocking background pre-warm on idle after initial paint
  useEffect(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(
        () => {
          loadOrders();
          loadTickets();
        },
        { timeout: 3500 }
      );
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => {
        loadOrders();
        loadTickets();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [panelMode]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const handleClearCart = () => setCart([]);

  const handleOpenAiWithContext = (prompt: string) => {
    setAiChatQuery(prompt);
    setIsAiChatOpen(true);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const res = await api.tickets.create({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        orderId: newOrderId || undefined,
        initialMessage: newInitialMsg || undefined,
      });

      setShowNewTicketModal(false);
      setNewSubject("");
      setNewOrderId("");
      setNewInitialMsg("");
      loadTickets();

      // Open AI chat or show confirmation
      handleOpenAiWithContext(
        `I just created ticket ${res.ticket.ticketNumber} regarding: "${res.ticket.subject}". Can you help resolve this?`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Filter Products for Customer View
  const categoriesList = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const handleResetCustomerFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange("all");
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy("featured");
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(p.category.toLowerCase());
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = inStockOnly ? p.stock > 0 : true;

      let matchesPrice = true;
      if (priceRange === "under_2000") matchesPrice = p.price < 2000;
      else if (priceRange === "2000_5000") matchesPrice = p.price >= 2000 && p.price <= 5000;
      else if (priceRange === "5000_10000") matchesPrice = p.price > 5000 && p.price <= 10000;
      else if (priceRange === "above_10000") matchesPrice = p.price > 10000;

      const matchesRating = minRating > 0 ? (p.rating || 4.5) >= minRating : true;

      let matchesDiscount = true;
      if (minDiscount > 0) {
        const enh = getProductEnhancement(p.sku);
        const orig = p.originalPrice || enh.originalPrice;
        const disc = orig ? Math.round(((orig - p.price) / orig) * 100) : 0;
        matchesDiscount = disc >= minDiscount;
      }

      return matchesCategory && matchesSearch && matchesStock && matchesPrice && matchesRating && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "discount_desc") {
        const discA = ((getProductEnhancement(a.sku).originalPrice - a.price) / getProductEnhancement(a.sku).originalPrice) * 100;
        const discB = ((getProductEnhancement(b.sku).originalPrice - b.price) / getProductEnhancement(b.sku).originalPrice) * 100;
        return discB - discA;
      }
      return 0;
    });

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${t.shell}`}>
      {/* ===================================================================
          PANEL A: CUSTOMER STOREFRONT PANEL
          =================================================================== */}
      {panelMode === "customer" && (
        <div className="flex h-screen overflow-hidden">
          {/* Customer Sidebar Navigation */}
          <CustomerSidebar
            activeView={customerView}
            setActiveView={setCustomerView}
            cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
            orderCount={orders.length}
            onOpenAiChat={() => setIsAiChatOpen(true)}
            onSwitchToStaffPanel={
              isStaff ? () => setPanelMode("admin") : undefined
            }
            isOpenMobile={isMobileCustomerSidebarOpen}
            onCloseMobile={() => setIsMobileCustomerSidebarOpen(false)}
          />

          {/* Customer Main Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Customer Top Navbar */}
            <CustomerNavbar
              cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
              onOpenCart={() => setIsCartOpen(true)}
              activeView={customerView}
              setActiveView={setCustomerView}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categoriesList}
              onOpenAiChat={() => setIsAiChatOpen(true)}
              onOpenMobileSidebar={() => setIsMobileCustomerSidebarOpen(true)}
              onSwitchToStaffPanel={
                isStaff ? () => setPanelMode("admin") : undefined
              }
            />

            {/* Main Customer Content Scroll Container */}
            <main className="flex-1 overflow-y-auto w-full">
            {customerView === "home" && (
              <CustomerHomeView
                orders={orders}
                products={products}
                onNavigateToView={(view) => setCustomerView(view)}
                onOpenProductDetails={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod) => handleAddToCart(prod, 1)}
                onAskAi={(q) => handleOpenAiWithContext(q)}
                cartProductIds={cart.map((c) => c.product._id)}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {customerView === "products" && (
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div id="products-grid" className="pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        Featured Products & Catalogue
                      </h2>
                      <p className="text-xs opacity-65">
                        High-performance smart gadgets, active noise-cancelling audio & fast accessories.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full opacity-80 border w-fit">
                      {filteredProducts.length} Products Available
                    </span>
                  </div>

                  <React.Suspense fallback={<div className="h-14 rounded-2xl bg-current/5 animate-pulse my-2" />}>
                    <CategoryFilter
                      categories={categoriesList}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      inStockOnly={inStockOnly}
                      onToggleInStock={setInStockOnly}
                      priceRange={priceRange}
                      onSelectPriceRange={setPriceRange}
                      minRating={minRating}
                      onSelectMinRating={setMinRating}
                      minDiscount={minDiscount}
                      onSelectMinDiscount={setMinDiscount}
                      onResetFilters={handleResetCustomerFilters}
                    />
                  </React.Suspense>

                  {/* Products Grid */}
                  {productsLoading ? (
                    <div className="py-20 text-center text-xs opacity-60">
                      Loading store products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className={`py-16 text-center rounded-3xl border space-y-3 ${t.cardMuted} ${t.divider}`}>
                      <Package className="w-10 h-10 mx-auto opacity-30" />
                      <div className="text-sm font-bold">No products match your active filters.</div>
                      <p className="text-xs opacity-70">Try loosening your price, discount, or rating criteria.</p>
                      <button
                        type="button"
                        onClick={handleResetCustomerFilters}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${t.primaryButton}`}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod._id}
                          product={prod}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                          onOpenDetails={setSelectedProduct}
                          onAskAiAboutProduct={(p) =>
                            handleOpenAiWithContext(
                              `Tell me about ${p.name} (SKU: ${p.sku}) - price ₹${p.price}, stock availability, warranty and returns policy.`
                            )
                          }
                          isAdded={cart.some((c) => c.product._id === prod._id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <React.Suspense fallback={<ViewLoader />}>
              {customerView === "dashboard" && (
                <CustomerDashboard
                  initialTab="overview"
                  onOpenAiWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                  onRaiseTicket={() => setShowNewTicketModal(true)}
                  onOpenTicketInChat={handleOpenTicketChat}
                  onAskAiAboutPolicy={(query) => handleOpenAiWithContext(query)}
                  onNavigateToView={(view) => setCustomerView(view)}
                />
              )}
            </React.Suspense>

            <React.Suspense fallback={<ViewLoader />}>
              {customerView === "orders" && (
                <CustomerDashboard
                  initialTab="orders"
                  onOpenAiWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                  onRaiseTicket={() => setShowNewTicketModal(true)}
                  onOpenTicketInChat={handleOpenTicketChat}
                  onAskAiAboutPolicy={(query) => handleOpenAiWithContext(query)}
                  onNavigateToView={(view) => setCustomerView(view)}
                />
              )}

              {customerView === "track" && (
                <TrackOrderView
                  orders={orders}
                  onAskAiAboutOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                />
              )}

              {customerView === "assistant" && (
                <AiAssistantView
                  orders={orders}
                  initialQuery={aiChatQuery}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                  onOpenTicketModal={handleOpenTicketChat}
                />
              )}

              {customerView === "returns" && (
                <ReturnsRefundsView
                  orders={orders}
                  onOpenAiWithReturnQuery={(query) => handleOpenAiWithContext(query)}
                />
              )}

              {customerView === "support" && (
                <CustomerDashboard
                  initialTab="tickets"
                  onOpenAiWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                  onRaiseTicket={() => setShowNewTicketModal(true)}
                  onOpenTicketInChat={handleOpenTicketChat}
                  onAskAiAboutPolicy={(query) => handleOpenAiWithContext(query)}
                  onNavigateToView={(view) => setCustomerView(view)}
                />
              )}

              {customerView === "knowledge" && (
                <CustomerDashboard
                  initialTab="knowledge"
                  onOpenAiWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                  onRaiseTicket={() => setShowNewTicketModal(true)}
                  onOpenTicketInChat={handleOpenTicketChat}
                  onAskAiAboutPolicy={(query) => handleOpenAiWithContext(query)}
                  onNavigateToView={(view) => setCustomerView(view)}
                />
              )}

              {customerView === "profile" && (
                <CustomerDashboard
                  initialTab="profile"
                  onOpenAiWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my order ${orderNum} right now?`)
                  }
                  onRaiseTicket={() => setShowNewTicketModal(true)}
                  onOpenTicketInChat={handleOpenTicketChat}
                  onAskAiAboutPolicy={(query) => handleOpenAiWithContext(query)}
                  onNavigateToView={(view) => setCustomerView(view)}
                />
              )}
            </React.Suspense>
              {/* Footer inside scrollable customer main */}
              <footer className={`border-t py-8 px-4 sm:px-6 lg:px-8 text-xs transition mt-12 ${t.divider} ${t.cardMuted}`}>
                <div className="w-full max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className={`w-4 h-4 ${t.accentText}`} />
                    <span className="font-extrabold text-sm">ShopEase.ai</span>
                    <span className="opacity-40">•</span>
                    <span className="opacity-70">Omnichannel Support & Real-Time E-Commerce Platform</span>
                  </div>

                  <div className="flex items-center gap-4 opacity-75">
                    <button
                      onClick={() =>
                        handleOpenAiWithContext("What is your 7-day electronics return policy?")
                      }
                      className="hover:underline"
                    >
                      Return Policy
                    </button>
                    <button
                      onClick={() =>
                        handleOpenAiWithContext("What are your express shipping delivery timelines?")
                      }
                      className="hover:underline"
                    >
                      Shipping Info
                    </button>
                    <button
                      onClick={() => setIsAiChatOpen(true)}
                      className={`font-bold hover:underline ${t.accentText}`}
                    >
                      AI Help Center
                    </button>
                  </div>
                </div>
              </footer>
            </main>

            {/* Product Details Modal with AI Contextual Q&A */}
            <React.Suspense fallback={null}>
              {selectedProduct && (
                <ProductDetailsModal
                  product={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                  onAddToCart={handleAddToCart}
                  onBuyNow={(prod, qty) => {
                    handleAddToCart(prod, qty);
                    setIsCartOpen(true);
                  }}
                  onAskAi={handleOpenAiWithContext}
                />
              )}
            </React.Suspense>

            {/* Cart Drawer */}
            <React.Suspense fallback={null}>
              {isCartOpen && (
                <CartDrawer
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  cart={cart}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onOrderCreated={() => {
                    loadOrders();
                    loadProducts();
                  }}
                  onOpenAiChatWithOrder={(orderNum) =>
                    handleOpenAiWithContext(`Where is my new order ${orderNum} right now?`)
                  }
                />
              )}
            </React.Suspense>

            {/* Floating AI Chat Assistant */}
            <React.Suspense fallback={null}>
              {(customerView === "home" || isAiChatOpen) && (
                <FloatingAiChat
                  isOpen={isAiChatOpen}
                  onToggle={() => setIsAiChatOpen(!isAiChatOpen)}
                  initialQuery={aiChatQuery}
                  onAddToCart={(prod) => handleAddToCart(prod, 1)}
                  onOpenTicketModal={handleOpenTicketChat}
                />
              )}
            </React.Suspense>
          </div>
        </div>
      )}

      {/* ===================================================================
          PANEL B: ADMIN & SUPPORT OPERATIONS PANEL
          =================================================================== */}
      {panelMode === "admin" && (
        <div className="flex h-screen overflow-hidden">
          {/* Admin Sidebar Navigation */}
          <React.Suspense fallback={<div className="w-20 md:w-64 h-full bg-current/5" />}>
            <AdminSidebar
              activeTab={adminTab}
              setActiveTab={setAdminTab}
              ticketCount={tickets.filter((t) => t.status === "open").length}
              orderCount={orders.length}
              onSwitchToCustomerStore={() => setPanelMode("customer")}
              isOpenMobile={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </React.Suspense>

          {/* Admin Workspace Content View */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Admin Header */}
            <header className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 ${t.card} ${t.divider}`}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 rounded-xl border opacity-80 hover:opacity-100"
                  title="Open Navigation Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold truncate">
                  <span className="capitalize">{adminTab} Hub</span>
                  <span className="opacity-40 hidden sm:inline">•</span>
                  <span className="text-xs font-normal opacity-70 hidden sm:inline">
                    Role: <strong className="uppercase">{user?.role}</strong> ({user?.name})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPanelMode("customer")}
                  className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition ${
                    t.isDark
                      ? "bg-[#382f1c] text-[#f5e7bf] border-[#d9a83e]/50 hover:bg-[#4a3f25]"
                      : "bg-[#e6f4ea] text-[#059669] border-[#a7f3d0] hover:bg-[#d6ecd9]"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Customer Storefront</span>
                  <span className="sm:hidden">Store</span>
                </button>
              </div>
            </header>

            {/* Dynamic Admin Body View */}
            <div className="flex-1 overflow-hidden">
              <React.Suspense fallback={<ViewLoader />}>
                {adminTab === "dashboard" && (
                  <AdminDashboard
                    orders={orders}
                    tickets={tickets}
                    products={products}
                    onNavigateToTab={setAdminTab}
                  />
                )}

                {adminTab === "inbox" && (
                  <CrmInboxView
                    tickets={tickets}
                    orders={orders}
                    onRefreshTickets={loadTickets}
                  />
                )}

                {adminTab === "tickets" && (
                  <TicketQueueView
                    tickets={tickets}
                    onRefreshTickets={loadTickets}
                    selectedTicket={selectedTicket}
                    onSelectTicket={setSelectedTicket}
                  />
                )}

                {adminTab === "customers" && (
                  <CrmCustomersView
                    orders={orders}
                    tickets={tickets}
                  />
                )}

                {adminTab === "ai_conversations" && (
                  <CrmAiConversationsView />
                )}

                {adminTab === "orders" && (
                  <OrderRegistryView
                    orders={orders}
                    onRefreshOrders={loadOrders}
                  />
                )}

                {adminTab === "returns" && (
                  <CrmReturnsRefundsView />
                )}

                {adminTab === "products" && (
                  <div className="p-6 space-y-4 max-w-7xl mx-auto overflow-y-auto h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Package className={`w-5 h-5 ${t.accentText}`} />
                          <span>Product Store Inventory</span>
                        </h2>
                        <p className="text-xs opacity-75">
                          Manage active store SKUs, prices, categories, and warehouse inventory.
                        </p>
                      </div>
                      <button
                        onClick={loadProducts}
                        className={`text-xs font-bold hover:underline ${t.accentText}`}
                      >
                        Refresh Inventory
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((p) => {
                        const enh = p.sku ? getProductEnhancement(p.sku) : null;
                        return (
                          <div
                            key={p._id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between overflow-hidden ${t.card}`}
                          >
                            {enh && (
                              <div className="relative -mx-4 -mt-4 mb-3 h-36 bg-black/10 overflow-hidden">
                                <img
                                  src={enh.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                {enh.badge && (
                                  <span
                                    className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${t.badgeHighlight}`}
                                  >
                                    {enh.badge}
                                  </span>
                                )}
                              </div>
                            )}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-[10px] opacity-60">{p.sku}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badgeHighlight}`}>
                                  {p.category}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                              <p className="text-xs opacity-70 line-clamp-2 mb-3">{p.description}</p>
                            </div>
                            <div className="pt-2 border-t border-current/10 flex items-center justify-between">
                              <span className={`font-extrabold text-sm ${t.accentText}`}>
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-semibold opacity-80">
                                Stock: {p.stock}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {adminTab === "knowledge" && <KnowledgeBaseView />}

                {adminTab === "analytics" && (
                  <CrmAnalyticsView
                    orders={orders}
                    tickets={tickets}
                  />
                )}

                {adminTab === "calls" && <TelephonyVoiceView />}

                {adminTab === "settings" && <CrmSettingsView />}
              </React.Suspense>
            </div>
          </main>
        </div>
      )}

      {/* Customer Raise Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 ${t.card}`}>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Raise Support Ticket</span>
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Subject / Issue Summary</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Defective wireless headphone / Return request"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 opacity-80">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                  >
                    <option value="order_issue">Order Issue</option>
                    <option value="product_inquiry">Product Inquiry</option>
                    <option value="return_request">Return Request</option>
                    <option value="general">General</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Order Number (Optional)</label>
                <input
                  type="text"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="e.g. ORD-1001"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Initial Message</label>
                <textarea
                  rows={3}
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${t.input}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-3 py-2 rounded-xl opacity-70 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className={`px-4 py-2 rounded-xl font-bold ${t.primaryButton}`}
                >
                  {ticketSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Live Ticket Chat Modal with Agent */}
      <React.Suspense fallback={null}>
        {isTicketChatOpen && (
          <CustomerTicketChatModal
            ticket={chatTicket}
            isOpen={isTicketChatOpen}
            onClose={() => setIsTicketChatOpen(false)}
            onTicketUpdated={loadTickets}
          />
        )}
      </React.Suspense>
    </div>
  );
};

/* =========================================================================
   3. ROOT EXPORT WITH PROVIDERS
   ========================================================================= */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0b] flex items-center justify-center text-xs text-[#f5e7bf]">
        <div className="flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4 text-[#d9a83e]" />
          <span>Loading ShopEase AI Platform...</span>
        </div>
      </div>
    );
  }

  return user ? <MainWorkspace /> : <AuthView />;
}

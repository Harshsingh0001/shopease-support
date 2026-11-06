import React, { useState } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Sun,
  Moon,
  LogOut,
  Shield,
  User,
  Sparkles,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export type CustomerViewType =
  | "home"
  | "products"
  | "dashboard"
  | "orders"
  | "track"
  | "assistant"
  | "support"
  | "returns"
  | "knowledge"
  | "profile";

interface CustomerNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activeView: CustomerViewType;
  setActiveView: (view: CustomerViewType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  categories?: string[];
  onOpenAiChat: () => void;
  onOpenMobileSidebar?: () => void;
  onSwitchToStaffPanel?: () => void;
}

export const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  cartCount,
  onOpenCart,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  selectedCategory = "all",
  onSelectCategory,
  categories = [],
  onOpenAiChat,
  onOpenMobileSidebar,
  onSwitchToStaffPanel,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = getThemeStyles(theme);

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isStaff = user?.role === "agent" || user?.role === "supervisor" || user?.role === "admin";

  const getPageTitle = (view: CustomerViewType) => {
    switch (view) {
      case "home":
        return "Storefront Home";
      case "products":
        return "Store Catalogue";
      case "dashboard":
        return "My Dashboard";
      case "orders":
        return "My Orders";
      case "track":
        return "Track Shipments";
      case "assistant":
        return "24/7 AI Assistant";
      case "returns":
        return "Returns & Refunds";
      case "support":
        return "My Support";
      case "knowledge":
        return "Policies & FAQs";
      case "profile":
        return "Delivery Addresses";
      default:
        return "Storefront";
    }
  };

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${t.card} ${t.divider}`}>
      {/* Top Persona Bar */}
      <div className={`px-4 sm:px-6 lg:px-8 py-1.5 text-xs border-b flex flex-wrap items-center justify-between font-mono gap-1.5 ${t.divider} ${t.cardMuted}`}>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="flex items-center gap-1.5 opacity-80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">CUSTOMER PORTAL</span>
          </span>
          <span className="opacity-40">•</span>
          <span className="opacity-90 truncate max-w-[150px] sm:max-w-none">
            <strong className={t.accentText}>{user?.name}</strong> ({user?.role})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="opacity-60 hidden lg:inline">Switch Persona:</span>
          <button
            type="button"
            onClick={() => quickLogin("customer")}
            title="Switch to Customer: Aman Gupta"
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-semibold transition ${
              user?.email === "customer@shopease.local" ? t.badgeHighlight : "opacity-70 hover:opacity-100"
            }`}
          >
            Aman (Customer)
          </button>
          <button
            type="button"
            onClick={() => quickLogin("customer2")}
            title="Switch to Customer: Rohit Kumar"
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-semibold transition ${
              user?.email === "customer2@shopease.local" ? t.badgeHighlight : "opacity-70 hover:opacity-100"
            }`}
          >
            Rohit (Customer)
          </button>
          <button
            type="button"
            onClick={() => quickLogin("agent")}
            title="Switch to Support Agent: Priya Sharma"
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-semibold transition ${
              user?.email === "agent@shopease.local" ? t.badgeHighlight : "opacity-70 hover:opacity-100"
            }`}
          >
            Priya (Agent)
          </button>
          <button
            type="button"
            onClick={() => quickLogin("supervisor")}
            title="Switch to Supervisor: Aditi Verma"
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-semibold transition ${
              user?.email === "supervisor@shopease.local" ? t.badgeHighlight : "opacity-70 hover:opacity-100"
            }`}
          >
            Aditi (Supervisor)
          </button>
          <button
            type="button"
            onClick={() => quickLogin("admin")}
            title="Switch to Admin: Vikram Mehta"
            className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-sans font-semibold transition ${
              user?.email === "admin@shopease.local" ? t.badgeHighlight : "opacity-70 hover:opacity-100"
            }`}
          >
            Vikram (Admin)
          </button>

          {isStaff && onSwitchToStaffPanel && (
            <button
              type="button"
              onClick={onSwitchToStaffPanel}
              className={`ml-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-bold flex items-center gap-1 border ${
                t.isDark
                  ? "bg-[#382f1c] text-[#f5e7bf] border-[#d9a83e]/50 hover:bg-[#4a3f25]"
                  : "bg-[#124a38] text-white border-[#0e3b2c] hover:bg-[#185a45]"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Admin Hub &rarr;</span>
              <span className="sm:hidden">Ops &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar Header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Toggle & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 rounded-xl border opacity-80 hover:opacity-100"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => setActiveView("home")}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold ${t.sidebarBrand}`}>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="font-black text-base sm:text-lg tracking-tight leading-none">
                ShopEase<span className={t.accentText}>.ai</span>
              </div>
              <div className="text-[9px] font-medium opacity-65 tracking-wide uppercase hidden sm:block">
                Customer Storefront
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs opacity-60 ml-2 border-l pl-3 border-current/20">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className={`font-bold ${t.accentText}`}>{getPageTitle(activeView)}</span>
          </div>
        </div>

        {/* Center: Search Bar with Department Selector */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="flex items-center rounded-xl border overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
            {categories.length > 0 && onSelectCategory && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  onSelectCategory(e.target.value);
                  if (activeView !== "products") {
                    setActiveView("products");
                  }
                }}
                className={`py-2 px-2.5 text-xs font-bold border-r focus:outline-none capitalize shrink-0 ${t.input} border-none`}
              >
                <option value="all">All Departments</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 absolute left-3 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== "products") {
                    setActiveView("products");
                  }
                }}
                placeholder="Search products, headphones, smartwatches, gadgets..."
                className={`w-full pl-9 pr-4 py-2 text-xs focus:outline-none ${t.input} border-none`}
              />
            </div>
          </div>
        </div>

        {/* Right Actions: Search Mobile, AI, Theme, Cart, Profile, Logout */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 rounded-xl border opacity-80 hover:opacity-100"
            title="Search Products"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick AI Help Launcher */}
          <button
            type="button"
            onClick={onOpenAiChat}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              t.isDark
                ? "bg-[#382f1c] hover:bg-[#483d25] text-[#f5e7bf] border-[#d9a83e]/40"
                : "bg-[#e6f4ea] hover:bg-[#d5ecd9] text-[#059669] border-[#a7f3d0]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch theme (Current: ${t.isDark ? "Premium Gold" : "Forest & Emerald"})`}
            className={`p-2 rounded-xl border flex items-center justify-center transition shrink-0 ${t.secondaryButton}`}
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-[#d9a83e]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* Cart Launcher */}
          <button
            type="button"
            onClick={onOpenCart}
            title="Open Shopping Cart"
            className={`relative p-2 rounded-xl flex items-center justify-center transition shrink-0 border ${t.secondaryButton}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white shadow-sm ${
                  t.isDark ? "bg-[#d9a83e] text-[#17140d]" : "bg-[#059669]"
                }`}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar shortcut */}
          <button
            type="button"
            onClick={() => setActiveView("profile")}
            title="My Profile & Addresses"
            className={`p-2 rounded-xl border flex items-center justify-center transition shrink-0 ${
              activeView === "profile" ? t.primaryButton : t.secondaryButton
            }`}
          >
            <User className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            title="Sign out of customer session"
            className="p-2 opacity-60 hover:opacity-100 hover:text-rose-500 rounded-xl transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {showMobileSearch && (
        <div className={`p-3 border-t md:hidden ${t.divider} ${t.cardMuted}`}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, headphones, smartwatches..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none ${t.input}`}
            />
          </div>
        </div>
      )}
    </header>
  );
};

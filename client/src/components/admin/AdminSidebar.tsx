import React, { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  MessageCircle,
  Users,
  Bot,
  Truck,
  RotateCcw,
  Package,
  BookOpen,
  BarChart3,
  PhoneCall,
  Settings,
  ShoppingBag,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
  X,
  Pin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

export type AdminTab =
  | "dashboard"
  | "inbox"
  | "tickets"
  | "customers"
  | "ai_conversations"
  | "orders"
  | "returns"
  | "products"
  | "knowledge"
  | "analytics"
  | "calls"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  ticketCount: number;
  orderCount: number;
  onSwitchToCustomerStore: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  ticketCount,
  orderCount,
  onSwitchToCustomerStore,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = getThemeStyles(theme);

  // Pin State (persisted in localStorage, default: true)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("shopease_admin_sidebar_pinned");
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  // Hover expansion state (only active when unpinned)
  const [isHovered, setIsHovered] = useState(false);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("shopease_admin_sidebar_pinned", String(next));
      } catch (err) {
        console.error("Failed to save sidebar pin state", err);
      }
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  const renderSidebarContent = (isMobile = false) => {
    const showFull = isMobile || isExpanded;

    return (
      <div
        className={`flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 ease-in-out ${
          t.sidebar
        } ${showFull ? "w-64" : "w-20 items-center"}`}
      >
        <div className="overflow-y-auto overflow-x-hidden w-full scrollbar-none">
          {/* Brand Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between transition-all ${
              t.sidebarFooter
            } ${showFull ? "px-4" : "px-2 justify-center"}`}
          >
            {showFull ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${t.sidebarBrand}`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-sm tracking-tight truncate">
                      ShopEase CRM
                    </div>
                    <div className="text-[10px] opacity-75 truncate">
                      Omnichannel Support Ops
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Pin Toggle Button on Desktop */}
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={togglePin}
                      title={
                        isPinned
                          ? "Unpin sidebar (auto-collapses on hover out)"
                          : "Pin sidebar permanently open"
                      }
                      className={`p-1.5 rounded-lg border transition ${
                        isPinned
                          ? `${t.primaryButton} shadow-sm`
                          : "opacity-60 hover:opacity-100 hover:bg-current/10"
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? "rotate-45" : ""}`} />
                    </button>
                  )}

                  {/* Mobile Close Button */}
                  {onCloseMobile && isMobile && (
                    <button
                      type="button"
                      onClick={onCloseMobile}
                      className="p-1 rounded-lg opacity-70 hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${t.sidebarBrand}`}
                  title="ShopEase CRM"
                >
                  <Bot className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={togglePin}
                  title="Pin sidebar open"
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-current/10 border"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Back to Customer Storefront Pill */}
          <div className={`p-2.5 ${showFull ? "px-3" : "px-2"}`}>
            {showFull ? (
              <button
                type="button"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onSwitchToCustomerStore();
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition border ${
                  t.isDark
                    ? "bg-[#23221e] hover:bg-[#2c2a23] text-[#f5e7bf] border-[#353229]"
                    : "bg-[#2f3b44] hover:bg-[#384652] text-[#F2F2EB] border-[#3f4f5c]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#AB644B] shrink-0" />
                  <span className="truncate">Customer Storefront</span>
                </div>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onSwitchToCustomerStore();
                }}
                title="Back to Customer Storefront"
                aria-label="Back to Customer Storefront"
                className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition border ${
                  t.isDark
                    ? "bg-[#23221e] hover:bg-[#2c2a23] text-[#f5e7bf] border-[#353229]"
                    : "bg-[#2f3b44] hover:bg-[#384652] text-[#F2F2EB] border-[#3f4f5c]"
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#AB644B]" />
              </button>
            )}
          </div>

          {/* Navigation Sections */}
          <nav className={`space-y-4 py-2 ${showFull ? "px-3" : "px-2"}`}>
            {/* 1. SECTION: MAIN OVERVIEW */}
            <div className="space-y-1">
              {showFull ? (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                  Main Overview
                </div>
              ) : (
                <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("dashboard");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Dashboard"
                aria-label="Dashboard"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "dashboard"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "dashboard"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">Dashboard</span>}
              </button>
            </div>

            {/* 2. SECTION: CUSTOMER SUPPORT */}
            <div className="space-y-1">
              {showFull ? (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                  Customer Support
                </div>
              ) : (
                <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
              )}

              {/* Inbox */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("inbox");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Inbox (3-Column Live Chat)"
                aria-label="Inbox (3-Column Live Chat)"
                className={`flex items-center rounded-xl text-xs font-semibold transition relative ${
                  showFull
                    ? `w-full justify-between px-3 py-2 ${
                        activeTab === "inbox"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "inbox"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 shrink-0" />
                  {showFull && <span className="truncate">Inbox (3-Column)</span>}
                </div>
                {showFull ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500 text-white">
                    Live
                  </span>
                ) : (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Ticket Queue */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tickets");
                  if (onCloseMobile) onCloseMobile();
                }}
                title={`Ticket Queue (${ticketCount} open)`}
                aria-label={`Ticket Queue (${ticketCount} open)`}
                className={`flex items-center rounded-xl text-xs font-semibold transition relative ${
                  showFull
                    ? `w-full justify-between px-3 py-2 ${
                        activeTab === "tickets"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "tickets"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {showFull && <span className="truncate">Ticket Queue</span>}
                </div>
                {ticketCount > 0 &&
                  (showFull ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                      {ticketCount}
                    </span>
                  ) : (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                  ))}
              </button>

              {/* Customer 360 */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("customers");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Customer 360"
                aria-label="Customer 360"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "customers"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "customers"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">Customer 360</span>}
              </button>

              {/* AI Supervision */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ai_conversations");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="AI Supervision"
                aria-label="AI Supervision"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "ai_conversations"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "ai_conversations"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <Bot className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">AI Supervision</span>}
              </button>
            </div>

            {/* 3. SECTION: ECOMMERCE MANAGEMENT */}
            <div className="space-y-1">
              {showFull ? (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                  Ecommerce Management
                </div>
              ) : (
                <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
              )}

              {/* Orders Registry */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("orders");
                  if (onCloseMobile) onCloseMobile();
                }}
                title={`Orders Registry (${orderCount} orders)`}
                aria-label={`Orders Registry (${orderCount} orders)`}
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full justify-between px-3 py-2 ${
                        activeTab === "orders"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "orders"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 shrink-0" />
                  {showFull && <span className="truncate">Orders Registry</span>}
                </div>
                {orderCount > 0 &&
                  (showFull ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-current/20">
                      {orderCount}
                    </span>
                  ) : null)}
              </button>

              {/* Returns & Refunds */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("returns");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Returns & Refunds"
                aria-label="Returns & Refunds"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "returns"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "returns"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">Returns & Refunds</span>}
              </button>

              {/* Product Catalogue */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("products");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Product Catalogue"
                aria-label="Product Catalogue"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "products"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "products"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">Product Catalogue</span>}
              </button>
            </div>

            {/* 4. SECTION: KNOWLEDGE & ANALYTICS */}
            <div className="space-y-1">
              {showFull ? (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                  Knowledge & Analytics
                </div>
              ) : (
                <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
              )}

              {/* Knowledge Base (RAG) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("knowledge");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Knowledge Base (RAG Policy Articles)"
                aria-label="Knowledge Base (RAG Policy Articles)"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full justify-between px-3 py-2 ${
                        activeTab === "knowledge"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "knowledge"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {showFull && <span className="truncate">Knowledge Base (RAG)</span>}
                </div>
                {showFull && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${t.badgeHighlight}`}>
                    RAG
                  </span>
                )}
              </button>

              {/* Analytics & Reports (Supervisor & Admin) */}
              {(user?.role === "supervisor" || user?.role === "admin") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("analytics");
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Analytics & Intelligence Reports"
                  aria-label="Analytics & Intelligence Reports"
                  className={`flex items-center rounded-xl text-xs font-semibold transition ${
                    showFull
                      ? `w-full gap-2.5 px-3 py-2 ${
                          activeTab === "analytics"
                            ? t.sidebarTabActive
                            : t.sidebarTabInactive
                        }`
                      : `w-10 h-10 mx-auto justify-center ${
                          activeTab === "analytics"
                            ? t.sidebarTabActive
                            : t.sidebarTabInactive
                        }`
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {showFull && <span className="truncate">Analytics & Reports</span>}
                </button>
              )}

              {/* Telephony Voice AI */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("calls");
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Telephony Voice AI (Twilio IVR)"
                aria-label="Telephony Voice AI (Twilio IVR)"
                className={`flex items-center rounded-xl text-xs font-semibold transition ${
                  showFull
                    ? `w-full gap-2.5 px-3 py-2 ${
                        activeTab === "calls"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                    : `w-10 h-10 mx-auto justify-center ${
                        activeTab === "calls"
                          ? t.sidebarTabActive
                          : t.sidebarTabInactive
                      }`
                }`}
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                {showFull && <span className="truncate">Telephony Voice AI</span>}
              </button>
            </div>

            {/* 5. SECTION: SYSTEM ADMINISTRATION */}
            {user?.role === "admin" && (
              <div className="space-y-1">
                {showFull ? (
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                    System Administration
                  </div>
                ) : (
                  <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Settings & Role Access"
                  aria-label="Settings & Role Access"
                  className={`flex items-center rounded-xl text-xs font-semibold transition ${
                    showFull
                      ? `w-full gap-2.5 px-3 py-2 ${
                          activeTab === "settings"
                            ? t.sidebarTabActive
                            : t.sidebarTabInactive
                        }`
                      : `w-10 h-10 mx-auto justify-center ${
                          activeTab === "settings"
                            ? t.sidebarTabActive
                            : t.sidebarTabInactive
                        }`
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {showFull && (
                    <span className="truncate">Settings & Role Access</span>
                  )}
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* User Card, Theme Toggle & Logout */}
        <div className={`p-2.5 space-y-2 shrink-0 ${t.sidebarFooter} ${showFull ? "px-3" : "px-2"}`}>
          {/* Theme Mode Toggle Button */}
          {showFull ? (
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Warm Terracotta" : "Premium Gold"}`}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                t.isDark
                  ? "bg-[#23221e] hover:bg-[#2c2a23] border border-[#353229] text-[#f5e7bf]"
                  : "bg-[#2f3b44] hover:bg-[#384652] border border-[#3f4f5c] text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-3.5 h-3.5 text-[#d9a83e] shrink-0" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-[#AB644B] shrink-0" />
                )}
                <span>Theme Mode</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.badgeHighlight}`}>
                {theme === "dark" ? "Gold 🌙" : "Terracotta ☀️"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Warm Terracotta" : "Premium Gold"}`}
              className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition border ${
                t.isDark
                  ? "bg-[#23221e] hover:bg-[#2c2a23] border-[#353229] text-[#f5e7bf]"
                  : "bg-[#2f3b44] hover:bg-[#384652] border-[#3f4f5c] text-white"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-[#d9a83e]" />
              ) : (
                <Sun className="w-4 h-4 text-[#AB644B]" />
              )}
            </button>
          )}

          {/* User Card */}
          {showFull ? (
            <div
              className={`p-2.5 rounded-xl flex items-center justify-between border ${
                t.isDark
                  ? "bg-[#1c1b18] border-[#353229]"
                  : "bg-[#2f3b44] border-[#3f4f5c]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="text-xs font-bold truncate">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      user?.role === "admin"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : user?.role === "supervisor"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {user?.role === "admin"
                      ? "Admin"
                      : user?.role === "supervisor"
                      ? "Supervisor"
                      : "Agent"}
                  </span>
                  <span className="text-[10px] opacity-60 uppercase font-mono">
                    {user?.preferredLanguage || "EN"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Log out of staff session"
                className="p-1.5 opacity-60 hover:opacity-100 hover:text-rose-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div
                title={`${user?.name} (${user?.role})`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase border ${
                  user?.role === "admin"
                    ? "border-amber-500/50 text-amber-400"
                    : user?.role === "supervisor"
                    ? "border-purple-500/50 text-purple-400"
                    : "border-emerald-500/50 text-emerald-400"
                }`}
              >
                {user?.name?.slice(0, 2) || "U"}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1.5 opacity-60 hover:opacity-100 hover:text-rose-400 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Collapsible & Pinnable Sidebar Container */}
      <aside
        className={`hidden md:block h-screen shrink-0 relative transition-all duration-300 ease-in-out ${
          isPinned ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => {
          if (!isPinned) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (!isPinned) setIsHovered(false);
        }}
      >
        <div
          className={`h-full transition-all duration-300 ease-in-out ${
            isPinned
              ? "w-64 relative z-20"
              : isHovered
              ? "w-64 absolute inset-y-0 left-0 z-50 shadow-2xl border-r"
              : "w-20 relative z-20"
          }`}
        >
          {renderSidebarContent(false)}
        </div>
      </aside>

      {/* Mobile Slide-Over Scrim Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

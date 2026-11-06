import React, { useState } from "react";
import {
  Home,
  Package,
  ShoppingBag,
  Truck,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
  MessageCircle,
  BookOpen,
  User,
  LogOut,
  Sun,
  Moon,
  Pin,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";
import type { CustomerViewType } from "./CustomerNavbar";

interface CustomerSidebarProps {
  activeView: CustomerViewType;
  setActiveView: (view: CustomerViewType) => void;
  cartCount: number;
  orderCount: number;
  onOpenAiChat: () => void;
  onSwitchToStaffPanel?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeView,
  setActiveView,
  cartCount: _cartCount,
  orderCount,
  onOpenAiChat: _onOpenAiChat,
  onSwitchToStaffPanel,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = getThemeStyles(theme);

  // Pin State (persisted in localStorage, default: true)
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("shopease_customer_sidebar_pinned");
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
        localStorage.setItem("shopease_customer_sidebar_pinned", String(next));
      } catch (err) {
        console.error("Failed to save customer sidebar pin state", err);
      }
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  // Merged Clean Navigation Structure
  const navSections = [
    {
      heading: "Shopping",
      items: [
        { id: "home" as CustomerViewType, label: "Home", icon: Home, badge: null },
        { id: "products" as CustomerViewType, label: "Store Catalogue", icon: Package, badge: null },
      ],
    },
    {
      heading: "Orders & Logistics",
      items: [
        {
          id: "orders" as CustomerViewType,
          label: "My Orders",
          icon: ShoppingBag,
          badge: orderCount > 0 ? String(orderCount) : null,
        },
        { id: "track" as CustomerViewType, label: "Track Order", icon: Truck, badge: null },
        { id: "returns" as CustomerViewType, label: "Returns & Refunds", icon: RotateCcw, badge: null },
      ],
    },
    {
      heading: "Support & AI",
      items: [
        { id: "dashboard" as CustomerViewType, label: "My Dashboard", icon: LayoutDashboard, badge: null },
        { id: "assistant" as CustomerViewType, label: "AI Assistant", icon: Sparkles, badge: "AI" },
        { id: "support" as CustomerViewType, label: "My Support", icon: MessageCircle, badge: null },
        { id: "knowledge" as CustomerViewType, label: "Policies & FAQs", icon: BookOpen, badge: null },
      ],
    },
    {
      heading: "Account",
      items: [
        { id: "profile" as CustomerViewType, label: "My Profile", icon: User, badge: null },
      ],
    },
  ];

  const isStaff = user?.role === "agent" || user?.role === "supervisor" || user?.role === "admin";

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
                <div
                  onClick={() => {
                    setActiveView("home");
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${t.sidebarBrand}`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-sm tracking-tight truncate">
                      ShopEase<span className={t.accentText}>.ai</span>
                    </div>
                    <div className="text-[10px] opacity-75 truncate">
                      Customer Portal
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Pin Toggle Button */}
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={togglePin}
                      aria-label={
                        isPinned
                          ? "Unpin sidebar"
                          : "Pin sidebar open"
                      }
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
                      aria-label="Close navigation sidebar"
                      className="p-1 rounded-lg opacity-70 hover:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("home")}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 cursor-pointer ${t.sidebarBrand}`}
                  aria-label="ShopEase.ai Customer Portal Home"
                  title="ShopEase.ai Customer Portal"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={togglePin}
                  aria-label="Pin sidebar open"
                  title="Pin sidebar open"
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-current/10 border"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Switch to Admin Hub (If Staff) */}
          {isStaff && onSwitchToStaffPanel && (
            <div className={`p-2.5 ${showFull ? "px-3" : "px-2"}`}>
              {showFull ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    onSwitchToStaffPanel();
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition border ${
                    t.isDark
                      ? "bg-[#382f1c] hover:bg-[#4a3f25] text-[#f5e7bf] border-[#d9a83e]/50"
                      : "bg-[#124a38] hover:bg-[#185a45] text-white border-[#0e3b2c]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Admin Operations CRM</span>
                  </div>
                  <span>&rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    onSwitchToStaffPanel();
                  }}
                  title="Switch to Admin Operations CRM"
                  className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition border ${
                    t.isDark
                      ? "bg-[#382f1c] hover:bg-[#4a3f25] text-[#f5e7bf] border-[#d9a83e]/50"
                      : "bg-[#124a38] hover:bg-[#185a45] text-white border-[#0e3b2c]"
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Sections with Merged Clean Headings */}
          <nav className={`space-y-4 py-2 ${showFull ? "px-3" : "px-2"}`}>
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                {showFull ? (
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                    {sec.heading}
                  </div>
                ) : (
                  <div className="my-1.5 border-t border-current/10 w-8 mx-auto" />
                )}

                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveView(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={item.label}
                      className={`flex items-center rounded-xl text-xs font-semibold transition relative ${
                        showFull
                          ? `w-full justify-between px-3 py-2 ${
                              isActive ? t.sidebarTabActive : t.sidebarTabInactive
                            }`
                          : `w-10 h-10 mx-auto justify-center ${
                              isActive ? t.sidebarTabActive : t.sidebarTabInactive
                            }`
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        {showFull && <span className="truncate">{item.label}</span>}
                      </div>

                      {item.badge &&
                        (showFull ? (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                              isActive
                                ? "bg-white/20 text-white"
                                : t.badgeHighlight
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                        ))}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer: Theme Toggle & User Account */}
        <div className={`p-2.5 space-y-2 shrink-0 ${t.sidebarFooter} ${showFull ? "px-3" : "px-2"}`}>
          {/* Theme Mode Toggle Button */}
          {showFull ? (
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "Forest & Emerald" : "Premium Gold"}`}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                t.isDark
                  ? "bg-[#23221e] hover:bg-[#2c2a23] border border-[#353229] text-[#f5e7bf]"
                  : "bg-[#0e3b2c] hover:bg-[#15543f] border border-[#185a45] text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-3.5 h-3.5 text-[#d9a83e] shrink-0" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                )}
                <span>Theme Mode</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.badgeHighlight}`}>
                {theme === "dark" ? "Gold 🌙" : "Forest ☀️"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch theme to ${theme === "dark" ? "Forest & Emerald" : "Premium Gold"}`}
              title={`Switch to ${theme === "dark" ? "Forest & Emerald" : "Premium Gold"}`}
              className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition border ${
                t.isDark
                  ? "bg-[#23221e] hover:bg-[#2c2a23] border-[#353229] text-[#f5e7bf]"
                  : "bg-[#0e3b2c] hover:bg-[#15543f] border-[#185a45] text-white"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-[#d9a83e]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>
          )}

          {/* User Profile Card */}
          {showFull ? (
            <div
              className={`p-2.5 rounded-xl flex items-center justify-between border ${
                t.isDark
                  ? "bg-[#1c1b18] border-[#353229]"
                  : "bg-[#0e3b2c] border-[#185a45]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="text-xs font-bold truncate">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      user?.role === "customer"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {user?.role === "customer" ? "Customer" : user?.role}
                  </span>
                  <span className="text-[10px] opacity-75 uppercase font-mono">
                    {user?.preferredLanguage || "EN"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                aria-label="Sign out of customer session"
                title="Sign out of customer session"
                className="p-1.5 opacity-70 hover:opacity-100 hover:text-rose-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div
                title={`${user?.name} (${user?.role})`}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase border border-emerald-500/50 text-emerald-400"
              >
                {user?.name?.slice(0, 2) || "CU"}
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out of customer session"
                title="Log out"
                className="p-1.5 opacity-70 hover:opacity-100 hover:text-rose-400 rounded-lg transition"
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

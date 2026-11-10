import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  MessageCircle,
  Package,
  Truck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { useNotifications, type NotificationItem, type NotificationType } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (item: NotificationItem) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ticket_message":
      return <MessageCircle className="w-4 h-4 text-blue-400" />;
    case "order_created":
      return <Package className="w-4 h-4 text-amber-400" />;
    case "order_status":
      return <Truck className="w-4 h-4 text-emerald-400" />;
    case "ticket_created":
      return <Sparkles className="w-4 h-4 text-purple-400" />;
    case "escalation":
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    case "return_request":
      return <RotateCcw className="w-4 h-4 text-orange-400" />;
    default:
      return <Bell className="w-4 h-4 text-amber-400" />;
  }
};

const formatTimeAgo = (isoString: string): string => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(isoString).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onActionClick,
}) => {
  const { theme } = useTheme();
  const t = getThemeStyles(theme);
  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "orders" | "support">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.read;
    if (activeTab === "orders") return item.type.startsWith("order");
    if (activeTab === "support") return item.type.startsWith("ticket") || item.type === "escalation";
    return true;
  });

  const handleItemClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (onActionClick) {
      onActionClick(item);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-12 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl transition-all animate-in fade-in zoom-in-95 duration-200 ${
        t.isDark
          ? "bg-[#11100c]/98 border-amber-500/30 text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)]"
          : `${t.card} ${t.divider}`
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between transition-colors ${
          t.isDark ? "border-amber-500/20 bg-[#090806]/95" : `${t.divider} ${t.cardMuted}`
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 shadow-sm">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-65">Real-time alerts for orders, messages & AI</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? "Mute alert chime" : "Unmute alert chime"}
            aria-label={soundEnabled ? "Mute alert chime" : "Unmute alert chime"}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-current/10 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              title="Mark all as read"
              aria-label="Mark all as read"
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-current/10 transition"
            >
              <CheckCheck className="w-4 h-4 text-blue-400" />
            </button>
          )}

          {/* Clear all */}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              title="Clear all notifications"
              aria-label="Clear all notifications"
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:text-rose-400 hover:bg-current/10 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            title="Close notifications"
            aria-label="Close notifications"
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-current/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`px-3 py-2 border-b flex items-center gap-1.5 text-xs font-semibold ${t.divider}`}>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-2.5 py-1 rounded-xl text-[11px] transition ${
            activeTab === "all" ? t.badgeHighlight : "opacity-60 hover:opacity-100"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`px-2.5 py-1 rounded-xl text-[11px] transition ${
            activeTab === "unread" ? t.badgeHighlight : "opacity-60 hover:opacity-100"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-2.5 py-1 rounded-xl text-[11px] transition ${
            activeTab === "orders" ? t.badgeHighlight : "opacity-60 hover:opacity-100"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`px-2.5 py-1 rounded-xl text-[11px] transition ${
            activeTab === "support" ? t.badgeHighlight : "opacity-60 hover:opacity-100"
          }`}
        >
          Support
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-current/10 scrollbar-none">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2 opacity-60">
            <Bell className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
            <div className="text-xs font-bold">All caught up!</div>
            <p className="text-[11px]">No notifications in this category right now.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors text-left focus:outline-none ${
                !item.read
                  ? t.isDark
                    ? "bg-amber-500/10 hover:bg-amber-500/15"
                    : "bg-emerald-500/10 hover:bg-emerald-500/15"
                  : "hover:bg-current/5"
              }`}
            >
              {/* Type Icon Badge */}
              <div
                className={`p-2.5 rounded-2xl shrink-0 border ${
                  t.isDark ? "bg-[#181611] border-amber-500/30" : "bg-[#9CABB4] border-[#8396a1]"
                }`}
              >
                {getNotificationIcon(item.type)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs truncate">{item.title}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] opacity-60">{formatTimeAgo(item.timestamp)}</span>
                    {!item.read && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </div>
                </div>

                <p className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {item.linkAction && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline">
                    <span>Take Action</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className={`p-2.5 border-t text-center text-[10px] opacity-60 font-mono ${
          t.isDark ? "bg-[#090806]" : t.cardMuted
        }`}
      >
        <span>⚡ ShopEase Real-Time Event Bus Connected</span>
      </div>
    </div>
  );
};

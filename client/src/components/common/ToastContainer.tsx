import React from "react";
import { X, ExternalLink, MessageCircle, Package, Truck, Sparkles, AlertTriangle, RotateCcw, Bell } from "lucide-react";
import { useNotifications, type NotificationItem, type NotificationType } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";
import { getThemeStyles } from "../../utils/themeStyles";

interface ToastContainerProps {
  onActionClick?: (item: NotificationItem) => void;
}

const getToastIcon = (type: NotificationType) => {
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

export const ToastContainer: React.FC<ToastContainerProps> = ({ onActionClick }) => {
  const { activeToasts, dismissToast, markAsRead } = useNotifications();
  const { theme } = useTheme();
  const t = getThemeStyles(theme);

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-32px)] pointer-events-none"
    >
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border shadow-2xl p-3.5 backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in overflow-hidden relative ${
            t.isDark
              ? "bg-[#14120e]/95 border-amber-500/40 text-neutral-100 shadow-[0_15px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)]"
              : "bg-[#9CABB4] border-[#8396a1] text-[#141c22] shadow-xl"
          }`}
        >
          {/* Top Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`p-2 rounded-xl shrink-0 border ${
                  t.isDark ? "bg-[#1f1c16] border-amber-500/30" : "bg-[#D2DCE6] border-[#8396a1]"
                }`}
              >
                {getToastIcon(toast.type)}
              </div>
              <div>
                <h4 className="font-extrabold text-xs tracking-tight">{toast.title}</h4>
                <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-current/10 transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row */}
          {toast.linkAction && (
            <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  markAsRead(toast.id);
                  dismissToast(toast.id);
                  if (onActionClick) onActionClick(toast);
                }}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition active:scale-95 ${
                  t.isDark
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-800 hover:bg-emerald-500/30"
                }`}
              >
                <span>View Now</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <span className="text-[9px] opacity-50 font-mono">Live WebSocket</span>
            </div>
          )}

          {/* Progress Timer Bar */}
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-current/10 overflow-hidden">
            <div
              className={`h-full ${t.isDark ? "bg-amber-400" : "bg-emerald-500"}`}
              style={{
                animation: "toastProgress 6s linear forwards",
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

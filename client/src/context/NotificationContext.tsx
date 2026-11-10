import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

export type NotificationType =
  | "ticket_message"
  | "ticket_created"
  | "ticket_status"
  | "order_created"
  | "order_status"
  | "escalation"
  | "return_request";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkAction?: {
    panel: "customer" | "admin";
    view?: string;
    adminTab?: string;
    ticketId?: string;
    ticketNumber?: string;
    orderId?: string;
    orderNumber?: string;
  };
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  activeToasts: NotificationItem[];
  dismissToast: (id: string) => void;
  addNotification: (item: {
    type: NotificationType;
    title: string;
    message: string;
    linkAction?: NotificationItem["linkAction"];
    metadata?: Record<string, unknown>;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Synthesized gentle notification chime using Web Audio API
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // E5 (659.25Hz) to G#5 (830.61Hz) gentle futuristic gold chime
    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(659.25, now);
    osc2.frequency.setValueAtTime(830.61, now + 0.08);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Ignore audio autoplay policy restrictions
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || (user as { _id?: string })?._id || "guest";

  const storageKey = `shopease_notifications_${userId}`;

  // 1. Initial State from LocalStorage
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: "welcome-notif-1",
        type: "ticket_status" as NotificationType,
        title: "Welcome to ShopEase Omnichannel!",
        message: "Live real-time alerts for orders, tickets, and AI carrier telemetry are active.",
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
  });

  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("shopease_notif_sound");
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (userId) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notifications.slice(0, 50)));
      } catch {}
    }
  }, [notifications, storageKey, userId]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("shopease_notif_sound", String(next));
      if (next) playNotificationChime();
      return next;
    });
  };

  const dismissToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback(
    (item: {
      type: NotificationType;
      title: string;
      message: string;
      linkAction?: NotificationItem["linkAction"];
      metadata?: Record<string, unknown>;
    }) => {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...item,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);

      // Add to floating toast queue
      setActiveToasts((prev) => [newNotif, ...prev.slice(0, 2)]);

      // Play soft chime if enabled
      if (soundEnabled) {
        playNotificationChime();
      }

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        dismissToast(newNotif.id);
      }, 6000);
    },
    [soundEnabled, dismissToast]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setActiveToasts([]);
  }, []);

  // 2. Connect to Real-Time WebSockets
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleServerNotification = (payload: NotificationItem) => {
      setNotifications((prev) => {
        // Prevent duplicate IDs
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev.slice(0, 49)];
      });

      setActiveToasts((prev) => [payload, ...prev.slice(0, 2)]);

      if (soundEnabled) {
        playNotificationChime();
      }

      setTimeout(() => {
        dismissToast(payload.id);
      }, 6000);
    };

    socket.on("notification:new", handleServerNotification);

    return () => {
      socket.off("notification:new", handleServerNotification);
    };
  }, [user, soundEnabled, dismissToast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        markAsRead,
        markAllAsRead,
        clearAll,
        activeToasts,
        dismissToast,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

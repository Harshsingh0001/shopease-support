import { io, Socket } from "socket.io-client";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = localStorage.getItem("shopease_token");

  if (!socket || socket.disconnected) {
    socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("⚡ Real-time WebSocket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ WebSocket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

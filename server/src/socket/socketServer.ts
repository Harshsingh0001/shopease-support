import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User, { type UserRole } from "../models/User.js";
import Ticket from "../models/Ticket.js";

export interface SocketUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: SocketUser;
  };
}

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
          origin === env.CLIENT_URL ||
          env.NODE_ENV !== "production"
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"), false);
        }
      },
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // 1. Authentication Middleware for WebSockets
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization
        ? socket.handshake.headers.authorization.replace("Bearer ", "")
        : null);

    if (!token) {
      return next(new Error("Authentication token required for WebSocket connection"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: UserRole };
      const user = await User.findById(decoded.sub).select("name role status").lean();

      if (!user) {
        return next(new Error("User not found"));
      }

      if (user.status === "suspended") {
        return next(new Error("Account is suspended"));
      }

      (socket as AuthenticatedSocket).data.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      };

      next();
    } catch {
      return next(new Error("Invalid authentication token"));
    }
  });

  // 2. Connection and Room Management
  io.on("connection", (socketRaw) => {
    const socket = socketRaw as AuthenticatedSocket;
    const { id, name, role } = socket.data.user;

    // Join isolated ticket room
    socket.on("ticket:join", async ({ ticketId }: { ticketId: string }) => {
      try {
        const ticket = await Ticket.findById(ticketId).lean();
        if (!ticket) {
          return socket.emit("error", { message: "Ticket not found" });
        }

        // Customer Permission Check: Customers can only join their own ticket room
        if (role === "customer" && ticket.customerId.toString() !== id) {
          return socket.emit("error", { message: "Unauthorized ticket access" });
        }

        // Public room for ticket participants
        socket.join(`ticket:${ticketId}`);

        // Staff-only room for confidential internal notes
        if (role === "agent" || role === "supervisor" || role === "admin") {
          socket.join(`ticket:${ticketId}:staff`);
        }

        socket.emit("ticket:joined", { ticketId });
      } catch (err) {
        socket.emit("error", { message: "Failed to join ticket room" });
      }
    });

    // Leave ticket room
    socket.on("ticket:leave", ({ ticketId }: { ticketId: string }) => {
      socket.leave(`ticket:${ticketId}`);
      socket.leave(`ticket:${ticketId}:staff`);
      socket.emit("ticket:left", { ticketId });
    });

    // Typing Indicators
    socket.on("typing:start", ({ ticketId }: { ticketId: string }) => {
      socket.to(`ticket:${ticketId}`).emit("typing:update", {
        ticketId,
        userName: name,
        userRole: role,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ ticketId }: { ticketId: string }) => {
      socket.to(`ticket:${ticketId}`).emit("typing:update", {
        ticketId,
        userName: name,
        userRole: role,
        isTyping: false,
      });
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet!");
  }
  return io;
};

/**
 * Broadcast new message with strict privacy barriers:
 * - Public messages: Broadcast to room `ticket:${ticketId}`
 * - Internal notes: Broadcast ONLY to `ticket:${ticketId}:staff`
 */
export const emitNewMessage = (ticketId: string, message: unknown): void => {
  if (!io) return;

  const msg = message as { visibility?: string };

  if (msg.visibility === "internal_note") {
    // ONLY staff receives confidential internal notes
    io.to(`ticket:${ticketId}:staff`).emit("message:new", message);
  } else {
    // Both customer and staff receive public messages
    io.to(`ticket:${ticketId}`).emit("message:new", message);
  }
};

/**
 * Broadcast newly created ticket to staff
 */
export const emitTicketCreated = (ticket: unknown): void => {
  if (!io) return;
  io.emit("ticket:created", ticket);
};

/**
 * Broadcast ticket status/priority changes
 */
export const emitTicketUpdated = (ticketId: string, ticket: unknown): void => {
  if (!io) return;
  io.to(`ticket:${ticketId}`).emit("ticket:updated", ticket);
};

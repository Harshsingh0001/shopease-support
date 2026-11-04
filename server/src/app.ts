import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import adminKnowledgeRoutes from "./routes/adminKnowledgeRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "1mb" }));

// Health-check endpoint
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEase AI Support API is running smoothly",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/knowledge", knowledgeRoutes);
app.use("/api/v1/admin/knowledge", adminKnowledgeRoutes);
app.use("/api/v1/conversations", conversationRoutes);

// 404 Route Handler for any unmatched route
app.use((req, _res, next) => {
  next(AppError.notFound(`Cannot find route ${req.method} ${req.originalUrl} on this server`));
});

// Centralized Error Handling Middleware (must be last)
app.use(errorHandler);

export default app;

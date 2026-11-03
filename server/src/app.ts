
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

// Security headers
app.use(helmet());

// Allow requests from our frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse incoming JSON data BEFORE routes
app.use(express.json());

app.use("/api/v1/conversations", conversationRoutes);

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Health-check API
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEase AI Support API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;

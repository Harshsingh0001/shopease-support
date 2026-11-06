import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./config/db.js";
import { initSocketServer } from "./socket/socketServer.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 ShopEase API running in ${env.NODE_ENV} mode at http://localhost:${env.PORT}`);
      console.log(`🏥 Health check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`⚡ WebSocket Server attached & ready on port ${env.PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      httpServer.close(async () => {
        console.log("🔒 HTTP & WebSocket server closed.");
        try {
          const mongoose = (await import("mongoose")).default;
          await mongoose.connection.close();
          console.log("📦 MongoDB connection closed gracefully.");
        } catch (e) {
          console.error("Error closing Mongo connection:", e);
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

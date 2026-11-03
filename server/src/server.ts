import app from "./app.js";
import { env } from "./config/env.js";
import connectDB from "./config/db.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 ShopEase API running in ${env.NODE_ENV} mode at http://localhost:${env.PORT}`);
      console.log(`🏥 Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const shutdown = (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("🔒 HTTP server closed.");
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

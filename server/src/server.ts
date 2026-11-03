import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`ShopEase API running at http://localhost:${PORT}`);
      console.log(
        `Health check: http://localhost:${PORT}/api/v1/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
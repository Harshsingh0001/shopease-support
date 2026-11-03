import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { z } from "zod";

// Automatically locate .env either in cwd or in server directory
const localEnvPath = path.resolve(process.cwd(), ".env");
const serverEnvPath = path.resolve(process.cwd(), "server", ".env");

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment configuration:");
    const errors = result.error.flatten().fieldErrors;
    for (const [field, messages] of Object.entries(errors)) {
      console.error(`  - ${field}: ${messages?.join(", ")}`);
    }
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();

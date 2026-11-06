import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const isTestEnv = env.NODE_ENV === "test";

/**
 * Global API rate limiter:
 * 300 requests per 15-minute window
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 0 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: "fail",
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  skip: () => isTestEnv,
});

/**
 * Strict Auth rate limiter:
 * 20 attempts per 15-minute window
 * Prevents password brute force and credential stuffing attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTestEnv ? 0 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: "fail",
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skip: () => isTestEnv,
});

/**
 * AI Query rate limiter:
 * 60 queries per minute
 * Protects LLM quotas, token usage, and prevents automated spam
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTestEnv ? 0 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    status: "fail",
    message: "AI query rate limit reached. Please wait a moment before asking again.",
  },
  skip: () => isTestEnv,
});

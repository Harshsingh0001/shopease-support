import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Known Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // 2. Zod Schema Validation Error
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      status: "fail",
      message: "Validation failed",
      errors: issues,
    });
    return;
  }

  // 3. MongoDB Duplicate Key (code 11000)
  if (typeof err === "object" && err !== null && "code" in err && (err as MongoDuplicateKeyError).code === 11000) {
    const keyError = err as MongoDuplicateKeyError;
    const duplicateFields = keyError.keyValue ? Object.keys(keyError.keyValue).join(", ") : "field";
    res.status(409).json({
      success: false,
      status: "fail",
      message: `A record with this ${duplicateFields} already exists`,
    });
    return;
  }

  // 4. Mongoose CastError (e.g. invalid ObjectId)
  if (typeof err === "object" && err !== null && "name" in err && (err as { name: string }).name === "CastError") {
    res.status(400).json({
      success: false,
      status: "fail",
      message: "Invalid resource identifier format",
    });
    return;
  }

  // 5. Unknown / Unexpected Errors (Bug or System Error)
  const isDev = env.NODE_ENV === "development";
  console.error("💥 Unhandled Error:", err);

  res.status(500).json({
    success: false,
    status: "error",
    message: isDev && err instanceof Error ? err.message : "Internal server error",
    ...(isDev && err instanceof Error && { stack: err.stack }),
  });
};

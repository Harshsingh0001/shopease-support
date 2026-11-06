import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import type { UserRole } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

interface JwtTokenPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Authentication Middleware:
 * Verifies JWT token in the Authorization header.
 */
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Authentication token is required"));
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return next(AppError.unauthorized("Authentication token is missing"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;

    if (
      !decoded.sub ||
      !["customer", "agent", "supervisor", "admin"].includes(decoded.role)
    ) {
      return next(AppError.unauthorized("Invalid token payload"));
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized("Token has expired. Please login again."));
    }
    return next(AppError.unauthorized("Invalid authentication token"));
  }
};

/**
 * Authorization Middleware (RBAC):
 * Restricts access to specific user roles.
 */
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized("You must be logged in to access this resource"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden("You do not have permission to perform this action")
      );
    }

    next();
  };
};


import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "admin";
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token is required",
    });
    return;
  }

  const token = authorization.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      typeof decoded.sub !== "string" ||
      (decoded.role !== "customer" && decoded.role !== "admin")
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};

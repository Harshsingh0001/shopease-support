import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { type UserRole, type UserLanguage } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, preferredLanguage } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
      preferredLanguage?: UserLanguage;
    };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("An account with this email already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      preferredLanguage: preferredLanguage || "en",
      status: "active",
      isVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user and issue JWT token
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(AppError.unauthorized("Invalid email or password"));
    }

    if (user.status === "suspended") {
      return next(AppError.forbidden("Your account has been suspended. Please contact support."));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(AppError.unauthorized("Invalid email or password"));
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user details
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return next(AppError.notFound("User not found"));
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

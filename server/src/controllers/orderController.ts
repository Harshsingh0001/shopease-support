import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * Get all orders for the currently authenticated customer
 */
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {
      customerId: req.user!.id,
    };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ placedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get an order by its ID or orderNumber with strict ownership checks
 */
export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { _id: id } : { orderNumber: id.toUpperCase() };

    const order = await Order.findOne(filter).lean();

    if (!order) {
      return next(AppError.notFound("Order not found"));
    }

    // Strict Ownership Enforcement:
    // Customers can ONLY access their own orders.
    // Support agents and admins can view any order to provide assistance.
    const isOwner = order.customerId.toString() === req.user!.id;
    const isStaff = req.user!.role === "agent" || req.user!.role === "admin";

    if (!isOwner && !isStaff) {
      return next(
        AppError.forbidden("You do not have permission to access this order")
      );
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders across the system (Staff only: Agents & Admins)
 */
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const status = req.query.status as string | undefined;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customerId", "name email")
        .sort({ placedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

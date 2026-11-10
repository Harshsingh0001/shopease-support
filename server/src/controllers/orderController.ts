import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import {
  emitNotificationToUser,
  emitNotificationToStaff,
  emitOrderCreated,
  emitOrderStatusUpdated,
} from "../socket/socketServer.js";

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

/**
 * Create a new order (Customer checkout)
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, shippingAddress } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(AppError.badRequest("Order must contain at least one item"));
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * (item.quantity || 1),
      0
    );

    const count = await Order.countDocuments();
    const orderNumber = `ORD-${1000 + count + 1}`;
    const placedAt = new Date();
    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      orderNumber,
      customerId: req.user!.id,
      items: items.map((i: any) => ({
        productId: i.productId || i.product?._id || new mongoose.Types.ObjectId(),
        name: i.name || i.product?.name || "Product",
        price: i.price || i.product?.price || 0,
        quantity: i.quantity || 1,
      })),
      totalAmount,
      status: "processing",
      placedAt,
      estimatedDelivery,
      shippingAddress: shippingAddress || {
        street: "Flat 402, Greenfield Heights",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560102",
        country: "India",
      },
      carrier: "Delhivery Express",
      trackingNumber: `DLH${Math.floor(100000000 + Math.random() * 900000000)}`,
    });

    // Real-Time Notification to Customer
    emitNotificationToUser(req.user!.id, {
      id: new mongoose.Types.ObjectId().toString(),
      type: "order_created",
      title: "Order Confirmed! 🛍️",
      message: `Order #${order.orderNumber} placed for ₹${order.totalAmount.toLocaleString("en-IN")}. Live tracking active via ${order.carrier}.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkAction: {
        panel: "customer",
        view: "track",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Real-Time Notification to Staff
    emitNotificationToStaff({
      id: new mongoose.Types.ObjectId().toString(),
      type: "order_created",
      title: `New Order #${order.orderNumber}`,
      message: `${req.user!.name || "Customer"} placed an order for ₹${order.totalAmount.toLocaleString("en-IN")} (${order.items.length} items)`,
      timestamp: new Date().toISOString(),
      read: false,
      linkAction: {
        panel: "admin",
        adminTab: "orders",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    emitOrderCreated(order);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (Staff only: Agents & Admins)
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, carrier, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(status && { status }),
          ...(carrier && { carrier }),
          ...(trackingNumber && { trackingNumber }),
        },
      },
      { new: true }
    );
    if (!order) {
      return next(AppError.notFound("Order not found"));
    }

    // Real-Time Notification to Customer
    emitNotificationToUser(order.customerId.toString(), {
      id: new mongoose.Types.ObjectId().toString(),
      type: "order_status",
      title: `Shipment Update: #${order.orderNumber} 🚚`,
      message: `Your order is now: ${order.status.replace("_", " ").toUpperCase()} with ${order.carrier}.`,
      timestamp: new Date().toISOString(),
      read: false,
      linkAction: {
        panel: "customer",
        view: "track",
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    emitOrderStatusUpdated(order.customerId.toString(), order);

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

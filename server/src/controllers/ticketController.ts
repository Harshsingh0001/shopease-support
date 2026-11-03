import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import Ticket, { type TicketCategory, type TicketPriority, type TicketStatus, type TicketChannel } from "../models/Ticket.js";
import Message, { type MessageVisibility } from "../models/Message.js";
import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";
import { AppError } from "../utils/AppError.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * Generate a unique, readable ticket number like TCK-849301
 */
const generateTicketNumber = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TCK-${random}`;
};

/**
 * Helper: Resolve ticket by MongoDB ObjectId or ticketNumber
 */
const findTicketByIdOrNumber = async (identifier: string) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const filter = isObjectId ? { _id: identifier } : { ticketNumber: identifier.toUpperCase() };
  return Ticket.findOne(filter);
};

/**
 * Create a new support ticket
 */
export const createTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject, category, priority, orderId, initialMessage, channel } = req.body as {
      subject: string;
      category: TicketCategory;
      priority?: TicketPriority;
      orderId?: string;
      initialMessage?: string;
      channel?: TicketChannel;
    };

    let verifiedOrderId: mongoose.Types.ObjectId | undefined;

    // If customer links an order, verify ownership!
    if (orderId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
      const orderFilter = isObjectId ? { _id: orderId } : { orderNumber: orderId.toUpperCase() };
      const order = await Order.findOne(orderFilter);

      if (!order) {
        return next(AppError.notFound("Linked order not found"));
      }

      if (req.user!.role === "customer" && order.customerId.toString() !== req.user!.id) {
        return next(AppError.forbidden("You cannot link an order that does not belong to you"));
      }

      verifiedOrderId = order._id as mongoose.Types.ObjectId;
    }

    const ticketNumber = generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      customerId: req.user!.id,
      orderId: verifiedOrderId,
      subject,
      category,
      priority: priority || "medium",
      channel: channel || "web_chat",
      status: "open",
      lastMessageAt: new Date(),
    });

    let firstMessage;
    if (initialMessage) {
      firstMessage = await Message.create({
        ticketId: ticket._id,
        senderId: req.user!.id,
        senderRole: req.user!.role,
        body: initialMessage,
        visibility: "customer",
      });
    }

    // Log ticket creation audit
    await AuditLog.create({
      actorId: req.user!.id,
      action: "ticket_created",
      resourceType: "ticket",
      resourceId: ticket._id,
      details: {
        ticketNumber: ticket.ticketNumber,
        category: ticket.category,
        priority: ticket.priority,
      },
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
      initialMessage: firstMessage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tickets belonging to current customer
 */
export const getMyTickets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as TicketStatus | undefined;

    const filter: Record<string, unknown> = { customerId: req.user!.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("orderId", "orderNumber status totalAmount")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tickets,
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
 * Staff view: Get all tickets across platform with filters (Agents/Admins)
 */
export const getStaffTickets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const status = req.query.status as TicketStatus | undefined;
    const priority = req.query.priority as TicketPriority | undefined;
    const category = req.query.category as TicketCategory | undefined;
    const assignedAgentId = req.query.assignedAgentId as string | undefined;
    const unassigned = String(req.query.unassigned) === "true";

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    if (unassigned) {
      filter.assignedAgentId = null;
    } else if (assignedAgentId) {
      filter.assignedAgentId = assignedAgentId;
    }

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("customerId", "name email preferredLanguage")
        .populate("assignedAgentId", "name email")
        .populate("orderId", "orderNumber status")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tickets,
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
 * Get ticket details by ID or ticketNumber
 */
export const getTicketById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const ticket = await findTicketByIdOrNumber(id);

    if (!ticket) {
      return next(AppError.notFound("Ticket not found"));
    }

    // Ownership check: Customer can only view their own ticket
    const isOwner = ticket.customerId.toString() === req.user!.id;
    const isStaff = req.user!.role === "agent" || req.user!.role === "admin";

    if (!isOwner && !isStaff) {
      return next(AppError.forbidden("You do not have permission to view this ticket"));
    }

    await ticket.populate([
      { path: "customerId", select: "name email preferredLanguage" },
      { path: "assignedAgentId", select: "name email" },
      { path: "orderId", select: "orderNumber status totalAmount placedAt estimatedDelivery" },
    ]);

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update ticket status, priority, or assignment
 */
export const updateTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, priority, assignedAgentId } = req.body as {
      status?: TicketStatus;
      priority?: TicketPriority;
      assignedAgentId?: string | null;
    };

    const ticket = await findTicketByIdOrNumber(id);
    if (!ticket) {
      return next(AppError.notFound("Ticket not found"));
    }

    const isOwner = ticket.customerId.toString() === req.user!.id;
    const isStaff = req.user!.role === "agent" || req.user!.role === "admin";

    // Customers can ONLY mark their own ticket as closed/resolved
    if (!isStaff) {
      if (!isOwner) {
        return next(AppError.forbidden("You do not have permission to update this ticket"));
      }
      if (priority || assignedAgentId !== undefined || (status && status !== "closed" && status !== "resolved")) {
        return next(AppError.forbidden("Customers can only close or resolve their own ticket"));
      }
    }

    const previousStatus = ticket.status;
    const previousPriority = ticket.priority;
    const previousAgent = ticket.assignedAgentId?.toString();

    if (status) {
      ticket.status = status;
      if (status === "resolved") ticket.resolvedAt = new Date();
      if (status === "closed") ticket.closedAt = new Date();
    }
    if (priority && isStaff) {
      ticket.priority = priority;
    }
    if (assignedAgentId !== undefined && isStaff) {
      ticket.assignedAgentId = assignedAgentId
        ? (new mongoose.Types.ObjectId(assignedAgentId) as unknown as mongoose.Types.ObjectId)
        : undefined;
    }

    await ticket.save();

    // Record Audit Logs for staff actions
    if (status && status !== previousStatus) {
      await AuditLog.create({
        actorId: req.user!.id,
        action: "status_changed",
        resourceType: "ticket",
        resourceId: ticket._id,
        details: { from: previousStatus, to: status },
      });
    }

    if (assignedAgentId !== undefined && assignedAgentId !== previousAgent) {
      await AuditLog.create({
        actorId: req.user!.id,
        action: "ticket_assigned",
        resourceType: "ticket",
        resourceId: ticket._id,
        details: { from: previousAgent, to: assignedAgentId },
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages inside a ticket
 * PRIVACY GUARD: Customers NEVER see 'internal_note' messages!
 */
export const getTicketMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const ticket = await findTicketByIdOrNumber(id);

    if (!ticket) {
      return next(AppError.notFound("Ticket not found"));
    }

    const isOwner = ticket.customerId.toString() === req.user!.id;
    const isStaff = req.user!.role === "agent" || req.user!.role === "admin";

    if (!isOwner && !isStaff) {
      return next(AppError.forbidden("You do not have permission to access this ticket's messages"));
    }

    // STRICT PRIVACY BARRIER:
    // Customers can only see visibility: "customer".
    // Staff members can see both "customer" and "internal_note".
    const filter: Record<string, unknown> = { ticketId: ticket._id };
    if (!isStaff) {
      filter.visibility = "customer";
    }

    const messages = await Message.find(filter)
      .populate("senderId", "name role")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message or internal note to a ticket
 */
export const sendTicketMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { body, visibility } = req.body as {
      body: string;
      visibility?: MessageVisibility;
    };

    const ticket = await findTicketByIdOrNumber(id);
    if (!ticket) {
      return next(AppError.notFound("Ticket not found"));
    }

    const isOwner = ticket.customerId.toString() === req.user!.id;
    const isStaff = req.user!.role === "agent" || req.user!.role === "admin";

    if (!isOwner && !isStaff) {
      return next(AppError.forbidden("You do not have permission to post messages to this ticket"));
    }

    if (ticket.status === "closed") {
      return next(AppError.badRequest("This ticket is closed. Please open a new ticket."));
    }

    // Customers CANNOT create internal notes
    const messageVisibility: MessageVisibility = isStaff && visibility === "internal_note"
      ? "internal_note"
      : "customer";

    const message = await Message.create({
      ticketId: ticket._id,
      senderId: req.user!.id,
      senderRole: req.user!.role,
      body,
      visibility: messageVisibility,
    });

    // Update ticket activity
    ticket.lastMessageAt = new Date();

    // State machine updates:
    // If customer replies while ticket was waiting for customer, move to in_progress
    if (!isStaff && ticket.status === "waiting_customer") {
      ticket.status = "in_progress";
    }
    await ticket.save();

    // If internal note was added, audit log it
    if (messageVisibility === "internal_note") {
      await AuditLog.create({
        actorId: req.user!.id,
        action: "internal_note_added",
        resourceType: "ticket",
        resourceId: ticket._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

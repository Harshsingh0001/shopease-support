import mongoose, { Schema, type Document } from "mongoose";
import type { UserLanguage } from "./User.js";

export type TicketCategory =
  | "order_issue"
  | "product_inquiry"
  | "return_request"
  | "general"
  | "complaint";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

export type TicketChannel = "web_chat" | "email" | "voice";

export interface ITicket extends Document {
  ticketNumber: string;
  customerId: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  channel: TicketChannel;
  language: UserLanguage;
  lastMessageAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: [true, "Ticket number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
      index: true,
    },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      minlength: [3, "Subject must be at least 3 characters"],
      maxlength: [150, "Subject cannot exceed 150 characters"],
    },
    category: {
      type: String,
      enum: [
        "order_issue",
        "product_inquiry",
        "return_request",
        "general",
        "complaint",
      ],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_customer", "resolved", "closed"],
      default: "open",
      index: true,
    },
    channel: {
      type: String,
      enum: ["web_chat", "email", "voice"],
      default: "web_chat",
    },
    language: {
      type: String,
      enum: ["en", "hi", "hinglish"],
      default: "en",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-frequency queries
ticketSchema.index({ customerId: 1, status: 1 });
ticketSchema.index({ assignedAgentId: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;

import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters"),
  category: z.enum([
    "order_issue",
    "product_inquiry",
    "return_request",
    "general",
    "complaint",
  ]),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional()
    .default("medium"),
  orderId: z.string().trim().optional(),
  initialMessage: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters")
    .optional(),
  channel: z
    .enum(["web_chat", "email", "voice"])
    .optional()
    .default("web_chat"),
});

export const updateTicketSchema = z.object({
  status: z
    .enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedAgentId: z.string().trim().nullable().optional(),
});

export const getTicketsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z
    .enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  category: z
    .enum([
      "order_issue",
      "product_inquiry",
      "return_request",
      "general",
      "complaint",
    ])
    .optional(),
  assignedAgentId: z.string().optional(),
  unassigned: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
});

export const createTicketMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
  visibility: z.enum(["customer", "internal_note"]).optional().default("customer"),
});

export const ticketIdParamSchema = z.object({
  id: z.string().trim().min(1, "Ticket ID is required"),
});

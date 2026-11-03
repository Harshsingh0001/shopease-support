import { z } from "zod";

export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});

export const orderLookupParamSchema = z.object({
  id: z.string().trim().min(1, "Order identifier is required"),
});

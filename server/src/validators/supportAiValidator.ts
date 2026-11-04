import { z } from "zod";

export const askSupportSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),
  ticketId: z.string().trim().optional(),
});

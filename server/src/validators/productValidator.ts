import { z } from "zod";

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

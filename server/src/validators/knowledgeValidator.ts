import { z } from "zod";

export const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(180, "Title cannot exceed 180 characters"),
  slug: z.string().trim().toLowerCase().optional(),
  body: z
    .string()
    .trim()
    .min(10, "Article content must be at least 10 characters"),
  category: z.enum([
    "shipping",
    "returns",
    "refunds",
    "warranty",
    "orders",
    "general",
  ]),
  tags: z.array(z.string().trim()).optional().default([]),
  language: z.enum(["en", "hi", "hinglish"]).optional().default("en"),
  published: z.boolean().optional().default(false),
});

export const updateArticleSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  slug: z.string().trim().toLowerCase().optional(),
  body: z.string().trim().min(10).optional(),
  category: z
    .enum(["shipping", "returns", "refunds", "warranty", "orders", "general"])
    .optional(),
  tags: z.array(z.string().trim()).optional(),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  published: z.boolean().optional(),
});

export const searchKnowledgeQuerySchema = z.object({
  query: z.string().trim().optional(),
  category: z.string().trim().optional(),
  language: z.enum(["en", "hi", "hinglish"]).optional(),
  tag: z.string().trim().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

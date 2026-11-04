import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import KnowledgeArticle, { type ArticleCategory } from "../models/KnowledgeArticle.js";
import { AppError } from "../utils/AppError.js";

/**
 * Public Search for Knowledge Articles (PUBLISHED ONLY)
 */
export const searchKnowledge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.query as string | undefined;
    const category = req.query.category as ArticleCategory | undefined;
    const language = req.query.language as string | undefined;
    const tag = req.query.tag as string | undefined;

    // STRICT ISOLATION: Only published articles are visible publicly or to the AI RAG engine!
    const filter: Record<string, unknown> = { published: true };

    if (category) {
      filter.category = category;
    }

    if (language) {
      filter.language = language;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter)
        .select("-__v")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      KnowledgeArticle.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        articles,
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
 * Public Retrieve a Single Article by Slug or ID (PUBLISHED ONLY)
 */
export const getArticleBySlugOrId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = String(req.params.idOrSlug);
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const filter: Record<string, unknown> = {
      published: true, // MUST BE PUBLISHED
      ...(isObjectId ? { _id: identifier } : { slug: identifier.toLowerCase() }),
    };

    const article = await KnowledgeArticle.findOne(filter).lean();

    if (!article) {
      return next(AppError.notFound("Article not found or not published"));
    }

    res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public: List all distinct categories with published articles
 */
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await KnowledgeArticle.distinct("category", { published: true });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

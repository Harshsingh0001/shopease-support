import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import KnowledgeArticle, { type ArticleCategory } from "../models/KnowledgeArticle.js";
import { AppError } from "../utils/AppError.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import type { UserLanguage } from "../models/User.js";

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Admin: Create a new knowledge article (draft or published)
 */
export const createArticle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, slug, body, category, tags, language, published } = req.body as {
      title: string;
      slug?: string;
      body: string;
      category: ArticleCategory;
      tags?: string[];
      language?: UserLanguage;
      published?: boolean;
    };

    const finalSlug = slug || slugify(title);

    const existingSlug = await KnowledgeArticle.findOne({ slug: finalSlug });
    if (existingSlug) {
      return next(
        new AppError("An article with this slug or title already exists", 409)
      );
    }

    const article = await KnowledgeArticle.create({
      title,
      slug: finalSlug,
      body,
      category,
      tags: tags || [],
      language: language || "en",
      published: published ?? false,
      authorId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "Knowledge article created successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all articles (including unpublished drafts)
 */
export const getAllArticles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const published = req.query.published as string | undefined;
    const category = req.query.category as ArticleCategory | undefined;

    const filter: Record<string, unknown> = {};
    if (published !== undefined) {
      filter.published = published === "true";
    }
    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter)
        .populate("authorId", "name email role")
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
 * Admin: Update knowledge article
 */
export const updateArticle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(AppError.badRequest("Invalid article ID"));
    }

    const article = await KnowledgeArticle.findById(id);
    if (!article) {
      return next(AppError.notFound("Knowledge article not found"));
    }

    const { title, slug, body, category, tags, language, published } = req.body;

    if (title) article.title = title;
    if (slug) article.slug = slug.toLowerCase();
    if (body) article.body = body;
    if (category) article.category = category;
    if (tags) article.tags = tags;
    if (language) article.language = language;
    if (published !== undefined) article.published = published;

    await article.save();

    res.status(200).json({
      success: true,
      message: "Knowledge article updated successfully",
      article,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete knowledge article
 */
export const deleteArticle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(AppError.badRequest("Invalid article ID"));
    }

    const article = await KnowledgeArticle.findByIdAndDelete(id);
    if (!article) {
      return next(AppError.notFound("Knowledge article not found"));
    }

    res.status(200).json({
      success: true,
      message: "Knowledge article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

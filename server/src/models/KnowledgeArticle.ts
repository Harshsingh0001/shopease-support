import mongoose, { Schema, type Document } from "mongoose";
import type { UserLanguage } from "./User.js";

export type ArticleCategory =
  | "shipping"
  | "returns"
  | "refunds"
  | "warranty"
  | "orders"
  | "general";

export interface IKnowledgeArticle extends Document {
  title: string;
  slug: string;
  body: string;
  category: ArticleCategory;
  tags: string[];
  language: UserLanguage;
  published: boolean;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: {
      type: String,
      required: [true, "Article title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [180, "Title cannot exceed 180 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    body: {
      type: String,
      required: [true, "Article body content is required"],
      trim: true,
      minlength: [10, "Article content must be at least 10 characters"],
    },
    category: {
      type: String,
      enum: ["shipping", "returns", "refunds", "warranty", "orders", "general"],
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "hi", "hinglish"],
      default: "en",
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for RAG & keyword search
knowledgeArticleSchema.index({
  title: "text",
  body: "text",
  tags: "text",
});

knowledgeArticleSchema.index({ published: 1, category: 1, language: 1 });

const KnowledgeArticle = mongoose.model<IKnowledgeArticle>(
  "KnowledgeArticle",
  knowledgeArticleSchema
);

export default KnowledgeArticle;

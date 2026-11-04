import { Router } from "express";
import {
  searchKnowledge,
  getArticleBySlugOrId,
  getCategories,
} from "../controllers/knowledgeController.js";
import { validate } from "../middleware/validate.js";
import { searchKnowledgeQuerySchema } from "../validators/knowledgeValidator.js";

const router = Router();

// Public: Search published articles
router.get("/search", validate({ query: searchKnowledgeQuerySchema }), searchKnowledge);

// Public: List categories
router.get("/categories", getCategories);

// Public: Get single article by slug or ObjectId (published only)
router.get("/:idOrSlug", getArticleBySlugOrId);

export default router;

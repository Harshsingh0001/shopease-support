import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  updateArticle,
  deleteArticle,
} from "../controllers/adminKnowledgeController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../validators/knowledgeValidator.js";

const router = Router();

// Strictly protect all admin knowledge routes (accessible by support staff: agents & admins)
router.use(authMiddleware, restrictTo("admin", "supervisor", "agent"));

// Create new article (draft or published)
router.post("/", validate({ body: createArticleSchema }), createArticle);

// List all articles (including drafts)
router.get("/", getAllArticles);

// Update article (content or published toggle)
router.patch("/:id", validate({ body: updateArticleSchema }), updateArticle);

// Delete article
router.delete("/:id", deleteArticle);

export default router;

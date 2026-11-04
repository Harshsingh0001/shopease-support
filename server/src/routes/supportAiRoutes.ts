import { Router } from "express";
import { askSupport, generateDraft } from "../controllers/supportAiController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { askSupportSchema } from "../validators/supportAiValidator.js";

const router = Router();

// Protect all support AI routes
router.use(authMiddleware);

// Customer Support AI endpoint
router.post("/ask", validate({ body: askSupportSchema }), askSupport);

// Agent Copilot: Generate AI draft reply for a ticket (Staff only)
router.post("/tickets/:id/ai-draft", restrictTo("agent", "admin"), generateDraft);

export default router;

import { Router } from "express";
import { askSupport, generateDraft } from "../controllers/supportAiController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { askSupportSchema } from "../validators/supportAiValidator.js";

const router = Router();

// Protect all support AI routes
router.use(authMiddleware);

// Customer Support AI endpoint (Rate limited)
router.post("/ask", aiLimiter, validate({ body: askSupportSchema }), askSupport);

// Agent & Supervisor Copilot: Generate AI draft reply for a ticket (Staff only)
router.post("/tickets/:id/ai-draft", restrictTo("agent", "supervisor", "admin"), generateDraft);

export default router;

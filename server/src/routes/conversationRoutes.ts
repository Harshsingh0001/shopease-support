
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createConversation,
  getMyConversations,
  getConversationById,
} from "../controllers/conversationController.js";
import {
  createMessage,
  getConversationMessages,
} from "../controllers/messageController.js";
const router = Router();

router.use(authMiddleware);

router.post("/", createConversation);
router.get("/", getMyConversations);

router.post("/:id/messages", createMessage);
router.get("/:id/messages", getConversationMessages);

router.get("/:id", getConversationById);

export default router;

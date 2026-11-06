import { Router } from "express";
import {
  handleInboundCall,
  handleProcessSpeech,
  handleTransfer,
  handleStatusCallback,
  getCallLogs,
  getCallLogById,
} from "../controllers/voiceController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

// Public Telephony Webhooks (Twilio / Plivo / Exotel / In-browser telephony)
router.post("/inbound", handleInboundCall);
router.post("/process-speech", handleProcessSpeech);
router.post("/transfer", handleTransfer);
router.post("/status-callback", handleStatusCallback);

// Protected Staff Management Endpoints (Agent, Supervisor, and Admin)
router.get("/logs", authMiddleware, restrictTo("agent", "supervisor", "admin"), getCallLogs);
router.get("/logs/:id", authMiddleware, restrictTo("agent", "supervisor", "admin"), getCallLogById);

export default router;

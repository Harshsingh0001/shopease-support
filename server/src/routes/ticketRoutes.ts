import { Router } from "express";
import {
  createTicket,
  getMyTickets,
  getStaffTickets,
  getTicketById,
  updateTicket,
  getTicketMessages,
  sendTicketMessage,
} from "../controllers/ticketController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTicketSchema,
  updateTicketSchema,
  getTicketsQuerySchema,
  createTicketMessageSchema,
  ticketIdParamSchema,
} from "../validators/ticketValidator.js";

const router = Router();

// All ticket routes require authentication
router.use(authMiddleware);

// Create a new ticket
router.post("/", validate({ body: createTicketSchema }), createTicket);

// Customer: Get my tickets
router.get("/me", validate({ query: getTicketsQuerySchema }), getMyTickets);

// Staff (Agents & Admins): View ticket queue with filtering
router.get(
  "/staff",
  restrictTo("agent", "admin"),
  validate({ query: getTicketsQuerySchema }),
  getStaffTickets
);

// Get single ticket by ID or ticketNumber
router.get("/:id", validate({ params: ticketIdParamSchema }), getTicketById);

// Update ticket status, priority, or assigned agent
router.patch(
  "/:id",
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  updateTicket
);

// Messages in ticket
router.get(
  "/:id/messages",
  validate({ params: ticketIdParamSchema }),
  getTicketMessages
);

router.post(
  "/:id/messages",
  validate({ params: ticketIdParamSchema, body: createTicketMessageSchema }),
  sendTicketMessage
);

export default router;

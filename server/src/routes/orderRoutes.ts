import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  getOrdersQuerySchema,
  orderLookupParamSchema,
} from "../validators/orderValidator.js";

const router = Router();

// Protect all order routes with authentication
router.use(authMiddleware);

// Customer: create order from cart checkout
router.post("/", createOrder);

// Customer: list own orders
router.get("/me", validate({ query: getOrdersQuerySchema }), getMyOrders);

// Staff (Agents, Supervisors & Admins): list all orders across the platform
router.get(
  "/all",
  restrictTo("agent", "supervisor", "admin"),
  validate({ query: getOrdersQuerySchema }),
  getAllOrders
);

// Staff (Agents, Supervisors & Admins): update order status and tracking
router.patch(
  "/:id/status",
  restrictTo("agent", "supervisor", "admin"),
  updateOrderStatus
);

// Get specific order by ID or orderNumber (with ownership validation)
router.get("/:id", validate({ params: orderLookupParamSchema }), getOrderById);

export default router;

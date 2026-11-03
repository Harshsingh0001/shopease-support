import { Router } from "express";
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
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

// Customer: list own orders
router.get("/me", validate({ query: getOrdersQuerySchema }), getMyOrders);

// Staff (Agents & Admins): list all orders across the platform
router.get(
  "/all",
  restrictTo("agent", "admin"),
  validate({ query: getOrdersQuerySchema }),
  getAllOrders
);

// Get specific order by ID or orderNumber (with ownership validation)
router.get("/:id", validate({ params: orderLookupParamSchema }), getOrderById);

export default router;

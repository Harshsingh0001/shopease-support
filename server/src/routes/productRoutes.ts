import { Router } from "express";
import { getProducts, getProductById } from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";
import {
  getProductsQuerySchema,
  productIdParamSchema,
} from "../validators/productValidator.js";

const router = Router();

// Public catalogue routes
router.get("/", validate({ query: getProductsQuerySchema }), getProducts);
router.get("/:id", validate({ params: productIdParamSchema }), getProductById);

export default router;

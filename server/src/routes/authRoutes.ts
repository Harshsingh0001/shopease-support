import { Router } from "express";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;

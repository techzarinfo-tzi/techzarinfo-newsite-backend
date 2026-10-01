import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import * as rules from "../validators/auth.validator.js";
import validate from "../middleware/validate.js";
import { verifyTokenUnlessNoUsers } from "../middleware/auth.js";
import { loginLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/store-register", verifyTokenUnlessNoUsers, rules.register, validate, auth.register);
router.post("/store-login", loginLimiter, rules.login, validate, auth.login);
router.post("/forgot-password", passwordResetLimiter, rules.forgotPassword, validate, auth.forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, rules.resetPassword, validate, auth.resetPassword);

export default router;

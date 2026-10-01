import { Router } from "express";
import * as chat from "../controllers/chat.controller.js";
import * as rules from "../validators/chat.validator.js";
import validate from "../middleware/validate.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// Admin: website chatbot conversations
router.get("/chat-conversations", verifyToken, rules.list, validate, chat.list);
router.get("/chat-conversations/:id", verifyToken, rules.getById, validate, chat.getById);

export default router;

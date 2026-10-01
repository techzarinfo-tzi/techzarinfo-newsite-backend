import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import * as dashboard from "../controllers/dashboard.controller.js";
import authRoutes from "./auth.routes.js";
import enquiryRoutes from "./enquiry.routes.js";
import postRoutes from "./post.routes.js";
import careerRoutes from "./career.routes.js";
import chatRoutes from "./chat.routes.js";

const router = Router();

router.use(authRoutes);
router.use(enquiryRoutes);
router.use(postRoutes);
router.use(careerRoutes);
router.use(chatRoutes);

router.get("/dashboard", verifyToken, dashboard.stats);

export default router;

import { Router } from "express";
import * as career from "../controllers/career.controller.js";
import * as rules from "../validators/career.validator.js";
import validate from "../middleware/validate.js";
import { verifyToken } from "../middleware/auth.js";
import { formWithoutFile } from "../middleware/upload.js";

const router = Router();

// The admin panel posts careers as multipart forms; careers have no image,
// so any uploaded file is discarded.
router.post("/store-careers", verifyToken, formWithoutFile("image"), rules.create, validate, career.create);
router.post("/edit-careers/:id", verifyToken, formWithoutFile("image"), rules.update, validate, career.update);
router.get("/delete-career/:careers_id", verifyToken, rules.remove, validate, career.remove);
router.get("/get-careers", career.list);
router.get("/get-careers/:id", rules.getById, validate, career.getById);

export default router;

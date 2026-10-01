import { Router } from "express";
import * as post from "../controllers/post.controller.js";
import * as rules from "../validators/post.validator.js";
import validate from "../middleware/validate.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Admin
router.post("/store-post", verifyToken, upload.single("image"), rules.create, validate, post.create);
router.post("/edit-post/:id", verifyToken, upload.single("image"), rules.update, validate, post.update);
router.get("/get-post", verifyToken, post.listAll);
router.get("/delete-post/:post_id", verifyToken, rules.byId, validate, post.remove);

// Public. Order matters: the specific /get-post/* patterns must come before
// the /get-post/:post_title catch-all.
router.get("/get-post-by-type/:type", rules.byType, validate, post.listByType);
router.get("/get-post/:limit&:page", rules.pagination, validate, post.listPage);
router.get("/get-post/:limit/:page/:type", rules.byType, validate, post.listPageByType);
router.get("/get-post/Home", post.listHome);
router.get("/get-post/:post_title", post.getBySlug);
router.get("/get-blog/:post_id", rules.byId, validate, post.getById);

export default router;

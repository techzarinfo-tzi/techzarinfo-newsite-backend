import { Router } from "express";
import * as enquiry from "../controllers/enquiry.controller.js";
import * as rules from "../validators/enquiry.validator.js";
import { mongoId } from "../validators/common.js";
import validate from "../middleware/validate.js";
import { verifyToken } from "../middleware/auth.js";
import { formLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// Contact us
router.post("/store-data", formLimiter, rules.contact, validate, enquiry.submitContact);
router.post("/contact-popup", formLimiter, rules.contactPopup, validate, enquiry.submitContact);
router.get("/get-contact", verifyToken, enquiry.listContacts);
router.get("/delete-contact/:con_id", verifyToken, mongoId("con_id"), validate, enquiry.deleteContact);

// Hire a developer
router.post("/store-hire-a-developer", formLimiter, rules.hireDeveloper, validate, enquiry.submitHireDeveloper);
router.get("/get-hire", verifyToken, enquiry.listHires);
router.get("/delete-hire/:dev_id", verifyToken, mongoId("dev_id"), validate, enquiry.deleteHire);

export default router;

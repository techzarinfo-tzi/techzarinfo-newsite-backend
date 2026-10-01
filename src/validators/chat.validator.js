import { query } from "express-validator";
import { mongoId } from "./common.js";

export const list = [
  query("page", "page must be a positive number").optional().isInt({ min: 1 }).toInt(),
  query("limit", "limit must be between 1 and 100").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search")
    .optional()
    .isString()
    .withMessage("search must be text")
    .bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage("search must be at most 200 characters"),
  query("visitorId", "visitorId must be a visitor ID").optional().isString().bail().isUUID().bail().toLowerCase(),
];

export const getById = [mongoId("id")];

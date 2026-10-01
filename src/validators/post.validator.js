import { body, param } from "express-validator";
import { POST_TYPES } from "../models/Post.js";
import { requiredText, optionalText, mongoId } from "./common.js";

const fields = [
  requiredText("meta_title", "Meta title is required", 300),
  requiredText("meta_description", "Meta description is required", 1000),
  requiredText("keywords", "Keywords is required", 1000),
  requiredText("slug", "Slug is required", 200)
    .matches(/^[^\s/?#]+$/)
    .withMessage("No spaces are allowed in the slug"),
  requiredText("title", "title is required", 300)
    .isLength({ min: 6 })
    .withMessage("Title must be at least 6 chars long"),
  requiredText("message", "Message is required", 500000),
  body("type", "Type is required").isIn(POST_TYPES).withMessage("Invalid type"),
  optionalText("schema", 50000),
];

export const create = fields;
export const update = [mongoId("id"), ...fields];
export const byId = [mongoId("post_id")];

export const pagination = [
  param("limit").isInt({ min: 1, max: 100 }).toInt(),
  param("page").isInt({ min: 1, max: 100000 }).toInt(),
];

export const byType = [param("type").isString().isLength({ max: 100 })];

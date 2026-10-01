import { requiredText, mongoId } from "./common.js";

const MESSAGE_MAX = 100000;

export const create = [
  requiredText("title", "title is required", 300),
  requiredText("message", "Message is required", MESSAGE_MAX),
];

export const update = [
  mongoId("id"),
  requiredText("title", "title is required", 300)
    .isLength({ min: 6 })
    .withMessage("Title must be at least 6 chars long"),
  requiredText("message", "Message is required", MESSAGE_MAX),
];

export const getById = [mongoId("id")];
export const remove = [mongoId("careers_id")];

import { body, param } from "express-validator";

// Required string field: rejects arrays/objects, trims, and caps the length
export const requiredText = (field, message, max = 200) =>
  body(field, message)
    .isString()
    .bail()
    .trim()
    .notEmpty()
    .bail()
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

export const optionalText = (field, max) =>
  body(field)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${field} must be text`)
    .bail()
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

export const email = (options = {}) =>
  body("email", "Email is required")
    .isString()
    .bail()
    .trim()
    .isEmail()
    .bail()
    .isLength({ max: 254 })
    .normalizeEmail(options);

export const mongoId = (name) => param(name, "Invalid id").isMongoId();

import { body } from "express-validator";
import { requiredText, email } from "./common.js";

const MESSAGE_MAX = 5000;

export const contact = [
  requiredText("name", "Name is required", 100),
  email(),
  body("phone", "Phone number is required")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 5, max: 15 })
    .withMessage("Phone no. must be between 5 and 15 characters"),
  requiredText("country", "Country is required", 100),
  requiredText("service", "Service is required", 200),
  requiredText("message", "Message is required", MESSAGE_MAX),
];

export const contactPopup = [
  requiredText("name", "Name is required", 100),
  email(),
  requiredText("phone", "Mobile number is required", 20),
  requiredText("service", "Service is required", 200),
  requiredText("message", "Message is required", MESSAGE_MAX),
];

export const hireDeveloper = [
  requiredText("name", "Full Name is required", 100)
    .isLength({ min: 6 })
    .withMessage("Full Name must be at least 6 chars long"),
  email(),
  body("phone", "Phone number is required")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone no. must be 10 digits"),
  requiredText("company", "Company / Organization is required", 200),
  requiredText("message", "Message is required", MESSAGE_MAX),
];
